import * as vscode from 'vscode';
import {
  findSydocProjectForFile,
  findSydocProjects,
} from './projects/discovery';
import { SydocProject } from './projects/project';
import { SydocNavigationProvider } from './views/navigation';
import { SydocOutlineProvider } from './views/outline';
import { findHeadings } from './markdown/headings';

let activeProject: SydocProject | undefined;

async function getSydocProject(
  document: vscode.TextDocument,
) {
  if (document.languageId !== 'markdown') {
    return undefined;
  }

  return findSydocProjectForFile(document.uri);
}

export function activate(context: vscode.ExtensionContext) {
  const revealHeading = vscode.commands.registerCommand(
    'sydoc.revealHeading',
    (line: number, documentUri?: vscode.Uri) => {
      const editor = documentUri
        ? vscode.window.visibleTextEditors.find(
          (visibleEditor) => visibleEditor.document.uri.toString()
            === documentUri.toString(),
        )
        : vscode.window.activeTextEditor;

      if (!editor || editor.document.languageId !== 'markdown') {
        return;
      }

      const position = new vscode.Position(line, 0);
      const range = new vscode.Range(position, position);

      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        range,
        vscode.TextEditorRevealType.AtTop,
      );
    },
  );

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

  const activeEditorChanged =
    vscode.window.onDidChangeActiveTextEditor(
      async (editor) => {
        if (!editor) {
          return;
        }

        activeProject = undefined;
        activeProject = await getSydocProject(
          editor.document,
        );

        navigation.setProject(activeProject);

        if (
          editor &&
          editor.document.languageId === 'markdown'
        ) {
          const headings = await findHeadings(
            editor.document,
          );

          outline.setHeadings(headings, editor.document.uri);
        } else {
          outline.setHeadings([]);
        }
      },
    );

  const navigation =
    new SydocNavigationProvider();

  const navigationProvider =
    vscode.window.registerTreeDataProvider(
      'sydoc.navigation',
      navigation,
    );

  const outline = new SydocOutlineProvider();

  const outlineProvider =
    vscode.window.registerTreeDataProvider(
      'sydoc.outline',
      outline,
    );

  context.subscriptions.push(
    revealHeading,
    openDocumentation,
    initializeDocumentation,
    activeEditorChanged,
    navigationProvider,
    outlineProvider,
  );
}

export function deactivate() { }
