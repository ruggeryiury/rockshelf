import { BinaryReader, pathLikeToFilePath, type FilePath, type FilePathJSONRepresentation, type FilePathLikeTypes } from 'node-lib'
import { DTAParser } from '../rbtools'
import { parseRB3FileHeader, type RB3FileHeaderObject } from '../../lib.exports'
import type { RB3CompatibleDTAFile } from '../rbtools/lib.exports'

export interface RB3FileStatObject {
  header: RB3FileHeaderObject
  packageName: string
  fileSize: number
  defaultFolderName: string
  packageCreatorName?: string
  description?: Buffer
  thumbnail: Buffer
  packageCreatorThumbnail?: Buffer
  dta: DTAParser
  isSongPackage: boolean
}

export interface RB3FileJSONRepresentation extends Omit<RB3FileStatObject, 'dta' | 'description' | 'thumbnail' | 'packageCreatorThumbnail'> {
  /**
   * A JSON representation with stats of the file path.
   */
  path: FilePathJSONRepresentation
  description?: string
  thumbnail: string
  packageCreatorThumbnail?: string
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

    reader.seek(0x60 + header.songsCount * 0x50)
    const packageName = await reader.readUTF8(header.packageNameLength)
    const defaultFolderName = await reader.readUTF8(header.defaultFolderNameLength)

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

    const isSongPackage = dta.songs.length > 1 ? true : false

    return { header, packageName, fileSize, defaultFolderName, packageCreatorName, description, thumbnail, packageCreatorThumbnail, dta, isSongPackage }
  }

  /**
   * Returns a JSON representation of this `RB3File` class.
   *
   * This method is very similar to `.stat()`, but also returns information about the RB3 Song Package file path.
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
}
