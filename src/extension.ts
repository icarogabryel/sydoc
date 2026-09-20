import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const openDocumentation = vscode.commands.registerCommand(
    'sydoc.openDocumentation',
    () => {
      vscode.window.showInformationMessage(
        'Sydoc: Documentation'
      );
    }
  );

  context.subscriptions.push(openDocumentation);
}

export function deactivate() { }
