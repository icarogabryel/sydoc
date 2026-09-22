# Sydoc

Sydoc is a VS Code extension for navigating internal Markdown documentation.
It organizes documentation projects without replacing the native VS Code
Markdown renderer.

## Features

- Discovers documentation projects recursively from a `sydoc.yml` marker file.
- Supports multiple and nested Sydoc projects in the same workspace.
- Shows a Documentation navigation panel inside the native Markdown Preview.
- Shows an `On This Page` outline built from the current document headings.
- Keeps the left and right navigation panels independently scrollable.
- Rebuilds navigation when Markdown files or directories change.
- Keeps normal Markdown editing unchanged.

## Requirements

- Visual Studio Code `1.138.0` or later.
- A workspace containing one or more Sydoc projects.

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

### Open the documentation preview

Open a Markdown file belonging to a Sydoc project and open its native Markdown
Preview with `Markdown: Open Preview` or the preview button in the editor.

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

## Architecture

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

Sydoc extends the native Markdown Preview through VS Code's Markdown extension
points. It does not create a replacement Markdown renderer or a separate
editor view.

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
