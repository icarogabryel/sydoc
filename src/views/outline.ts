import * as vscode from 'vscode';
import {
  SydocHeading,
} from '../markdown/headings';

export class SydocOutlineProvider
  implements vscode.TreeDataProvider<SydocHeading> {
  private headings: SydocHeading[] = [];
  private documentUri: vscode.Uri | undefined;

  private readonly onDidChangeTreeDataEmitter =
    new vscode.EventEmitter<void>();

  readonly onDidChangeTreeData =
    this.onDidChangeTreeDataEmitter.event;

  setHeadings(
    headings: SydocHeading[],
    documentUri?: vscode.Uri,
  ): void {
    this.headings = headings;
    this.documentUri = documentUri;
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
    item.command = {
      command: 'sydoc.revealHeading',
      title: 'Go to Heading',
      arguments: [heading.line, this.documentUri],
    };

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
