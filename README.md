# Simple YAML Documentation - Sydoc

Sydoc is a project model for organizing internal documentation with Markdown.
It is inspired by tools such as MkDocs: a documentation project has a known
root, a marker/configuration file, and a predictable collection of Markdown
documents and directories.

The current implementation is this VS Code extension that provides navigation and
preview features for Sydoc projects. The project model is independent from the
editor: the documentation itself remains ordinary Markdown files that can be
read and edited with any suitable tool.

## Features

- Defines documentation projects through a `sydoc.yml` marker file.
- Supports multiple and nested projects in the same workspace.
- Organizes Markdown documents into a navigable documentation tree.
- Provides a Documentation navigation panel in the current VS Code adapter.
- Provides an `On This Page` outline built from the current document headings.
- Keeps the left and right navigation panels independently scrollable.
- Rebuilds navigation when Markdown files or directories change.
- Preserves normal Markdown files and editing workflows.

## Requirements

- Markdown-compatible tooling.
- A directory containing one or more Sydoc projects.
- Visual Studio Code `1.138.0` or later for the current extension integration.

## Getting Started

### Create a project

A Sydoc project is any directory containing a file named `sydoc.yml`:

```text
workspace/
├── backend/
│   └── docs/
│       ├── sydoc.yml
│       ├── getting-started.md
│       └── architecture/
│           └── overview.md
└── frontend/
    └── documentation/
        ├── sydoc.yml
        └── setup.md
```

The current version only uses the file as a project marker. Its YAML schema
and contents are not required yet, so an empty file is valid.

You can create the marker file from the Command Palette:

```text
Sydoc: Initialize Documentation
```

Choose the directory that should become the project root.

### Open the documentation in VS Code

The current adapter is available as a VS Code extension. Open a Markdown file
belonging to a Sydoc project and open its native Markdown Preview with
`Markdown: Open Preview` or the preview button in the editor.

The preview displays:

- **Documentation**: the Markdown files and directories in the current
    project.
- **Markdown Preview**: the normal VS Code-rendered document.
- **On This Page**: the headings from the current document.

Markdown links continue to use VS Code's native preview behavior. The normal
Markdown editor is not changed.

The command below scans the first workspace folder and reports the number of
projects found:

```text
Sydoc: Open Documentation
```

## Project Discovery

Discovery is recursive and has no fixed depth. Sydoc ignores these directories
while searching and building navigation:

```text
.git
node_modules
dist
build
out
```

Directories whose names start with `.` and files that are not Markdown files
are also omitted from the Documentation navigation.

## Development

Clone the repository, install dependencies, and run the checks:

```bash
npm install
npm run pretest
npm test
```

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run compile` | Compile TypeScript to `out/`. |
| `npm run watch` | Compile continuously while files change. |
| `npm run lint` | Run ESLint against `src/`. |
| `npm run pretest` | Compile and lint the project. |
| `npm test` | Run the VS Code extension tests. |
| `npm run vscode:prepublish` | Compile files before packaging. |

The project uses Husky to run `npm run lint` before commits.

## Project Model

A Sydoc project is intentionally simple:

```text
project-root/
├── sydoc.yml
├── introduction.md
├── installation.md
└── guides/
    ├── first-steps.md
    └── configuration.md
```

The `sydoc.yml` file identifies the project root. Its configuration schema is
not defined yet, so an empty marker file is valid in the current version.
Markdown files are the source of truth for the documentation. Sydoc does not
move them into a special `.sydoc/` directory or replace them with a proprietary
format.

## Current VS Code Adapter

```text
src/
├── core/       Shared configuration
├── projects/   Sydoc project discovery and project types
├── preview/    Markdown Preview integration and navigation models
├── test/       Extension tests
└── extension.ts

media/
├── sydoc-preview.css
└── sydoc-preview.js
```

The current adapter extends the native Markdown Preview through VS Code's
Markdown extension points. It does not create a replacement Markdown renderer
or a separate editor view. Other adapters or a standalone documentation build
tool can use the same project model in the future.

## Current Limitations

- `sydoc.yml` is currently only a marker; its configuration schema has not
    been defined.
- The documentation navigation is currently generated from Markdown files and
    directories rather than from a configurable ordering file.
- Preview compatibility with third-party Markdown features such as task
    lists, Mermaid, and LaTeX still needs dedicated verification.
- Accessibility and keyboard navigation for the Preview side panels still
    need dedicated validation.

## License

See [LICENSE](LICENSE).
