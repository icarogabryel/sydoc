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

  context.subscriptions.push(openDocumentation);
}

export function deactivate() { }
