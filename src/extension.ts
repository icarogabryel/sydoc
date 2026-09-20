import * as vscode from 'vscode';
import {
  findSydocProjectForFile,
  findSydocProjects,
} from './discovery';
import { SydocProject } from './project';
import { SydocNavigationProvider } from './navigation';
import { SydocOutlineProvider } from './outline';
import { findHeadings } from './headings';

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
        activeProject = undefined;

        if (!editor) {
          navigation.setProject(undefined);
          return;
        }

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

          outline.setHeadings(headings);
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
    openDocumentation,
    initializeDocumentation,
    activeEditorChanged,
    navigationProvider,
    outlineProvider,
  );
}

export function deactivate() { }
