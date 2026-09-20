import * as vscode from 'vscode';
import { findSydocProject } from './discovery';

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

      const project = await findSydocProject(workspace.uri);

      if (!project) {
        vscode.window.showInformationMessage(
          'Sydoc: No Sydoc project found.',
        );
        return;
      }

      vscode.window.showInformationMessage(
        'Sydoc: Sydoc project found.',
      );
    },
  );

  context.subscriptions.push(openDocumentation);
}

export function deactivate() { }
