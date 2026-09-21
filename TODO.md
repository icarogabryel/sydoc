# Sydoc TODO

## Completed foundation

- [x] Discover Sydoc projects from `sydoc.yml`.
- [x] Support multiple, nested projects and ignored directories.
- [x] Preserve the active Sydoc project when the native Markdown Preview has focus.
- [x] Organize the source by responsibility: core, projects, and Preview.

## Preview layout

- [x] Add the native Markdown contribution points for a markdown-it plugin, Preview styles, and Preview script.
- [x] Build a Preview-only three-column proof of concept.
- [x] Preserve `.markdown-body` and place the rendered Markdown nodes in the center column.
- [x] Add independently scrollable Documentation and On This Page side panels.
- [x] Build On This Page from the final rendered heading elements.
- [x] Make the Preview script idempotent across Preview content updates.
- [x] Ensure normal Markdown editing remains unchanged.

## Documentation navigation in Preview

- [x] Extract project-document discovery into a reusable navigation model.
- [x] Generate escaped HTML for the Documentation navigation.
- [x] Cache navigation data for each Sydoc project before Markdown rendering.
- [x] Inject the current project's prebuilt navigation into the left Preview panel.
- [x] Generate links that work for nested Markdown documents.
- [x] Rebuild the layout when the native Preview changes to another Markdown document.
- [x] Refresh cached navigation when Markdown files or directories change.
- [x] Handle multiple and nested Sydoc projects in Preview navigation.

## Quality and delivery

- [ ] Add unit tests for discovery and Preview navigation models.
- [ ] Add Preview-focused integration tests where VS Code test APIs permit them.
- [ ] Verify compatibility with task-list, Mermaid, and LaTeX Markdown extensions.
- [ ] Validate keyboard navigation, focus order, and accessible labels for Preview navigation.
- [ ] Document the required Preview link behavior and supported VS Code versions.
- [ ] Implement the Create Document command or remove its planned documentation.
- [ ] Package and manually test the extension in a clean VS Code Extension Development Host.
