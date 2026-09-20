# Sydoc — Development Context

## Project

Sydoc is a VS Code extension for internal documentation of software projects.

The documentation is based on normal Markdown files. The extension should organize and navigate existing Markdown documentation without replacing VS Code's native Markdown renderer.

## Development style

* Language: TypeScript.
* VS Code extension API.
* Use 2 spaces for indentation.
* Every file must end with a newline.
* Develop in small coherent blocks, then test the block.
* Keep the implementation simple and native to VS Code where possible.
* Do not redesign existing architecture without discussing it first.

## Core project model

A Sydoc project is identified by a `sydoc.yml` file.

There is intentionally no `.sydoc/` directory.

Example:

```text
workspace/
├── backend/
│   └── docs/
│       └── sydoc.yml
├── frontend/
│   └── documentation/
│       └── sydoc.yml
└── ...
```

Rules:

* `sydoc.yml` is the project marker/config file.
* Multiple Sydoc projects can exist in the same workspace.
* Nested Sydoc projects are currently allowed.
* Discovery is recursive with no fixed depth.
* Ignored directories:

  * `.git`
  * `node_modules`
  * `dist`
  * `build`
  * `out`
* The schema/content of `sydoc.yml` is intentionally not being designed yet.

## Important UX decision

Sydoc must use the **native VS Code Markdown Preview**.

Do NOT create a custom Webview Markdown renderer.

The desired final layout is conceptually:

```text
┌──────────────────┬──────────────────────────────┬──────────────────┐
│ Sydoc navigation │                              │ Nesta página     │
│                  │       Native Markdown        │                  │
│ Documentation    │          Preview             │ H1               │
│ ├─ file.md       │                              │ ├─ H2            │
│ ├─ folder/       │                              │ └─ H2            │
│ └─ ...           │                              │                  │
└──────────────────┴──────────────────────────────┴──────────────────┘
```

Behavior:

* Opening a Markdown in the normal editable text editor must remain normal VS Code behavior.
* Sydoc's special layout should only be activated for the Markdown **Preview**, not merely because a `.md` file was opened.
* The center must be the native VS Code Markdown Preview.
* Left side: Sydoc documentation navigation.
* Right side: heading tree for the current page (`Nesta página`).
* When another Sydoc Markdown is opened in the Preview, the existing layout should be reused and updated.
* When leaving the Sydoc Preview for a normal file, the user's previous editor layout should eventually be restored.
* The whole VS Code window should not be resized; only the editor area should be organized.
* Exact editor-group/layout APIs still need to be verified before implementation.

VS Code does not expose the native Markdown renderer as a generic component that can simply be embedded inside a custom Webview. Therefore the native Preview must remain a native VS Code editor/webview, with Sydoc UI arranged around it.

## Current package configuration

The extension currently has these commands:

* `sydoc.openDocumentation`
* `sydoc.initializeDocumentation`
* `sydoc.createDocument`

The extension currently activates for:

```json
"activationEvents": [
  "onLanguage:markdown",
  "onWebviewPanel:markdown.preview"
]
```

The exact activation behavior for the Preview still needs to be verified during the eventual integration.

The extension also has a Sydoc Activity Bar container and two views:

* `sydoc.navigation` — Documentation
* `sydoc.outline` — Nesta página

The container uses:

```text
resources/sydoc.svg
```

## Current source structure

```text
src/
├── config.ts
├── discovery.ts
├── extension.ts
├── headings.ts
├── navigation.ts
├── outline.ts
└── project.ts
```

## project.ts

Defines:

```ts
export interface SydocProject {
  root: vscode.Uri;
  configFile: vscode.Uri;
}
```

`root` is the directory containing `sydoc.yml`.

`configFile` is the actual `sydoc.yml` URI.

## config.ts

Contains:

```ts
export const config = {
  configFileName: 'sydoc.yml',
  ignoredDirectories: new Set([
    '.git',
    'node_modules',
    'dist',
    'build',
    'out',
  ]),
};
```

## Discovery

`discovery.ts` currently provides:

* `findSydocProject(directory)`
* `findSydocProjects(directory)`
* `findSydocProjectForFile(file)`

Behavior:

* `findSydocProject()` checks whether the directory contains `sydoc.yml`.
* `findSydocProjects()` recursively searches directories while respecting ignored directories.
* `findSydocProjectForFile()` walks upward from a file's parent directory and returns the nearest Sydoc project.

This has already been tested successfully with multiple projects and ignored directories.

## Documentation navigation

`navigation.ts` contains `SydocNavigationProvider`.

It is a `vscode.TreeDataProvider` that:

* receives the currently active Sydoc project through `setProject()`;
* refreshes the Tree View when the project changes;
* recursively exposes directories;
* exposes `.md` files;
* ignores hidden entries;
* sorts directories before files;
* opens Markdown files using `vscode.open` when clicked.

The current behavior is intentionally based on real files and directories rather than a separate documentation database.

The Documentation tree should represent the Sydoc project to which the currently active Markdown document belongs.

## Current page outline

`headings.ts` defines:

```ts
export interface SydocHeading {
  text: string;
  level: number;
  line: number;
  children: SydocHeading[];
}
```

`findHeadings(document)` parses ATX Markdown headings (`#` through `######`) and builds a hierarchical tree.

Example:

```markdown
# Introdução
## Instalação
## Configuração
### Banco de dados
## Uso
# API
## Autenticação
```

becomes:

```text
Introdução
├── Instalação
├── Configuração
│   └── Banco de dados
└── Uso

API
└── Autenticação
```

`outline.ts` contains `SydocOutlineProvider`, another `TreeDataProvider`.

It:

* receives headings through `setHeadings()`;
* refreshes when headings change;
* displays the heading hierarchy;
* expands headings that have children;
* currently shows the heading level as a description such as `H1`, `H2`, etc.

The Tree View is currently registered as `sydoc.outline` and named `Nesta página`.

## Current active-document flow

`extension.ts` currently determines the Sydoc project for the active Markdown editor and updates both providers.

Conceptually:

```text
active editor
    ↓
getSydocProject(document)
    ↓
activeProject
    ├── navigation.setProject(...)
    └── findHeadings(document)
          ↓
        outline.setHeadings(...)
```

This currently works for the normal editable Markdown editor.

Important: this mechanism must NOT be treated as the final Preview detection mechanism. The native Markdown Preview does not behave like a normal `TextEditor` in `onDidChangeActiveTextEditor`.

## Current state of the UI

The following already works:

1. Sydoc extension activates.
2. `sydoc.yml` project discovery works.
3. Multiple Sydoc projects work.
4. Ignored directories work.
5. Project initialization creates an empty `sydoc.yml`.
6. Sydoc Activity Bar container works.
7. Documentation Tree View works.
8. Documentation tree follows the current project's Markdown files.
9. `Nesta página` Tree View works.
10. Markdown headings are parsed hierarchically.
11. `Nesta página` displays the heading hierarchy.

## Immediate next development task

Make `Nesta página` items navigable.

Desired eventual behavior:

* clicking a heading should navigate to the corresponding Markdown heading;
* the current heading model already stores the source line;
* initially this can navigate the normal editable Markdown editor to that line;
* later the same heading information should be reused to navigate the native Markdown Preview.

Do not implement the full Preview layout yet.

## Later Preview/layout work

Eventually implement:

1. Reliable detection of the native Markdown Preview.
2. Opening/reusing a Sydoc layout only for Preview.
3. Native Markdown Preview in the center.
4. Documentation navigation on the left.
5. `Nesta página` on the right.
6. Update both side panels when the Preview changes to another Sydoc Markdown.
7. Restore the previous editor layout when leaving the Sydoc Preview.
8. Handle multiple Sydoc projects correctly.
9. Verify exact VS Code editor-group/layout APIs before committing to the final implementation.

Do not replace the native Markdown renderer with a custom Markdown Webview.

## Commands already present

* `Sydoc: Open Documentation`
* `Sydoc: Initialize Documentation`
* `Sydoc: Create Document`

`Create Document` is currently contributed but not yet implemented.

## Development notes

Temporary debugging messages used during development should be removed when no longer needed.

When making changes:

1. Keep the scope of each block clear.
2. Prefer a few related changes followed by one compile/test cycle.
3. Preserve the architecture decisions above.
4. Do not modify the Markdown editing experience just to implement Sydoc Preview behavior.
