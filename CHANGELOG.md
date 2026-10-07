# Changelog

All notable changes to Sydoc are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Sydoc project discovery through `sydoc.yml` marker files.
- Support for multiple and nested documentation projects.
- Recursive Markdown documentation navigation with ignored directory support.
- MkDocs-style `nav` configuration for custom documentation ordering and titles.
- Native VS Code Markdown Preview integration with:
  - Documentation navigation.
  - Markdown content in the center panel.
  - An `On This Page` heading outline.
  - Independently scrollable side panels.
- Relative links between Markdown documents, including documents in nested folders.
- Preview updates when the current Markdown document changes.
- `Sydoc: Open Documentation` command.
- `Sydoc: Initialize Documentation` command.
- Automated compile, lint, and extension test checks in GitHub Actions.
- Extension tests for project discovery, nearest-project resolution, navigation
  links, configured navigation, and Preview integration.

### Changed

- Preserved normal VS Code Markdown editor behavior while extending only the
  native Markdown Preview.
- Filtered empty directories and unsupported files from documentation navigation.
