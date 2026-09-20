import * as vscode from 'vscode';
import { config } from '../core/config';
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

export async function findSydocProjects(
  directory: vscode.Uri,
): Promise<SydocProject[]> {
  const projects: SydocProject[] = [];

  const project = await findSydocProject(directory);

  if (project) {
    projects.push(project);
  }

  const entries = await vscode.workspace.fs.readDirectory(directory);

  for (const [name, type] of entries) {
    if (type !== vscode.FileType.Directory) {
      continue;
    }

    if (config.ignoredDirectories.has(name)) {
      continue;
    }

    const childDirectory = vscode.Uri.joinPath(directory, name);
    const childProjects = await findSydocProjects(childDirectory);

    projects.push(...childProjects);
  }

  return projects;
}

export async function findSydocProjectForFile(
  file: vscode.Uri,
): Promise<SydocProject | undefined> {
  let directory = vscode.Uri.joinPath(file, '..');

  while (true) {
    const project = await findSydocProject(directory);

    if (project) {
      return project;
    }

    const parent = vscode.Uri.joinPath(directory, '..');

    if (parent.toString() === directory.toString()) {
      return undefined;
    }

    directory = parent;
  }
}
