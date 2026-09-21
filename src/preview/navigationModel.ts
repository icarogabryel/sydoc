import * as vscode from 'vscode';
import { config } from '../core/config';
import { SydocProject } from '../projects/project';

export interface NavigationNode {
  name: string;
  type: vscode.FileType;
  uri: vscode.Uri;
  children: NavigationNode[];
}

async function buildDirectoryModel(
  directory: vscode.Uri,
): Promise<NavigationNode[]> {
  const entries = await vscode.workspace.fs.readDirectory(directory);
  const visibleEntries = entries
    .filter(([name, type]) => {
      if (name.startsWith('.')) {
        return false;
      }

      if (
        type === vscode.FileType.Directory
        && config.ignoredDirectories.has(name)
      ) {
        return false;
      }

      return type === vscode.FileType.Directory
        || name.endsWith('.md');
    })
    .sort(([nameA, typeA], [nameB, typeB]) => {
      if (typeA !== typeB) {
        return typeA === vscode.FileType.Directory ? -1 : 1;
      }

      return nameA.localeCompare(nameB);
    });

  return Promise.all(
    visibleEntries.map(async ([name, type]) => {
      const uri = vscode.Uri.joinPath(directory, name);

      return {
        name,
        type,
        uri,
        children: type === vscode.FileType.Directory
          ? await buildDirectoryModel(uri)
          : [],
      };
    }),
  );
}

export async function buildNavigationModel(
  project: SydocProject,
): Promise<NavigationNode[]> {
  return buildDirectoryModel(project.root);
}
