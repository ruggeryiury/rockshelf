<div align=center>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/electron/electron-original.svg" width="24px" title="Electron">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="24px" title="React" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" width="24px" title="NodeJS" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="24px" title="JavaScript">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="24px" title="TypeScript">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="24px" title="Python">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" width="24px" title="Tailwind CSS"/>
</div>

<div align=center style="margin-bottom:2rem">
<img src='https://img.shields.io/github/last-commit/ruggeryiury/rockshelf?color=%23DDD&style=for-the-badge' /> <img src='https://img.shields.io/github/repo-size/ruggeryiury/rockshelf?style=for-the-badge' /> <img src='https://img.shields.io/github/issues/ruggeryiury/rockshelf?style=for-the-badge' /> <img src='https://img.shields.io/github/license/ruggeryiury/rockshelf?style=for-the-badge' />
</div>

<div align=center >
<img src='front.webp'>
</div>
<br />
<h1>Table of Contents</h1>

- [About](#about)
- [Features](#features)
- [Requirements](#requirements)
  - [System](#system)
  - [Python](#python)
- [Custom Files](#custom-files)
  - [Rockshelf Pack Image file](#rockshelf-pack-image-file)
  - [RB3 File Format](#rb3-file-format)
    - [Header](#header)
    - [Song Entries](#song-entries)
    - [Raw Data](#raw-data)
- [Known Limitations](#known-limitations)
- [Special Thanks](#special-thanks)

# About

Rockshelf is a Rock Band 3 Deluxe utility suite for RPCS3 users built with [Electron Vite](https://electron-vite.org/) framework. Rockshelf comes with a hand-made `core` package that features the main [NodeJS](https://nodejs.org/en) process and methods, and uses [ReactJS](https://react.dev/) as a renderer framework.

# Features

- Rock Band 3 Launcher
  - _Starts Rock Band 3 on RPCS3 directly from Rockshelf._
- Rock Band 3 Deluxe PKG Installer
  - _Rockshelf is able to install Deluxe, giving instructions on where to download and how to install it._
- Quick Configuration Setter
  - _Quickly use pre-defined configurations for Rock Band 3 on RPCS3._
- Discord Rich Presence
  - _Built-in localized Discord Rich Presence for Rock Band 3 Deluxe._
- Song Package Creator
  - _Create a new song package from CON and/or PKG files._
- Package Exporter `NEW!`
  - _Quickly export and share your packages as a Rock Band 3 Song Package file, with support for package thumbnail, description, package author, and more!_
- Package Manager
  - _Visualize your installed packages' songs and data._
- Leaderboard Viewer
  - _Visalize a song's leaderboards from GoCentral directly on Rockshelf._
- Rhythmverse Browser
  - _Search for songs from Rhythmverse._

# Requirements

## System

- [FFMPEG](https://www.ffmpeg.org/).
  - The FFMPEG path must also be settled on the system environment variables.
- [Python v3](https://www.python.org/downloads/)

## Python

| Package name   | Install command            | Description                                                                         | PyPI link                                        |
| -------------- | -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| `audioop-lts`  | `pip install audioop-lts`  | LTS Port of Python `audioop`.                                                       | [[link]](https://pypi.org/project/audioop-lts/)  |
| `chardet`      | `pip install chardet`      | Universal character encoding detector                                               | [[link]](https://pypi.org/project/chardet)       |
| `cryptography` | `pip install cryptography` | A package which provides cryptographic recipes and primitives to Python developers. | [[link]](https://pypi.org/project/cryptography/) |
| `mido`         | `pip install mido`         | MIDI Objects for Python.                                                            | [[link]](https://pypi.org/project/mido/)         |
| `puremagic`    | `pip install puremagic`    | Pure python implementation of magic file detection.                                 | [[link]](https://pypi.org/project/mido/)         |
| `pillow`       | `pip install pillow`       | Python Imaging Library (fork).                                                      | [[link]](https://pypi.org/project/pillow/)       |
| `pycryptodome` | `pip install pycryptodome` | Cryptographic library for Python                                                    | [[link]](https://pypi.org/project/pycryptodome/) |
| `pydub`        | `pip install pydub`        | Manipulate audio with an simple and easy high level interface.                      | [[link]](https://pypi.org/project/pydub/)        |

# Custom Files

_Rockshelf_ introduces new type of files. You can find the datagram of all these files below.

## Rockshelf Pack Image file

The _Rockshelf Pack Image file_ is a common JPEG file with a few extra bytes on the file's footer. It was created with the need to join all displaying values from the package on a single and discreet JPEG file. The JPEG file uses specific bytes to represent the end of the image file, so the image is rendered on all systems without problem, even with these few extra bytes placed on the file's footer.

The last 4 bytes must represent a 32-bit unsigned integer with the Rockshelf Pack Image file's extra bytes size. The file is only valid on Rockshelf if the file signature bytes (magic) is found when you seek it calculating the file size minus the extra bytes size.<br /><br />

| NAME                      | OFFSET | LENGTH | TYPE       | DESCRIPTION                                                                                                                                                                                                                                                                                |
| ------------------------- | ------ | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Magic                     | `0x00` | `0x04` | `ASCII`    | The file signature. Always `0x52 0x53 0x44 0x54` ("RSDT").                                                                                                                                                                                                                                 |
| File Version              | `0x04` | `0x01` | `UInt8`    | The version of the Rockshelf Pack Image file. Used to switch between different parsing process.                                                                                                                                                                                            |
| Package Installation Type | `0x05` | `0x01` | `UInt8`    | The installation type of the song package. Tells if the song was created/installed through Rockshelf or other methods.<br /><br />0 = Created/installed through Rockshelf.<br />1 = Created/installed through other methods (probably installed directly on RPCS3 using PKG files/folder). |
| Package Source Type       | `0x06` | `0x01` | `UInt8`    | The source of the song package.<br /><br />0 = Merged (Different packages file types joined).<br />1 = STFS (Package created from a single CON file).<br />2 = PKG (Package created from a single PKG file).<br />3 = RB3 Song Package file (Package created from a single RB3 file).      |
| Package Encryption Status | `0x07` | `0x01` | `UInt8`    | The encryption status of the song package.<br /><br />0 = Unknown (Might have both encrypted and decrypted files).<br />1 = Encrypted.<br />2 = Decrypted.<br />3 = Mixed (Rarely used).                                                                                                   |
| _Reserved (padding)_      | `0x08` | `0x0d` | `byte[]`   |                                                                                                                                                                                                                                                                                            |
| Creation Year             | `0x15` | `0x02` | `UInt16LE` | The song package creation year ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                                |
| Creation Month            | `0x17` | `0x01` | `UInt8`    | The song package creation month ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                               |
| Creation Day              | `0x18` | `0x01` | `UInt8`    | The song package creation day ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                                 |
| Creation Hour             | `0x19` | `0x01` | `UInt8`    | The song package creation hours ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                               |
| Creation Minute           | `0x1a` | `0x01` | `UInt8`    | The song package creation minutes ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                             |
| Creation Second           | `0x1b` | `0x01` | `UInt8`    | The song package creation seconds ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                             |
| Package Name Length       | `0x1c` | `0x01` | `UInt8`    | The length of the song package name string.                                                                                                                                                                                                                                                |
| Package Name              | `0x1d` | `???`  | `UTF8`     | The package name.                                                                                                                                                                                                                                                                          |
| Extra Bytes Footer Length | `???`  | `0x04` | `UInt32LE` | The size of the extra bytes footer (including the size itself).                                                                                                                                                                                                                            |

## RB3 File Format

The _Rock Band 3 Song Package file_ is a file container used specifically on Rockshelf. The package contains raw data and all information needed to recreate the package when sharing through other users. The produced file is ~5% smaller than Xbox 360 CON packages, and ~8% smaller than the PS3 PKG file, but its creation and depacking is way faster than both of them without the validation shenanigans needed for the consoles. The file header has a fixed `0x50` bytes, with each song entry also having fixed `0x50` bytes.<br />

### Header

| NAME                               | OFFSET | LENGTH | TYPE       | DESCRIPTION                                                                                                                                                                                                                                                                                |
| ---------------------------------- | ------ | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Magic                              | `0x00` | `0x03` | `ASCII`    | The file signature. Always `0x52 0x42 0x33` ("RB3").                                                                                                                                                                                                                                       |
| File Version                       | `0x03` | `0x01` | `UInt8`    | The version of the RB3 file. Used to switch between different parsing process.                                                                                                                                                                                                             |
| Songs Count                        | `0x04` | `0x02` | `UInt16LE` | The amount of songs included on the song package.                                                                                                                                                                                                                                          |
| Package Name Length                | `0x06` | `0x01` | `UInt8`    | The length of the song package name string.                                                                                                                                                                                                                                                |
| Default Package Folder Name Length | `0x07` | `0x01` | `UInt8`    | The length of the default song package folder name.                                                                                                                                                                                                                                        |
| Package Installation Type          | `0x08` | `0x01` | `UInt8`    | The installation type of the song package. Tells if the song was created/installed through Rockshelf or other methods.<br /><br />0 = Created/installed through Rockshelf.<br />1 = Created/installed through other methods (probably installed directly on RPCS3 using PKG files/folder). |
| Package Source Type                | `0x06` | `0x01` | `UInt8`    | The source of the song package.<br /><br />0 = Merged (Different packages file types joined).<br />1 = STFS (Package created from a single CON file).<br />2 = PKG (Package created from a single PKG file).<br />3 = RB3 Song Package file (Package created from a single RB3 file).      |
| Package Encryption Status          | `0x0a` | `0x01` | `UInt8`    | The encryption status of the song package.<br /><br />0 = Unknown (Might have both encrypted and decrypted files).<br />1 = Encrypted.<br />2 = Decrypted.<br />3 = Mixed (Rarely used).                                                                                                   |
| Author Name Length                 | `0x0b` | `0x01` | `UInt8`    | The length of the song package author name.                                                                                                                                                                                                                                                |
| DTA File Length                    | `0x0c` | `0x04` | `UInt32LE` | The length of the song package DTA file binary data.                                                                                                                                                                                                                                       |
| Description Length                 | `0x10` | `0x04` | `UInt32LE` | The length of the song package description file.                                                                                                                                                                                                                                           |
| Thumbnail Length                   | `0x14` | `0x04` | `UInt32LE` | The length of the song package thumbnail image file data.                                                                                                                                                                                                                                  |
| Author Thumbnail Length            | `0x18` | `0x02` | `UInt16LE` | The length of the song package author thumbnail image file data.                                                                                                                                                                                                                           |
| Creation Year                      | `0x1a` | `0x02` | `UInt16LE` | The song package creation year ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                                |
| Creation Month                     | `0x1c` | `0x01` | `UInt8`    | The song package creation month ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                               |
| Creation Day                       | `0x1d` | `0x01` | `UInt8`    | The song package creation day ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                                 |
| Creation Hour                      | `0x1e` | `0x01` | `UInt8`    | The song package creation hours ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                               |
| Creation Minute                    | `0x1f` | `0x01` | `UInt8`    | The song package creation minutes ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                             |
| Creation Second                    | `0x20` | `0x01` | `UInt8`    | The song package creation seconds ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).                                                                                                                                                                                             |
| Package Size                       | `0x21` | `0x08` | `UInt64LE` | The size of the song package.                                                                                                                                                                                                                                                              |
| Song Data Offset                   | `0x29` | `0x04` | `UInt32LE` | The offset where the actual songs data starts on the package.                                                                                                                                                                                                                              |
| Package Files Format               | `0x2d` | `0x01` | `UInt8`    | The console-specific format of the song package files<br /><br />0 = Xbox 360.<br />1 = PS3.                                                                                                                                                                                               |
| _Reserved (padding)_               | `0x2e` | `0x02` | `byte[]`   |                                                                                                                                                                                                                                                                                            |
| Package Hash                       | `0x30` | `0x20` | `byte[]`   | The song package contents hash in [SHA256 algorithm](https://en.wikipedia.org/wiki/SHA-2).                                                                                                                                                                                                 |

### Song Entries

The song entries count is related to the `Songs Count` value on header. Each entry has a fixed `0x50` bytes.<br /><br />

| NAME                 | OFFSET | LENGTH | TYPE       | DESCRIPTION                                                            |
| -------------------- | ------ | ------ | ---------- | ---------------------------------------------------------------------- |
| Song Internal Name   | `0x00` | `0x2a` | `ASCII`    | The song's internal name, padded with null bytes up the 42 characters. |
| Data Offset          | `0x2a` | `0x08` | `UInt64LE` | The offset where the song data starts.                                 |
| MOGG File Length     | `0x32` | `0x04` | `UInt32LE` | The length of the song's MOGG file.                                    |
| MIDI File Length     | `0x36` | `0x04` | `UInt32LE` | The length of the song's MILO file.                                    |
| Artwork File Length  | `0x3A` | `0x04` | `UInt32LE` | The length of the song's artwork file.                                 |
| MILO File Length     | `0x3E` | `0x04` | `UInt32LE` | The length of the song's MILO file.                                    |
| _Reserved (padding)_ | `0x42` | `0x0e` | `byte[]`   |                                                                        |

### Raw Data

After the header and the song entry/entries, the raw data is placed with the actual information of the song package, that follows the following order

- Package Data:
  - Package Name
  - Default Package Folder Name
  - Author Name
  - DTA File
  - Description File
  - Package Thumbnail
  - Author Thumbnail
- Song Data:
  - MOGG File
  - MIDI File
  - Artwork File
  - MILO File

# Known Limitations

- Rockshelf is not able to read, install or edit Rock Band/Rock Band 2 song packages.
  - _Rockshelf uses a specific DTA parser written in JavaScript that can't process Rock Band/Rock Band 2 DTA values, and therefore can't guarantee compatibility with Rock Band/Rock Band 2. Rockshelf's DTA Parser was written to parse exclusively Rock Band 3 DTAs from customs generated by MAGMA, or DTAs from Rock Band 3 or newer._
- Rockshelf is not able to install any official song package:
  - _For official packages, installing the PKG version directly through RPCS3 is recommended. Rockshelf is only able to detect that they're official packages and lock all types of editing on them. Please, don't try to install the CON version of official packages, as it might collide with the same error discussed previously._
- Rockshelf is not able to create or edit both CON and PKG files.
  - _Both CON and PKG files are formats specific for their systems (Xbox 360 and PlayStation 3, respectively). For future plans, a specific package format will be created for use in Rockshelf._

# Special Thanks

- [Carl Mylo](https://github.com/carlmylo): Helping testing and providing the spanish translation.
- Ganso: Helping with general testing.
- [Aloquendiar](https://github.com/Aloquendiar)
- [Emma](https://github.com/InvoxiPlayGames)
- [raphaelgoulart](https://github.com/raphaelgoulart)
- [TrojanNemo](https://github.com/trojannemo)
- [Jnack](https://github.com/jnackmclain)
- [LocalH](https://github.com/LocalH): Providing the Moggulator python script.
- [Onyxite](https://github.com/mtolly)
