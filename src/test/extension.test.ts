import * as assert from 'assert';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import * as vscode from 'vscode';
import {
  findSydocProjectForFile,
  findSydocProjects,
} from '../projects/discovery';
import { configureMarkdownIt } from '../preview/markdownIt';
import { buildPreviewNavigation } from '../preview/navigation';
import { buildNavigationModel } from '../preview/navigationModel';

suite('Extension Test Suite', () => {
  const temporaryRoots: vscode.Uri[] = [];

  teardown(async () => {
    await Promise.all(
      temporaryRoots.splice(0).map((root) => (
        vscode.workspace.fs.delete(root, {
          recursive: true,
          useTrash: false,
        })
      )),
    );
  });

  async function createTemporaryRoot(): Promise<vscode.Uri> {
    const root = vscode.Uri.file(
      fs.mkdtempSync(path.join(os.tmpdir(), 'sydoc-test-')),
    );
    temporaryRoots.push(root);
    return root;
  }

  async function createDirectory(
    parent: vscode.Uri,
    name: string,
  ): Promise<vscode.Uri> {
    const directory = vscode.Uri.joinPath(parent, name);
    await vscode.workspace.fs.createDirectory(directory);
    return directory;
  }

  async function createFile(file: vscode.Uri): Promise<void> {
    await vscode.workspace.fs.writeFile(file, Buffer.from(''));
  }

  test('finds nested projects and ignores configured directories', async () => {
    const root = await createTemporaryRoot();
    const nested = await createDirectory(root, 'docs');
    const ignored = await createDirectory(root, 'node_modules');

    await createFile(vscode.Uri.joinPath(root, 'sydoc.yml'));
    await createFile(vscode.Uri.joinPath(nested, 'sydoc.yml'));
    await createFile(vscode.Uri.joinPath(ignored, 'sydoc.yml'));

    const projects = await findSydocProjects(root);

    assert.deepStrictEqual(
      projects.map((project) => project.root.toString()).sort(),
      [root.toString(), nested.toString()].sort(),
    );
  });

  test('finds the nearest project for a document', async () => {
    const root = await createTemporaryRoot();
    const nested = await createDirectory(root, 'docs');
    const document = vscode.Uri.joinPath(nested, 'guide.md');

    await createFile(vscode.Uri.joinPath(root, 'sydoc.yml'));
    await createFile(vscode.Uri.joinPath(nested, 'sydoc.yml'));
    await createFile(document);

    const project = await findSydocProjectForFile(document);

    assert.ok(project);
    assert.strictEqual(project.root.toString(), nested.toString());
  });

  test('builds document-relative navigation links', async () => {
    const root = await createTemporaryRoot();
    const guides = await createDirectory(root, 'guides');
    const currentDocument = vscode.Uri.joinPath(guides, 'current.md');
    const guide = vscode.Uri.joinPath(root, 'guide.md');

    await createFile(vscode.Uri.joinPath(root, 'sydoc.yml'));
    await createFile(currentDocument);
    await createFile(guide);

    const model = await buildNavigationModel({
      root,
      configFile: vscode.Uri.joinPath(root, 'sydoc.yml'),
    });
    const navigation = buildPreviewNavigation(model, currentDocument);

    assert.match(
      navigation,
      /<h2 class="sydoc-preview__title">Documentation<\/h2>/,
    );
    assert.match(navigation, /href="\.\.\/guide\.md"/);
    assert.match(navigation, /<ul>/);
  });

  test('wraps active Markdown previews and leaves inactive previews unchanged', () => {
    const documentUri = vscode.Uri.parse('file:///workspace/docs/guide.md');
    const markdownIt = {
      renderer: {
        render: (..._args: unknown[]) => '<h1>Guide</h1>',
      },
    };

    const active = configureMarkdownIt(
      markdownIt,
      (uri) => uri === documentUri,
      () => '<h2>Documentation</h2>',
    ) as typeof markdownIt;
    const inactive = configureMarkdownIt(
      { renderer: { render: () => '<h1>Guide</h1>' } },
      () => false,
      () => '',
    ) as { renderer: { render: () => string } };

    const activeHtml = active.renderer.render(
      'source',
      {},
      { currentDocument: documentUri },
    );

    assert.match(activeHtml, /class="sydoc-preview__content"/);
    assert.match(activeHtml, /<h2>Documentation<\/h2>/);
    assert.strictEqual(inactive.renderer.render(), '<h1>Guide</h1>');
  });
});
