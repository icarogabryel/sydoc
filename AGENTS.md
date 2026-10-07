# Sydoc project guidelines

These instructions apply to all work in this repository. Keep them concise and
current. For contributor setup and Git workflow, see
[CONTRIBUTING.md](./CONTRIBUTING.md). For user-facing behavior, see
[README.md](./README.md).

## Project boundaries

- Sydoc is a TypeScript VS Code extension for organizing Markdown
  documentation.
- A Sydoc project is identified by a `sydoc.yml` file. There is intentionally
  no `.sydoc/` directory.
- Multiple and nested Sydoc projects are supported.
- The documentation source remains ordinary Markdown files.
- Do not redesign the architecture or introduce a new UI surface without
  discussing the change first.

## Non-negotiable Preview behavior

Sydoc extends the native VS Code Markdown Preview; it does not replace it.

- Do not create a custom Markdown renderer or a replacement Markdown webview.
- Do not change normal Markdown editor behavior.
- Keep the three-column layout inside the native Preview.
- Use the native Markdown extension points:
  `markdown.markdownItPlugins`, `markdown.previewStyles`, and
  `markdown.previewScripts`.
- Preserve the native `.markdown-body` root and rendered nodes. Do not
  recreate, sanitize, or replace Markdown HTML.
- Keep Preview scripts idempotent because VS Code can update Preview content
  without recreating the page.
- Keep the Documentation and `On This Page` panels independently scrollable.
- Preserve native Markdown link behavior, including reuse of the current
  Preview for links to other Markdown documents.
- Do not resize or reorganize VS Code editor groups or the application window.
- Preserve compatibility with task lists, Mermaid, LaTeX, and other Markdown
  extensions.

## Project discovery rules

- `sydoc.yml` is both the project marker and the configuration file.
- Discovery is recursive with no fixed depth.
- `findSydocProjectForFile` must resolve the nearest project when projects are
  nested.
- Ignore `.git`, `node_modules`, `dist`, `build`, and `out` during discovery
  and navigation.
- Navigation includes Markdown files and omits hidden directories, unsupported
  files, and empty directories.
- Preserve relative links for documents in nested directories.
- Treat the `sydoc.yml` schema as intentionally limited to the behavior
  already supported by the code. Do not invent configuration semantics.

## Architecture

Keep responsibilities separated:

- `src/core/`: shared configuration.
- `src/projects/`: project types and discovery.
- `src/preview/`: Markdown Preview integration and navigation models.
- `src/test/`: VS Code extension tests.
- `media/`: Preview CSS and JavaScript.

Prefer existing helpers and models over duplicate logic. Keep the implementation
simple, native to VS Code, and type-safe. Use two-space indentation, preserve
the existing naming conventions, and end every file with a newline.

## Required workflow

Before editing:

1. Read the relevant implementation, tests, and documentation.
2. Check the working tree and do not overwrite unrelated user changes.
3. Identify the smallest set of files that owns the behavior.

While editing:

- Make focused, surgical changes.
- Update directly related documentation.
- Add or update tests for behavior changes.
- Remove temporary debugging output before finishing.
- Surface errors explicitly; do not hide failures with broad catches or silent
  fallbacks.

After editing, run the smallest relevant checks. For TypeScript or extension
changes, run:

```bash
npm run pretest
npm test
```

The `pretest` script compiles with strict TypeScript settings and runs ESLint.
The test suite runs in a VS Code Extension Development Host. Report any
environmental limitation separately from code failures.

## Dependencies and generated files

- Use `npm ci` for a clean checkout and keep `package-lock.json` in sync with
  intentional dependency changes.
- Do not edit `node_modules/`, `out/`, or `.vscode-test/` as source files.
- Do not commit generated output, local VS Code test installations, secrets, or
  user data.
- Prefer existing project tooling over adding dependencies.

## Git and review conventions

- Use Conventional Commits, for example:
  `feat(preview): add configured navigation titles`.
- Keep commits focused and avoid unrelated formatting or refactors.
- Update `CHANGELOG.md` for user-visible changes.
- Pull Requests should explain the motivation, affected behavior, validation
  performed, and any compatibility limitations.
- Changes affecting Preview must be checked for both initial rendering and
  navigation to another Markdown document.
- Do not bypass Husky hooks with `--no-verify` unless there is a documented
  temporary reason. Hooks are installed by the `prepare` script after
  dependency installation and the pre-commit hook runs the linter.

## Security and compatibility

- Treat workspace files, YAML content, Markdown content, and generated HTML as
  untrusted input.
- Escape generated HTML and validate file/path handling using existing project
  patterns.
- Do not commit credentials or tokens.
- Preserve the VS Code engine range declared in `package.json` unless the
  support policy is intentionally changed and documented.
