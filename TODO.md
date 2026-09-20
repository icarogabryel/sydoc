# Sydoc TODO

## Completed foundation

- [x] Discover Sydoc projects from `sydoc.yml`.
- [x] Support multiple, nested projects and ignored directories.
- [x] Provide Documentation and On This Page Tree Views for the Markdown editor.
- [x] Parse Markdown headings into a hierarchy.
- [x] Reveal a heading in a visible Markdown source editor.
- [x] Preserve the active Sydoc project when the native Markdown Preview has focus.
- [x] Organize the source by responsibility: core, Markdown, projects, and views.

## Preview layout

- [x] Add the native Markdown contribution points for a markdown-it plugin, Preview styles, and Preview script.
- [ ] Build a Preview-only three-column proof of concept.
- [ ] Preserve `.markdown-body` and move existing rendered Markdown nodes into the center column.
- [ ] Add independently scrollable Documentation and On This Page side panels.
- [ ] Build On This Page from the final rendered heading elements.
- [ ] Make the Preview script idempotent across Preview content updates.
- [ ] Ensure normal Markdown editing remains unchanged.

## Documentation navigation in Preview

- [ ] Extract project-document discovery into a reusable navigation model.
- [ ] Generate escaped HTML for the Documentation navigation.
- [ ] Cache navigation data for each Sydoc project before Markdown rendering.
- [ ] Inject the current project's prebuilt navigation into the left Preview panel.
- [ ] Generate links that work for nested Markdown documents.
- [ ] Rebuild the layout when the native Preview changes to another Markdown document.
- [ ] Refresh cached navigation when Markdown files or directories change.
- [ ] Handle multiple and nested Sydoc projects in Preview navigation.

## Quality and delivery

- [ ] Add unit tests for discovery, heading parsing, and navigation models.
- [ ] Add Preview-focused integration tests where VS Code test APIs permit them.
- [ ] Verify compatibility with task-list, Mermaid, and LaTeX Markdown extensions.
- [ ] Validate keyboard navigation, focus order, and accessible labels for Preview navigation.
- [ ] Document the required Preview link behavior and supported VS Code versions.
- [ ] Implement the Create Document command or remove its planned documentation.
- [ ] Package and manually test the extension in a clean VS Code Extension Development Host.
