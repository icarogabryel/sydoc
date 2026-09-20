import * as vscode from 'vscode';
import { config } from './config';
import { SydocProject } from './project';

export async function findSydocProject(
  directory: vscode.Uri,
): Promise<SydocProject | undefined> {
  const configFile = vscode.Uri.joinPath(
    directory,
    config.configFileName,
  );

  try {
    await vscode.workspace.fs.stat(configFile);

    return {
      root: directory,
      configFile,
    };
  } catch {
    return undefined;
  }
}
