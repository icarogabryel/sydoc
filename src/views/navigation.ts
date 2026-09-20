import * as vscode from 'vscode';
import { SydocProject } from '../projects/project';

export class SydocNavigationProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private project: SydocProject | undefined;

  private readonly onDidChangeTreeDataEmitter =
    new vscode.EventEmitter<void>();

  readonly onDidChangeTreeData =
    this.onDidChangeTreeDataEmitter.event;

  setProject(project: SydocProject | undefined): void {
    this.project = project;
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(
    element: vscode.TreeItem,
  ): vscode.TreeItem {
    return element;
  }

  async getChildren(
    element?: vscode.TreeItem,
  ): Promise<vscode.TreeItem[]> {
    if (!this.project) {
      return [
        new vscode.TreeItem(
          'No project',
          vscode.TreeItemCollapsibleState.None,
        ),
      ];
    }

    const directory = element?.resourceUri ?? this.project.root;

    const entries = await vscode.workspace.fs.readDirectory(
      directory,
    );

    return entries
      .filter(([name, type]) => {
        if (name.startsWith('.')) {
          return false;
        }

        if (type === vscode.FileType.Directory) {
          return true;
        }

        return name.endsWith('.md');
      })
      .sort(([nameA, typeA], [nameB, typeB]) => {
        if (typeA !== typeB) {
          return typeA === vscode.FileType.Directory ? -1 : 1;
        }

        return nameA.localeCompare(nameB);
      })
      .map(([name, type]) => {
        const uri = vscode.Uri.joinPath(
          directory,
          name,
        );

        const item = new vscode.TreeItem(
          name,
          type === vscode.FileType.Directory
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None,
        );

        item.resourceUri = uri;

        if (type === vscode.FileType.File) {
          item.command = {
            command: 'vscode.open',
            title: 'Open Document',
            arguments: [uri],
          };
        }

        return item;
      });
  }
}
