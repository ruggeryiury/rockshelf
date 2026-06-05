import { BinaryReader, pathLikeToFilePath, type FilePath, type FilePathJSONRepresentation, type FilePathLikeTypes } from 'node-lib'
import { DTAParser } from '../rbtools'
import { parseRB3FileHeader, type RB3FileHeaderObject } from '../../lib.exports'
import type { RB3CompatibleDTAFile } from '../rbtools/lib.exports'

export interface RB3FileStatObject {
  header: RB3FileHeaderObject
  packageName: string
  fileSize: number
  defaultFolderName: string
  author?: string
  description?: Buffer
  thumbnail: Buffer
  authorThumbnail?: Buffer
  dta: DTAParser
  isSongPackage: boolean
}

export interface RB3FileJSONRepresentation extends Omit<RB3FileStatObject, 'dta' | 'description' | 'thumbnail' | 'authorThumbnail'> {
  /**
   * A JSON representation with stats of the file path.
   */
  path: FilePathJSONRepresentation
  descripton?: string
  thumbnail: string
  authorThumbnail?: string
  /**
   * The contents of the package's DTA file.
   */
  dta: RB3CompatibleDTAFile[]
}

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
    const magic = await BinaryReader.fromBuffer(await this.path.readOffset(0, 3)).readUInt24LE()

    if (magic === 3359314) return 'RB3'
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

    reader.seek(0x50 + header.songsCount * 0x50)
    const packageName = await reader.readUTF8(header.packageNameLength)
    const defaultFolderName = await reader.readUTF8(header.defaultFolderNameLength)

    let author: string | undefined
    if (header.authorNameLength > 0) author = await reader.readUTF8(header.authorNameLength)

    const dta = DTAParser.fromBuffer(await reader.read(header.dtaFileLength))

    let description: Buffer | undefined
    if (header.descriptionLength > 0) description = await reader.read(header.descriptionLength)

    const thumbnail = await reader.read(header.thumbnailLength)

    let authorThumbnail: Buffer | undefined
    if (header.authorThumbnailLength > 0) authorThumbnail = await reader.read(header.authorThumbnailLength)

    const fileSize = reader.length

    await reader.close()

    const isSongPackage = dta.songs.length > 1 ? true : false

    return { header, packageName, fileSize, defaultFolderName, author, description, thumbnail, authorThumbnail, dta, isSongPackage }
  }

  /**
   * Returns a JSON representation of this `RB3File` class.
   *
   * This method is very similar to `.stat()`, but also returns information about the RB3 Song Package file path.
   * - - - -
   * @returns {Promise<RB3FileJSONRepresentation>}
   */
  async toJSON(): Promise<RB3FileJSONRepresentation> {
    const rawStats = await this.stat()
    return {
      path: this.path.toJSON(),
      ...rawStats,
      descripton: rawStats.header.descriptionLength > 0 && rawStats.description ? rawStats.description.toString('base64') : undefined,
      thumbnail: `data:image/jpeg;base64,${rawStats.thumbnail.toString('base64')}`,
      authorThumbnail: rawStats.header.authorThumbnailLength > 0 && rawStats.authorThumbnail ? `data:image/jpeg;base64,${rawStats.authorThumbnail.toString('base64')}` : undefined,
      dta: rawStats.dta.songs,
    }
  }
}
