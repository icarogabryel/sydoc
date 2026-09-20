import * as vscode from 'vscode';
import {
  SydocHeading,
} from './headings';

export class SydocOutlineProvider
  implements vscode.TreeDataProvider<SydocHeading> {
  private headings: SydocHeading[] = [];

  private readonly onDidChangeTreeDataEmitter =
    new vscode.EventEmitter<void>();

  readonly onDidChangeTreeData =
    this.onDidChangeTreeDataEmitter.event;

  setHeadings(headings: SydocHeading[]): void {
    this.headings = headings;
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(
    heading: SydocHeading,
  ): vscode.TreeItem {
    const item = new vscode.TreeItem(
      heading.text,
      heading.children.length > 0
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.None,
    );

    item.description = `H${heading.level}`;

    return item;
  }

  getChildren(
    heading?: SydocHeading,
  ): SydocHeading[] {
    if (!heading) {
      return this.headings;
    }

    return heading.children;
  }
}
