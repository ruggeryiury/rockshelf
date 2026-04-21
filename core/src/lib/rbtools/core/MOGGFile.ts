import { type DirPath, pathLikeToFilePath, type DirPathLikeTypes, type FilePath, type FilePathJSONRepresentation, type FilePathLikeTypes } from 'node-lib'
import { BinaryAPI, PythonAPI, type MOGGFileStatPythonObject } from '../core.exports'
import type { RB3CompatibleDTAFile } from '../lib.exports'

// #region Types

export interface MOGGFileJSONRepresentation extends FilePathJSONRepresentation, MOGGFileStatPythonObject {}
export type MOGGFileEncryptionVersion = 10 | 11 | 12 | 13

/**
 * `MOGGFile` is a class that represents a MOGG file.
 */
export class MOGGFile {
  // #region Constructor

  /**
   * The path to the MOGG file.
   */
  path: FilePath

  /**
   * `MOGGFile` is a class that represents a MOGG file.
   * - - - -
   * @param {FilePathLikeTypes} moggFilePath The path of the MOGG file.
   */
  constructor(moggFilePath: FilePathLikeTypes) {
    this.path = pathLikeToFilePath(moggFilePath)
  }

  // #region Methods

  /**
   * Checks the integrity of the instantiated MOGG file by reading its signature (magic bytes).
   *
   * This function returns the encryption version of the MOGG file, if the MOGG file is valid.
   * - - - -
   * @returns {Promise<number>}
   * @throws {Error} When it identifies file signature of a multitrack OGG file with no MOGG header or any unknown file format.
   */
  async checkFileIntegrity(): Promise<number> {
    if (!this.path.exists) throw new Error(`Provided MOGG file "${this.path.path}" does not exists`)
    const magic = (await this.path.readOffset(0, 4)).readUint32LE()
    if (magic === 1399285583) throw new Error(`Provided MOGG file "${this.path.path}" is a decrypted OGG file with no HMX MOGG header`)
    else if (magic >= 10 && magic <= 17) return magic
    throw new Error(`Provided MOGG file "${this.path.path}" is not a valid MOGG or decrypted OGG file with no HMX MOGG header`)
  }

  /**
   * Checks if the MOGG file is encrypted.
   * - - - -
   * @returns {Promise<boolean>}
   * @throws {Error} When it identifies file signature of a multitrack OGG file with no MOGG header or any unknown file format.
   */
  async isEncrypted(): Promise<boolean> {
    return (await this.checkFileIntegrity()) > 10
  }

  /**
   * Returns an object with stats of the MOGG file.
   * - - - -
   * @returns {Promise<MOGGFileStatPythonObject>}
   */
  async stat(): Promise<MOGGFileStatPythonObject> {
    await this.checkFileIntegrity()
    return await PythonAPI.moggFileStat(this.path)
  }

  /**
   * Returns a JSON representation of this `MOGGFile` class.
   *
   * This method is very similar to `.stat()`, but also returns information about the MOGG file path.
   * - - - -
   * @returns {Promise<MOGGFileJSONRepresentation>}
   */
  async toJSON(): Promise<MOGGFileJSONRepresentation> {
    const stat = await this.stat()
    return {
      ...stat,
      ...this.path.toJSON(),
    }
  }

  /**
   * Decrypts this MOGG file and returns an instantiated `MOGGFile` class pointing to the new decrypted MOGG file. Returns this
   * instantiated `MOGGFile` class if the MOGG file is already decrypted.
   * - - - -
   * @param {FilePathLikeTypes} decMoggPath The path to the decrypted MOGG file.
   * @returns {Promise<MOGGFile>}
   */
  async decrypt(decMoggPath: FilePathLikeTypes): Promise<MOGGFile> {
    if (await this.isEncrypted()) return await PythonAPI.decryptMOGG(this.path, decMoggPath)
    return this
  }

  /**
   * Encrypts a MOGG file using `0B` encryption and returns an instantiated `MOGGFile` class pointing to the new encrypted MOGG file. Returns this instantiated `MOGGFile` class if the MOGG file is already encrypted using the same `0B` encryption version.
   * - - - -
   * @param {FilePathLikeTypes} encMoggPath The path of the encrypted MOGG file.
   * @returns {Promise<MOGGFile>}
   */
  async encrypt(encMoggPath: FilePathLikeTypes): Promise<MOGGFile> {
    const thisEncVersion = await this.checkFileIntegrity()
    if (thisEncVersion === 11) return this
    return await BinaryAPI.makeMoggEncrypt(this.path, encMoggPath)
  }

  /**
   * Extracts all tracks from a MOGG file following the audio track structure defined by a Rock Band 3 songdata.
   *
   * Providing a directory path and the parsed song data from the song where the MOGG file belongs, the function will extract
   * the instruments stems from it, saving all files in the provided destination folder path
   * - - - -
   * @param {RB3CompatibleDTAFile} songdata The parsed song data of the song where the MOGG belongs.
   * @param {DirPathLikeTypes} destFolderPath The destination folder path where the tracks audio files will be created.
   * @returns {Promise<DirPath>}
   */
  async extractTracks(songdata: RB3CompatibleDTAFile, destFolderPath: DirPathLikeTypes): Promise<DirPath> {
    return await PythonAPI.moggTrackExtractor(this.path, songdata, destFolderPath)
  }

  /**
   * Creates a preview audio from this MOGG file following the audio track structure defined by a Rock Band 3 songdata.
   * - - - -
   * @param {RB3CompatibleDTAFile} songdata The parsed song data of the song where the MOGG belongs.
   * @param {FilePathLikeTypes} destPath The destination path where the preview audio will be created.
   * @param {PreviewAudioFormatTypes} [format] `OPTIONAL` The audio format of the preview. Default is `'wav'`.
   * @param {boolean} [mixCrowd] `OPTIONAL` If true, the crowd track will be mixed into the preview audio.
   * @returns {Promise<FilePath>}
   */
  async createPreview(songdata: RB3CompatibleDTAFile, destPath: FilePathLikeTypes, format?: 'wav' | 'flac' | 'ogg' | 'mp3', mixCrowd?: boolean): Promise<FilePath> {
    return await PythonAPI.moggPreviewCreator(this.path, songdata, destPath, format, mixCrowd)
  }
}
