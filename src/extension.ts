import * as vscode from 'vscode';
import { findSydocProjects } from './discovery';

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

  context.subscriptions.push(openDocumentation, initializeDocumentation);
}

export function deactivate() { }
