import * as path from 'node:path';
import * as vscode from 'vscode';
import { NavigationNode } from './navigationModel';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function relativeDocumentPath(
  documentUri: vscode.Uri,
  fileUri: vscode.Uri,
): string {
  const documentDirectory = path.posix.dirname(documentUri.path);
  const relativePath = path.posix.relative(
    documentDirectory,
    fileUri.path,
  );

  return relativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function renderNodes(
  nodes: NavigationNode[],
  documentUri: vscode.Uri,
): string {
  const items = nodes.map((node) => {
    if (node.type === vscode.FileType.Directory) {
      return [
        '<li>',
        `<span>${escapeHtml(node.name)}</span>`,
        renderNodes(node.children, documentUri),
        '</li>',
      ].join('');
    }

    const href = relativeDocumentPath(documentUri, node.uri);
    return [
      '<li>',
      `<a href="${href}">${escapeHtml(node.name)}</a>`,
      '</li>',
    ].join('');
  });

  return `<ul>${items.join('')}</ul>`;
}

export function buildPreviewNavigation(
  model: NavigationNode[],
  documentUri: vscode.Uri,
): string {
  return [
    '<h2 class="sydoc-preview__title">Documentation</h2>',
    renderNodes(model, documentUri),
  ].join('');
}
