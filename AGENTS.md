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

The desired final Preview layout is conceptually:

```text
┌──────────────────┬──────────────────────────────┬──────────────────┐
│ Documentation    │                              │ On This Page     │
│                  │       Native Markdown        │                  │
│ docs/            │          Preview             │ H1               │
│ ├─ file.md       │                              │ ├─ H2            │
│ ├─ folder/       │                              │ └─ H2            │
│ └─ ...           │                              │                  │
└──────────────────┴──────────────────────────────┴──────────────────┘
```

Behavior:

* Opening a Markdown in the normal editable text editor must remain normal VS Code behavior.
* Sydoc's special layout should only be activated for the Markdown **Preview**, not merely because a `.md` file was opened.
* The layout is rendered **inside the native Markdown Preview**, not as VS Code editor groups or external View containers.
* Left side: prebuilt Sydoc documentation navigation for the current project.
* Center: the normal native Markdown Preview content.
* Right side: heading tree for the current page (`On This Page`).
* Each side navigation has independent vertical scrolling.
* When a link to another Markdown file is clicked, the native Preview should reuse itself for the new document. Sydoc must rebuild the layout and heading tree for that document.
* Markdown links should rely on the default `markdown.preview.openMarkdownLinks: "inPreview"` behavior.
* The whole VS Code window and editor-group layout must not be resized or reorganized.

Implement the Preview layout with VS Code's native Markdown extension points:

* `markdown.markdownItPlugins` injects the prebuilt documentation navigation or data needed to render it.
* `markdown.previewStyles` provides the three-column layout and independent side-panel scrolling.
* `markdown.previewScripts` reorganizes the final rendered DOM, builds `On This Page` from rendered headings, and updates the layout after Preview content changes.
* Preserve the native `.markdown-body` root and move existing rendered nodes into the center column. Do not recreate, sanitize, or replace the Markdown HTML, so that extensions such as task lists, Mermaid, and LaTeX continue to work.
* Preview scripts must be idempotent because VS Code updates Preview content as Markdown changes.

VS Code does not expose the native Markdown renderer as a generic component that can be embedded in a custom Webview. Sydoc must therefore extend the native Preview in place and must not create a custom Markdown renderer.

## Current package configuration

The extension currently has these commands:

* `sydoc.openDocumentation`
* `sydoc.initializeDocumentation`

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
* `sydoc.outline` — On This Page

These Tree Views currently support the editable Markdown workflow. They are not the final Sydoc Preview layout; the final navigation is rendered inside the native Preview.

The container uses:

```text
resources/sydoc.svg
```

## Current source structure

```text
src/
├── core/
│   └── config.ts
├── extension.ts
├── markdown/
│   └── headings.ts
├── projects/
│   ├── discovery.ts
│   └── project.ts
└── views/
    ├── navigation.ts
    └── outline.ts
```

## projects/project.ts

Defines:

```ts
export interface SydocProject {
  root: vscode.Uri;
  configFile: vscode.Uri;
}
```

`root` is the directory containing `sydoc.yml`.

`configFile` is the actual `sydoc.yml` URI.

## core/config.ts

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

## projects/discovery.ts

`discovery.ts` currently provides:

* `findSydocProject(directory)`
* `findSydocProjects(directory)`
* `findSydocProjectForFile(file)`

Behavior:

* `findSydocProject()` checks whether the directory contains `sydoc.yml`.
* `findSydocProjects()` recursively searches directories while respecting ignored directories.
* `findSydocProjectForFile()` walks upward from a file's parent directory and returns the nearest Sydoc project.

This has already been tested successfully with multiple projects and ignored directories.

## views/navigation.ts

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

## markdown/headings.ts

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
# Introduction
## Installation
## Configuration
### Database
## Usage
# API
## Authentication
```

becomes:

```text
Introduction
├── Installation
├── Configuration
│   └── Database
└── Usage

API
└── Authentication
```

`views/outline.ts` contains `SydocOutlineProvider`, another `TreeDataProvider`.

It:

* receives headings through `setHeadings()`;
* refreshes when headings change;
* displays the heading hierarchy;
* expands headings that have children;
* currently shows the heading level as a description such as `H1`, `H2`, etc.

The Tree View is currently registered as `sydoc.outline` and named `On This Page`.

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
9. `On This Page` Tree View works.
10. Markdown headings are parsed hierarchically.
11. `On This Page` displays the heading hierarchy.
12. Clicking an `On This Page` item reveals the matching line in a visible Markdown source editor.
13. The active Sydoc project is preserved while the native Markdown Preview has focus.

## Immediate next development task

Create a Preview-only proof of concept for the three-column Sydoc layout.

Scope:

* Register the native Markdown extension points required for a Preview script and styles.
* Preserve the final Markdown DOM and place it in the center column.
* Build the right `On This Page` panel from the rendered heading elements.
* Add independently scrollable left and right panels.
* Do not change normal Markdown editor behavior.
* Keep the documentation navigation content simple in this first block; the real project tree and cross-document navigation follow in the next block.

## Later Preview/layout work

Eventually implement:

1. Build and cache the real documentation navigation HTML for each Sydoc project.
2. Insert the current project's navigation in the left Preview panel.
3. Generate correct relative Markdown links for nested documents.
4. Rebuild the left navigation and right heading tree when the Preview changes to another Sydoc Markdown.
5. Handle multiple and nested Sydoc projects correctly.
6. Refresh the cached navigation when project files change.
7. Verify compatibility with task-list, Mermaid, and LaTeX Markdown extensions.

Do not replace the native Markdown renderer with a custom Markdown Webview.

## Commands already present

* `Sydoc: Open Documentation`
* `Sydoc: Initialize Documentation`

## Development notes

Temporary debugging messages used during development should be removed when no longer needed.

When making changes:

1. Keep the scope of each block clear.
2. Prefer a few related changes followed by one compile/test cycle.
3. Preserve the architecture decisions above.
4. Do not modify the Markdown editing experience just to implement Sydoc Preview behavior.
