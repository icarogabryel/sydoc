import * as vscode from 'vscode';
import { findSydocProjects } from './projects/discovery';
import { SydocProject } from './projects/project';
import { configureMarkdownIt } from './preview/markdownIt';
import { buildPreviewNavigation } from './preview/navigation';
import { buildNavigationModel } from './preview/navigationModel';

const previewProjects = new Map<string, SydocProject>();
const previewNavigations = new Map<string, string>();
const previewDocumentUris = new Map<string, vscode.Uri>();
const navigationModels = new Map<string, Awaited<ReturnType<typeof buildNavigationModel>>>();

function getUriKey(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const uri = value as vscode.Uri;
  return typeof uri.toString === 'function'
    ? uri.toString()
    : undefined;
}

function getProjectKey(project: SydocProject): string {
  return project.root.toString();
}

export function activate(
  context: vscode.ExtensionContext,
): {
  extendMarkdownIt(markdownIt: unknown): unknown;
} {
  const openDocumentation = vscode.commands.registerCommand(
    'sydoc.openDocumentation',
    async () => {
      const workspace = vscode.workspace.workspaceFolders?.[0];

      if (!workspace) {
        vscode.window.showWarningMessage(
          'Sydoc: Open a workspace first.',
        );
        return;
      }

      const projects = await findSydocProjects(workspace.uri);

      vscode.window.showInformationMessage(
        `Sydoc: Found ${projects.length} project(s).`,
      );
    },
  );

  const initializeDocumentation = vscode.commands.registerCommand(
    'sydoc.initializeDocumentation',
    async () => {
      const folder = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: 'Initialize Sydoc',
      });

      if (!folder || folder.length === 0) {
        return;
      }

      const configFile = vscode.Uri.joinPath(
        folder[0],
        'sydoc.yml',
      );

      await vscode.workspace.fs.writeFile(
        configFile,
        Buffer.from(''),
      );

      vscode.window.showInformationMessage(
        'Sydoc: Project initialized.',
      );
    },
  );

  void (async () => {
    const workspaces = vscode.workspace.workspaceFolders ?? [];

    for (const workspace of workspaces) {
      const projects = await findSydocProjects(workspace.uri);

      for (const project of projects) {
        const projectKey = getProjectKey(project);
        const model = await buildNavigationModel(project);
        navigationModels.set(projectKey, model);

        const documents = await vscode.workspace.findFiles(
          new vscode.RelativePattern(project.root, '**/*.md'),
        );

        for (const documentUri of documents) {
          const documentKey = documentUri.toString();
          previewProjects.set(documentKey, project);
          previewDocumentUris.set(documentKey, documentUri);
          previewNavigations.set(
            documentKey,
            buildPreviewNavigation(model, documentUri),
          );
        }

        const watcher = vscode.workspace.createFileSystemWatcher(
          new vscode.RelativePattern(workspace, '**/*'),
        );
        const refresh = (uri: vscode.Uri) => {
          const projectPath = project.root.path.endsWith('/')
            ? project.root.path
            : `${project.root.path}/`;

          if (
            uri.path !== project.root.path
            && !uri.path.startsWith(projectPath)
          ) {
            return;
          }

          void (async () => {
            const updatedModel = await buildNavigationModel(project);
            navigationModels.set(projectKey, updatedModel);

            for (const [documentKey, documentProject] of previewProjects) {
              if (getProjectKey(documentProject) !== projectKey) {
                continue;
              }

              const documentUri = previewDocumentUris.get(documentKey);
              if (documentUri) {
                previewNavigations.set(
                  documentKey,
                  buildPreviewNavigation(updatedModel, documentUri),
                );
              }
            }

            await vscode.commands.executeCommand('markdown.preview.refresh');
          })();
        };

        watcher.onDidCreate(refresh);
        watcher.onDidChange(refresh);
        watcher.onDidDelete(refresh);
        context.subscriptions.push(watcher);
      }
    }
  })();

  context.subscriptions.push(
    openDocumentation,
    initializeDocumentation,
  );

  return {
    extendMarkdownIt(markdownIt: unknown): unknown {
      return configureMarkdownIt(
        markdownIt,
        (documentUri) => {
          const documentKey = getUriKey(documentUri);
          return documentKey !== undefined
            && previewProjects.has(documentKey);
        },
        (documentUri) => {
          const documentKey = getUriKey(documentUri);
          return documentKey
            ? previewNavigations.get(documentKey) ?? ''
            : '';
        },
      );
    },
  };
}

export function deactivate() { }
