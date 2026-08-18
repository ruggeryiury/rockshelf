<h1>Rockshelf CLI API</h1>

Rockshelf exposes many internal methods on its command line interface API.

- [`imgstat`](#imgstat)
- [`moggdec`](#moggdec)
- [`moggenc`](#moggenc)
- [`moggmaker`](#moggmaker)
- [`moggstat`](#moggstat)
- [`pkgstat`](#pkgstat)
- [`rb3stat`](#rb3stat)
- [`stfsstat` | `constat`](#stfsstat--constat)
- [`textoimg`](#textoimg)

## `imgstat`

_Displays statistics of an image file._

```bash
rockshelf imgstat <img_path> [flags]
```

| Argument   | Type   | Description                              |
| :--------- | :----- | :--------------------------------------- |
| `img_path` | String | **Required.** The image file to be read. |

`--output-format`, `-o`

- **Type:** String
- **Default:** `json`
- **Valid Values:** `json` | `yaml` | `json-pretty`
- **Description:** The output format.

## `moggdec`

_Decrypts a MOGG file._

```bash
rockshelf moggdec <src_mogg_path> <dest_mogg_path> [flags]
```

| Argument         | Type   | Description                                                         |
| :--------------- | :----- | :------------------------------------------------------------------ |
| `src_mogg_path`  | String | **Required.** The MOGG file to be decrypted.                        |
| `dest_mogg_path` | String | **Required.** The destination path of the new, decrypted MOGG file. |

`--verbose`, `-v`

- **Type:** Boolean
- **Default:** `false`
- **Description:** Print additional information during execution.

## `moggenc`

_Encrypts/re-encrypts a MOGG file with 0x0B encryption (works on both Xbox 360 and PS3)._

```bash
rockshelf moggenc <src_mogg_path> <dest_mogg_path> [flags]
```

| Argument         | Type   | Description                                                         |
| :--------------- | :----- | :------------------------------------------------------------------ |
| `src_mogg_path`  | String | **Required.** The MOGG file to be encrypted/re-encrypted.           |
| `dest_mogg_path` | String | **Required.** The destination path of the new, encrypted MOGG file. |

`--verbose`, `-v`

- **Type:** Boolean
- **Default:** `false`
- **Description:** Print additional information during execution.

## `moggmaker`

_Joins multiple audio files to create a MOGG file._

```bash
rockshelf moggmaker <...audio_files> [flags]
```

| Argument         | Type     | Description                                                       |
| :--------------- | :------- | :---------------------------------------------------------------- |
| `...audio_files` | String[] | **Required.** An array of audio files to be added as MOGG tracks. |

`--output`, `-o`

- **Type:** String
- **Description:** The destination path of the new MOGG file.

`--encrypted`, `-e`

- **Type:** Boolean
- **Default:** `false`
- **Description:** Encrypts the created MOGG file using 0x0B encryption.

`--quality`, `-q`

- **Type:** Number
- **Default:** `3`
- **Description:** The quality value of the OGG encoding.

`--verbose`, `-v`

- **Type:** Boolean
- **Default:** `false`
- **Description:** Print additional information during execution.

## `moggstat`

_Displays statistics of a MOGG file._

```bash
rockshelf moggstat <mogg_path> [flags]
```

| Argument    | Type   | Description                             |
| :---------- | :----- | :-------------------------------------- |
| `mogg_path` | String | **Required.** The MOGG file to be read. |

`--output-format`, `-o`

- **Type:** String
- **Default:** `json`
- **Valid Values:** `json` | `yaml` | `json-pretty`
- **Description:** The output format.

## `pkgstat`

_Displays statistics of a PS3 PKG file._

```bash
rockshelf pkgstat <pkg_path> [flags]
```

| Argument   | Type   | Description                            |
| :--------- | :----- | :------------------------------------- |
| `pkg_path` | String | **Required.** The PKG file to be read. |

`--output-format`, `-o`

- **Type:** String
- **Default:** `json`
- **Valid Values:** `json` | `yaml` | `json-pretty`
- **Description:** The output format.

## `rb3stat`

_Displays statistics of a Rock Band 3 Song Package file._

```bash
rockshelf rb3stat <rb3_path> [flags]
```

| Argument   | Type   | Description                                                 |
| :--------- | :----- | :---------------------------------------------------------- |
| `rb3_path` | String | **Required.** The Rock Band 3 Song Package file to be read. |

`--output-format`, `-o`

- **Type:** String
- **Default:** `json`
- **Valid Values:** `json` | `yaml` | `json-pretty`
- **Description:** The output format.

## `stfsstat` | `constat`

_Displays statistics of a Xbox 360 CON file._

```bash
rockshelf [stfsstat | constat] <stfs_path> [flags]
```

| Argument    | Type   | Description                                     |
| :---------- | :----- | :---------------------------------------------- |
| `stfs_path` | String | **Required.** The Xbox 360 CON file to be read. |

`--output-format`, `-o`

- **Type:** String
- **Default:** `json`
- **Valid Values:** `json` | `yaml` | `json-pretty`
- **Description:** The output format.

## `textoimg`

_Converts a texture file (PNG_XBOX, PNG_PS3, PNG_WII) into an image format._

```bash
rockshelf textoimg <src_tex_path> <dest_img_path> [flags]
```

| Argument        | Type   | Description                                                          |
| :-------------- | :----- | :------------------------------------------------------------------- |
| `stfs_path`     | String | **Required.** The path to the texture file to be converted.          |
| `dest_img_path` | String | **Required.** The destination path of the new, converted image file. |

`--format`, `-f`

- **Type:** String
- **Default:** `png`
- **Valid Values:** `png` | `bmp` | `jpg` | `webp` | `tga`
- **Description:** The output format of the new image.
