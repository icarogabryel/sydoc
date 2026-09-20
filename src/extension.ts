import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "sydoc" is now active!');

  const disposable = vscode.commands.registerCommand('sydoc.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Sydoc!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
