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

The extension does not contribute Activity Bar containers or Tree Views. Sydoc's user interface is rendered exclusively inside the native Markdown Preview.

## Current source structure

```text
src/
├── core/
│   └── config.ts
├── extension.ts
├── projects/
│   ├── discovery.ts
│   └── project.ts
├── preview/
│   ├── markdownIt.ts
│   └── navigation.ts

media/
├── sydoc-preview.css
└── sydoc-preview.js
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

## Current state of the UI

The following already works:

1. Sydoc extension activates.
2. `sydoc.yml` project discovery works.
3. Multiple Sydoc projects work.
4. Ignored directories work.
5. Project initialization creates an empty `sydoc.yml`.
6. The active Sydoc project is preserved while the native Markdown Preview has focus.
7. The extension contributes a markdown-it plugin, Preview stylesheet, and Preview script.
8. A Sydoc Preview creates three columns and builds Documentation and On This Page from rendered content.

## Immediate next development task

Continue the Preview-only implementation of the three-column Sydoc layout.

Scope:

* Do not change normal Markdown editor behavior.
* Keep all Sydoc UI inside the native Markdown Preview.

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
