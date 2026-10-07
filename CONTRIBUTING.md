# Contributing to Sydoc

Thank you for your interest in contributing to Sydoc. This guide explains how
to set up the project, run its checks, and prepare changes for review.

## Before you start

Sydoc is a TypeScript extension for Visual Studio Code. The project uses:

- Node.js 22 or a compatible current LTS release.
- npm and the committed `package-lock.json`.
- Visual Studio Code 1.138.0 or later for the extension API.

The extension integrates with the native VS Code Markdown Preview. It must not
replace the native Markdown renderer with a custom webview renderer.

## Installation

Clone the repository and install the locked dependencies:

```bash
git clone https://github.com/icarogabryel/sydoc.git
cd sydoc
npm ci
```

`npm ci` installs the exact dependency versions recorded in
`package-lock.json`. Use `npm install` only when intentionally changing
dependencies.

The first test run may download a VS Code test instance into `.vscode-test/`.
This directory is local test data and must not be committed.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run compile` | Compile TypeScript into `out/`. |
| `npm run watch` | Recompile TypeScript when files change. |
| `npm run lint` | Run ESLint against `src/`. |
| `npm run pretest` | Compile and lint the project. |
| `npm test` | Run the VS Code extension test suite. |
| `npm run vscode:prepublish` | Compile the extension before packaging. |

Before opening a Pull Request, run:

```bash
npm run pretest
npm test
```

Changes to extension behavior should be covered by tests whenever the VS Code
test APIs make that practical.

## Project structure

```text
src/
├── core/       Shared configuration
├── projects/   Project discovery and project types
├── preview/    Native Markdown Preview integration and navigation
├── test/       Extension tests
└── extension.ts

media/
├── sydoc-preview.css
└── sydoc-preview.js
```

Keep changes in the area that owns the behavior. Reuse existing helpers and
preserve the current separation between project discovery, navigation models,
and Preview integration.

## Preview guidelines

Sydoc extends the native VS Code Markdown Preview. Contributions in this area
must follow these rules:

- Do not create a custom Markdown renderer or replacement webview.
- Do not change normal Markdown editor behavior.
- Keep the three-column layout inside the native Preview.
- Preserve the native `.markdown-body` root and rendered Markdown nodes.
- Keep Preview scripts idempotent because VS Code can update the rendered
  content without recreating the Preview page.
- Preserve compatibility with task lists, Mermaid, LaTeX, and other Markdown
  extensions.
- Use the native Markdown link behavior for links to other Markdown files.
- Avoid changing the editor group layout or resizing the VS Code window.

When changing Preview HTML, CSS, or scripts, test both opening a Preview and
navigating between Markdown documents.

## Code style and linting

The project uses TypeScript with strict type checking and two-space
indentation. Follow the existing formatting and naming conventions.

ESLint is configured in `eslint.config.mjs`. Run it with:

```bash
npm run lint
```

Do not disable a lint rule globally to make a change pass. If an exception is
necessary, keep it as narrow as possible and explain the reason in the Pull
Request.

Every file should end with a newline. Avoid unrelated formatting changes.

## Git hooks

Husky is configured through the `prepare` script in `package.json`. After
installing dependencies, the repository's Git hooks are enabled automatically.
The pre-commit hook runs the project lint check.

Hooks are a local safety net, not a replacement for CI. Always run the complete
checks relevant to your change before pushing.

If hooks are not installed after setup, run:

```bash
npx husky
```

Do not bypass hooks with `git commit --no-verify` unless there is a documented,
temporary reason.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit
messages:

```text
<type>(optional-scope): short imperative description
```

Recommended types include:

- `feat`: add user-facing functionality.
- `fix`: correct an existing behavior.
- `test`: add or update tests.
- `docs`: change documentation.
- `refactor`: change implementation without changing behavior.
- `style`: make formatting or style-only changes.
- `chore`: update tooling, dependencies, or repository maintenance.

Examples:

```text
feat(preview): add configured navigation titles
fix(discovery): ignore nested build directories
test(navigation): cover relative document links
docs: document native Preview behavior
chore: update TypeScript tooling
```

Keep commits focused and explain breaking changes in the commit body when
needed. Commit subjects should be concise and written in the imperative mood.

## Pull Requests

Before opening a Pull Request:

1. Rebase or update your branch with the latest `main` when appropriate.
2. Keep the change focused and avoid unrelated refactors.
3. Add or update tests for behavior changes.
4. Update documentation and `CHANGELOG.md` when the user-visible behavior
   changes.
5. Run `npm run pretest` and `npm test`.
6. Confirm that generated files and local test data are not included.

The Pull Request description should explain:

- What changed and why.
- How the change was tested.
- Any limitations or compatibility considerations.
- Whether the change affects the native Markdown Preview.

Keep review feedback focused on correctness, maintainability, accessibility,
security, and compatibility with the supported VS Code version.

## Dependencies and security

Use the existing package manager and update both `package.json` and
`package-lock.json` when changing dependencies. Do not commit secrets, tokens,
local configuration, generated VS Code test installations, or user data.

Report security vulnerabilities privately to the repository maintainers rather
than opening a public issue with exploit details.

## License

By contributing to Sydoc, you agree that your contributions are provided under
the repository's [MIT License](LICENSE).
