import * as vscode from 'vscode';
import { parse } from 'yaml';
import { config } from '../core/config';
import { SydocProject } from '../projects/project';

export interface NavigationNode {
  name: string;
  type: vscode.FileType;
  uri: vscode.Uri;
  children: NavigationNode[];
}

type NavEntry = string | Record<string, unknown>;

function isNavEntry(value: unknown): value is NavEntry {
  return typeof value === 'string'
    || (typeof value === 'object' && value !== null && !Array.isArray(value));
}

async function readConfiguredNavigation(
  project: SydocProject,
): Promise<unknown[] | undefined> {
  const bytes = await vscode.workspace.fs.readFile(project.configFile);
  const document = parse(Buffer.from(bytes).toString('utf8')) as unknown;

  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    return undefined;
  }

  const nav = (document as { nav?: unknown }).nav;
  return Array.isArray(nav) ? nav : undefined;
}

async function buildConfiguredNodes(
  entries: unknown[],
  project: SydocProject,
): Promise<NavigationNode[]> {
  const nodes: NavigationNode[] = [];

  for (const entry of entries) {
    if (!isNavEntry(entry)) {
      continue;
    }

    if (typeof entry === 'string') {
      const uri = vscode.Uri.joinPath(project.root, entry);
      try {
        const stat = await vscode.workspace.fs.stat(uri);
        if (stat.type !== vscode.FileType.File || !entry.endsWith('.md')) {
          continue;
        }

        nodes.push({
          name: entry.split('/').pop() ?? entry,
          type: vscode.FileType.File,
          uri,
          children: [],
        });
      } catch {
        continue;
      }

      continue;
    }

    for (const [name, value] of Object.entries(entry)) {
      if (typeof value === 'string') {
        const uri = vscode.Uri.joinPath(project.root, value);
        try {
          const stat = await vscode.workspace.fs.stat(uri);
          if (stat.type !== vscode.FileType.File || !value.endsWith('.md')) {
            continue;
          }

          nodes.push({
            name,
            type: vscode.FileType.File,
            uri,
            children: [],
          });
        } catch {
          continue;
        }

        continue;
      }

      if (Array.isArray(value)) {
        const children = await buildConfiguredNodes(value, project);
        if (children.length === 0) {
          continue;
        }

        nodes.push({
          name,
          type: vscode.FileType.Directory,
          uri: project.root,
          children,
        });
      }
    }
  }

  return nodes;
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

  const nodes = await Promise.all(
    visibleEntries.map(async ([name, type]) => {
      const uri = vscode.Uri.joinPath(directory, name);
      const children = type === vscode.FileType.Directory
        ? await buildDirectoryModel(uri)
        : [];

      if (
        type === vscode.FileType.Directory
        && children.length === 0
      ) {
        return undefined;
      }

      return {
        name,
        type,
        uri,
        children,
      };
    }),
  );

  return nodes.filter(
    (node): node is NavigationNode => node !== undefined,
  );
}

export async function buildNavigationModel(
  project: SydocProject,
): Promise<NavigationNode[]> {
  try {
    const configuredEntries = await readConfiguredNavigation(project);
    if (configuredEntries) {
      return buildConfiguredNodes(configuredEntries, project);
    }
  } catch {
    // Use automatic discovery when the config has no valid nav section.
  }

  return buildDirectoryModel(project.root);
}
