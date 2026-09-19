- [Beta Versions](#beta-versions)
  - [v0.0.1-beta1](#v001-beta1)
  - [v0.0.1-beta2](#v001-beta2)
- [Pre-version 1 builds](#pre-version-1-builds)
  - [v0.1.0](#v010)
  - [v0.1.1](#v011)

# Beta Versions

## v0.0.1-beta1

- Initial Release (Distributed internally to testers).

## v0.0.1-beta2

- `FEATURE` Added ability to download songs directly from RhythmVerse.
- `FEATURE` Added ability to create and install Rock Band 3 Song Package (`.rb3`) files.

# Pre-version 1 builds

## v0.1.0

_This will be the first version that will be compiled and released using GitHub Actions._

- `FEATURE` Rockshelf now creates and uses a virtual Python environment for Python script operations, installing dependencies in real-time on application opening.
- `FEATURE` Rockshelf is now able to be used as a command-line interface. See [CLI.md](./docs/CLI.md) for detailed API documentation.
- `FEATURE` Added ability to export single songs from packages.
- `FEATURE` Added ability to refresh single package data.
- `FEATURE` Added package categories.
- `ENHANCEMENT` New fast cache management for installed song packages.
- `ENHANCEMENT` Added Markdown ability to render embedded images on package description files.
- `ENHANCEMENT` Several texts are now copyable by directly selecting them with the mouse.
- `ENHANCEMENT` Rock Band 3 Song Package (`.rb3`) files are now able to embed pre-RB3 files (`*.pan`, `*.usr`, `*.vnn`, `*.voc`, `*.xvocab`, `*_weights.bin`).
- `ENHANCEMENT` Rock Band 3 Song Package (`.rb3`) files are now a valid song package file to be installed through "Create New Package".
- `FIX` (on `DTAParser`) Fixed a bug where the DTA parser was correctly parsing but wasn't setting `original_id` values.
- `FIX` (on `DTAParser`) Fixed a bug where any string value with a semicolon (;) wasn't correctly parsed.

## v0.1.1

- `FEATURE` Added new commands on Rockshelf CLI (see [CLI.md](./docs/CLI.md) for detailed Rockshelf CLI documentation).
- `ENHANCEMENT` Added "Search" functionality on "My Packages".
- `CHANGE` Rockshelf now requires only the RPCS3 executable file path as starting point.
- `CHANGE` User config and package cache are you kept on a specific "Rockshelf" folder on `<USERNAME>/Documents` (Windows) or `~/Documents`/Path defined by the `XDG_DOCUMENTS_DIR` environment variable (Linux).
- `CHANGE` Better error display and trace stack from renderer.
- `FIX` (on `DTAParser`) Fixed a bug where the parser wasn't correctly exporting `'crowd_channels'` attributes.
- `FIX` (for Linux users) Fixed a bug where Linux users can't select the RPCS3 executable because the old code was hardcored to look for EXE files, even on Linux distributions.
- `FIX` Now all executables from the Binary API module uses `spawn` rather than `exec` to avoid arguments character limitation error.
- `FIX` Fixed an error when trying to export songs with no album artwork.