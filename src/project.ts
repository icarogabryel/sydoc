import * as vscode from 'vscode';

export interface SydocProject {
  root: vscode.Uri;
  configFile: vscode.Uri;
}
