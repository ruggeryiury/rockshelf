import { BinaryReader, DirPath, pathLikeToDirPath, pathLikeToFilePath, type DirPathLikeTypes, type FilePath, type FilePathJSONRepresentation, type FilePathLikeTypes } from 'node-lib'
import { DTAParser, type PackageExtractionSongsObject } from '../rbtools'
import { createRSPackImage, extractFilesFromRB3File, parseRB3FileHeader, RB3_HEADER_SIZE, RB3_SONG_ENTRY_SIZE, type RB3FileHeaderObject } from '../../lib.exports'
import type { RB3CompatibleDTAFile } from '../rbtools/lib.exports'

export interface RB3FileStatObject {
  /**
   * An object with values stored in the file header.
   */
  header: RB3FileHeaderObject
  /**
   * The song package name.
   */
  packageName: string
  /**
   * The file size.
   */
  fileSize: number
  /**
   * The original name of the folder storing the song package file.
   */
  defaultFolderName: string
  /**
   * The creator of the song package. If `undefined`, it will be an anonymous creator.
   */
  packageCreatorName?: string
  /**
   * A `Buffer` object of the contents of the song package's `package.md` file. Use to store description, rendered by a Markdown parser.
   */
  description?: Buffer
  /**
   * A `Buffer` object containing the package thumbnail in a JPEG file format. The _Rockshelf Pack Image_ footer is ignored on the buffer, containing only raw JPEG data.
   */
  thumbnail: Buffer
  /**
   * A `Buffer` object containing the package author thumbnail in a JPEG file format.
   */
  packageCreatorThumbnail?: Buffer
  /**
   * A [DTAParser](../rbtools/core/DTAParser.ts) object to access and manipulate the package metadata file.
   */
  dta: DTAParser
  /**
   * Tells if the song package contains more than one song.
   */
  isSongPackage: boolean
}

export interface RB3FileJSONRepresentation extends Omit<RB3FileStatObject, 'dta' | 'description' | 'thumbnail' | 'packageCreatorThumbnail'> {
  /**
   * A JSON representation with stats of the file path.
   */
  path: FilePathJSONRepresentation
  /**
   * The bytes of the song package's `package.md` file encoded as base-64 string.
   */
  description?: string
  /**
   * The bytes of the package thumbnail JPEG file encoded as DataURL string.
   */
  thumbnail: string
  /**
   * The bytes of the package creator thumbnail JPEG file encoded as DataURL string.
   */
  packageCreatorThumbnail?: string
  /**
   * The contents of the package's DTA file.
   */
  dta: RB3CompatibleDTAFile[]
}

export interface RB3ExtractionTempFolderObject {
  /**
   * The path where the RB3 package were extracted.
   */
  path: DirPath
  /**
   * The type of the package extracted.
   */
  type: 'rb3'
  /**
   * An array with objects representing extracted songs from the package and its files.
   */
  songs: PackageExtractionSongsObject[]
  /**
   * An object with stats of the extracted RB3 file.
   */
  stat: RB3FileJSONRepresentation
}

/**
 * A class that represents a Rock Band 3 Song Package file (`.rb3`).
 *
 * The Rock Band 3 Song Package file is a file container used specifically on Rockshelf. The package contains raw data and all information needed to recreate the package when sharing through other users. The file creation and contents depacking is way faster than both STFS/CON and PKG files. The file header has a fixed 0x60 bytes, with each song entry having fixed 0x50 bytes.
 *
 * @see [RB3 File Documentation](https://github.com/ruggeryiury/rockshelf#rock-band-3-song-package-file).
 */
export class RB3File {
  // #region Constructor

  /** The path to the RB3 Song Package file. */
  path: FilePath

  /**
   * `RB3File` is a class that represents a RB3 Song Package file.
   * - - - -
   * @param {FilePathLikeTypes} rb3FilePath The path to the RB3 Song Package file.
   */
  constructor(rb3FilePath: FilePathLikeTypes) {
    this.path = pathLikeToFilePath(rb3FilePath)
  }

  // #region Methods

  /**
   * Checks the integrity of the RB3 Song Package file by reading the file signature (magic).
   * - - - -
   * @returns {Promise<string>}
   * @throws {Error} When it identifies file signature of any unknown file format.
   */
  async checkFileIntegrity(): Promise<string> {
    if (!this.path.exists) throw new Error(`Provided RB3 Song Package file "${this.path.path}" does not exists.`)
    const magic = (await this.path.readOffset(0, 3)).toString()

    if (magic === 'RB3') return magic
    throw new Error(`Provided RB3 Song Package file "${this.path.path}" is not a valid RB3 Song Package file.`)
  }

  /**
   * Returns an object with stats of the RB3 Song Package file.
   * - - - -
   * @returns {Promise<RB3FileStatObject>}
   */
  async stat(): Promise<RB3FileStatObject> {
    await this.checkFileIntegrity()

    const header = await parseRB3FileHeader(this.path)
    const reader = await BinaryReader.fromFile(this.path)

    reader.seek(RB3_HEADER_SIZE + header.songsCount * RB3_SONG_ENTRY_SIZE)
    const packageName = await reader.readUTF8(header.packageNameLength)
    const defaultFolderName = await reader.readUTF8(header.packageFolderNameLength)

    let packageCreatorName: string | undefined
    if (header.packageCreatorNameLength > 0) packageCreatorName = await reader.readUTF8(header.packageCreatorNameLength)

    const dta = DTAParser.fromBuffer(await reader.read(header.dtaFileLength))

    dta.sort('Song Title, Artist')

    let description: Buffer | undefined
    if (header.descriptionLength > 0) description = await reader.read(header.descriptionLength)

    const thumbnail = await reader.read(header.thumbnailLength)

    let packageCreatorThumbnail: Buffer | undefined
    if (header.packageCreatorThumbnailLength > 0) packageCreatorThumbnail = await reader.read(header.packageCreatorThumbnailLength)

    const fileSize = reader.length

    await reader.close()

    const isSongPackage = dta.songs.length > 1

    return { header, packageName, fileSize, defaultFolderName, packageCreatorName, description, thumbnail, packageCreatorThumbnail, dta, isSongPackage }
  }

  /**
   * Returns a JSON representation of this `RB3File` class.
   *
   * This method is very similar to `.stat()`, but converts `Buffer` values into JSON-friendly string representations.
   * - - - -
   * @returns {Promise<RB3FileJSONRepresentation>}
   */
  async toJSON(): Promise<RB3FileJSONRepresentation> {
    const stat = await this.stat()
    return {
      path: this.path.toJSON(),
      ...stat,
      description: stat.header.descriptionLength > 0 && stat.description ? stat.description.toString('base64') : undefined,
      thumbnail: `data:image/jpeg;base64,${stat.thumbnail.toString('base64')}`,
      packageCreatorThumbnail: stat.header.packageCreatorThumbnailLength > 0 && stat.packageCreatorThumbnail ? `data:image/jpeg;base64,${stat.packageCreatorThumbnail.toString('base64')}` : undefined,
      dta: stat.dta.songs,
    }
  }

  /**
   * Extracts the Rock Band 3 Song Package file contents and returns the folder path where all contents were extracted.
   * - - - -
   * @param {DirPathLikeTypes} destPath The folder path where you want the files to be extracted to.
   * @param {boolean} [extractOnRoot] `OPTIONAL` Extract all files on the root rather than recreate the entire Rock Band 3 Song Package file system recursively. Default is `false`.
   * @param {string[]} [songs] `OPTIONAL` An array of string of internal songnames to be extracted. If not provided, all songs will be extracted normally.
   * @returns {Promise<DirPath>}
   */
  async extract(destPath: DirPathLikeTypes, extractOnRoot: boolean = false, songs: string[] = []): Promise<DirPath> {
    await this.checkFileIntegrity()
    const dest = pathLikeToDirPath(destPath)
    if (!dest.exists) await dest.mkDir()
    else {
      await dest.deleteDir(true)
      await dest.mkDir()
    }

    const stat = await this.stat()
    const parser = stat.dta

    if (parser.songs.length === 0 && parser.updates.length > 0) {
      await parser.applyDXUpdatesOnSongs(true)
    }

    if (songs.length > 0) {
      parser.songs = parser.songs.filter((s) => songs.includes(s.songname))
      if (parser.songs.length === 0) throw new Error('None of the provided internal songnames were found on the provided Rock Band 3 Song Package file.')

      const extractedFolder = await extractFilesFromRB3File(this.path, destPath, extractOnRoot, songs)

      const newDTAPath = extractOnRoot ? extractedFolder.gotoFile('songs.dta') : extractedFolder.gotoFile('songs/songs.dta')
      await parser.export(newDTAPath)

      const newPKGArtwork = extractedFolder.gotoFile('folder.jpg')
      await createRSPackImage(stat.thumbnail, newPKGArtwork, { category: stat.header.packageCategory, creationDate: stat.header.dateISOString, encryptionStatus: stat.header.encryptionStatus, packageName: stat.packageName, source: stat.header.sourceType, type: stat.header.installationType })

      if (stat.description) {
        const newDescFile = extractedFolder.gotoFile('package.md')
        await newDescFile.write(stat.description)
      }

      return extractedFolder
    } else {
      const extractedFolder = await extractFilesFromRB3File(this.path, destPath, extractOnRoot)
      const newDTAPath = extractOnRoot ? extractedFolder.gotoFile('songs.dta') : extractedFolder.gotoFile('songs/songs.dta')
      await parser.export(newDTAPath)

      const newPKGArtwork = extractedFolder.gotoFile('folder.jpg')
      await createRSPackImage(stat.thumbnail, newPKGArtwork, { category: stat.header.packageCategory, creationDate: stat.header.dateISOString, encryptionStatus: stat.header.encryptionStatus, packageName: stat.packageName, source: stat.header.sourceType, type: stat.header.installationType })

      if (stat.description) {
        const newDescFile = extractedFolder.gotoFile('package.md')
        await newDescFile.write(stat.description)
      }

      return extractedFolder
    }
  }
}
