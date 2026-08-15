- [Beta Versions](#beta-versions)
  - [v0.0.1-beta1](#v001-beta1)
  - [v0.0.1-beta2](#v001-beta2)
- [Pre-builds](#pre-builds)
  - [v0.1](#v01)

# Beta Versions

## v0.0.1-beta1

- Initial Release (Distributed internally to testers).

## v0.0.1-beta2

- `FEATURE` Added ability to download songs directly from RhythmVerse.
- `FEATURE` Added ability to create and install Rock Band 3 Song Package (`.rb3`) files.

# Pre-builds

## v0.1

_This will be the first version that will be compiled and released using GitHub Actions._

- `FEATURE` Rockshelf now creates and uses a virtual Python environment for Python script operations, installing dependencies in real-time on application opening.
- `FEATURE` Rockshelf is now able to be used as a command-line interface. See [CLI.md](./docs/CLI.md) for detailed API documentation.
- `FEATURE` Added ability to export single songs from packages.
- `FEATURE` Added ability to refresh single package data.
- `FEATURE` Added package categories.
- `ENHANCEMENT` New fast cache management for installed song packages.
- `ENHANCEMENT` Added Markdown ability to render embedded images on package description files.
- `ENHANCEMENT` Several texts are now copyable by directly selecting them with the mouse.
- `ENHANCEMENT` Rock Band 3 Song Package (`.rb3`) files are not able to embed pre-RB3 files (`*.pan`, `*.usr`, `*.vnn`, `*.voc`, `*.xvocab`, `*_weights.bin`).
- `ENHANCEMENT` Rock Band 3 Song Package (`.rb3`) files are now a valid song package file to be installed through "Create New Package".
- `FIX` (on `DTAParser`) Fixed a bug where the DTA parser was correctly parsing but wasn't setting `original_id` values.
