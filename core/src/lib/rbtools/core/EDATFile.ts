import { BinaryReader, createHashFromBuffer, FilePath, pathLikeToFilePath, randomByteFromRanges, type FilePathJSONRepresentation, type FilePathLikeTypes } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import { BinaryAPI, MIDIFile } from '../core.exports'
import { edatStat, ps3GameIDs, type EDATFileStatObject, type RockBandPS3TitleIDs } from '../lib.exports'

// #region Types

export interface EDATDecryptionOptions {
  /**
   * `OPTIONAL` The destination of the decrypted EDAT file. If no destination path is provided, it will simply remove the `.edat` extension from the file name and save it on the same directory of the EDAT file.
   */
  destPath?: FilePathLikeTypes
  /**
   * The 16-bytes HEX string used to decrypt the EDAT file.
   */
  devKLicHash: string
}

export interface EDATFileJSONRepresentation extends FilePathJSONRepresentation, EDATFileStatObject {}

/**
 * `EDATFile` is a class that represents an EDAT file.
 * - - - -
 * @see {@link https://www.psdevwiki.com/ps3/NPD|EDAT File Format Specifications}
 */
export class EDATFile {
  // #region Static Methods

  /**
   * Generates a MD5 hash that decrypts Rock Band PS3 `EDAT` files based on the installed DLC folder name.
   * - - - -
   * @param {string} folderName The installed DLC folder name.
   * @returns {string}
   */
  static genDevKLicHash(folderName: string): string {
    return createHashFromBuffer(Buffer.from(`Ih38rtW1ng3r${folderName}10025250`), 'md5').toUpperCase()
  }

  /**
   * Generates a Content ID based on the given text. This can be used on EDAT file creation.
   * - - - -
   * @param {string} text The custom text to place on the Content ID.
   * @param {RockBandPS3TitleIDs} game `OPTIONAL`. Default is `rb3`.
   * @returns {string}
   */
  static genContentID(text: string, game: RockBandPS3TitleIDs = 'rb3'): string {
    let contentID = `UP${game === 'rb1' ? '0002' : '8802'}-${ps3GameIDs[game]}_00-`
    text = text.replace(/\s+/g, '').toUpperCase()
    if ((contentID + text).length > 36) {
      contentID += text
      contentID = contentID.slice(0, 36)
    } else if ((contentID + text).length < 36) {
      const diff = 36 - (contentID + text).length
      contentID += text
      for (let i = 0; i < diff; i++) {
        contentID += randomByteFromRanges(1).toString('hex').toUpperCase()
      }
    } else contentID += text

    return contentID
  }

  // #region Constructor

  /**
   * The path to the EDAT file.
   */
  path: FilePath

  /**
   * `EDATFile` is a class that represents an EDAT file.
   * - - - -
   * @param {FilePathLikeTypes} edatFilePath The path of the EDAT file.
   * @see {@link https://www.psdevwiki.com/ps3/NPD|EDAT File Format Specifications}
   */
  constructor(edatFilePath: FilePathLikeTypes) {
    this.path = pathLikeToFilePath(edatFilePath)
  }

  // #region Instance Methods

  /**
   * Checks the integrity of the instantiated EDAT file by reading its signature (magic bytes).
   * - - - -
   * @returns {Promise<string>}
   * @throws {Error} When it identifies file signature of a MIDI file or any unknown file format.
   */
  async checkFileIntegrity(): Promise<string> {
    if (!this.path.exists) throw new Error(`Provided EDAT file path "${this.path.path}" does not exists\n`)
    const magic = await BinaryReader.fromBuffer(await this.path.readOffset(0, 4)).readUInt32BE()

    // NPD
    if (magic === 0x4e504400) return 'NPD'
    // MThd
    else if (magic === 0x4d546864) throw new Error(`Provided EDAT file "${this.path.path}" is a decrypted MIDI file with no HMX EDAT header.`)
    throw new Error(`Provided EDAT file "${this.path.path}" is not a valid EDAT or decrypted MIDI file with no HMX EDAT header.`)
  }

  /**
   * Checks if the provided USRDIR folder is valid.
   * - - - -
   * @returns {boolean}
   */
  isUSRDIRPathValid(): boolean {
    const usrdir = this.path.gotoDir('../../../')
    const eboot = usrdir.gotoFile('EBOOT.BIN')
    const gen = usrdir.gotoDir('gen')
    if (usrdir.exists && eboot.exists && gen.exists) return true
    return false
  }

  /**
   * Checks if the EDAT file is encrypted, returns `false` when the EDAT file is a MIDI file with EDAT extension.
   * - - - -
   * @returns {Promise<boolean>}
   */
  async isEncrypted(): Promise<boolean> {
    try {
      await this.checkFileIntegrity()
      return true
    } catch (error) {
      if (error instanceof Error && error.message.includes('is a decrypted MIDI file')) return false
      else throw error
    }
  }

  /**
   * Returns an object with stats of the EDAT file.
   * - - - -
   * @returns {Promise<EDATFileStatObject>}
   */
  async stat(): Promise<EDATFileStatObject> {
    return await edatStat(this.path)
  }

  /**
   * Returns a JSON representation of this `EDATFile` class.
   *
   * This method is very similar to `.stat()`, but also returns information about the image file path.
   * - - - -
   * @returns {Promise<EDATFileJSONRepresentation>}
   */
  async toJSON(): Promise<EDATFileJSONRepresentation> {
    return {
      ...this.path.toJSON(),
      ...(await this.stat()),
    }
  }

  /**
   * Decrypts the EDAT file using a `devKLic` key hash and returns an instance of `MIDIFile` pointing to the decrypted MIDI file.
   * - - - -
   * @param {EDATDecryptionOptions} options An object with options to the decrypting process.
   * @returns {Promise<MIDIFile>}
   */
  async decrypt(options: EDATDecryptionOptions): Promise<MIDIFile> {
    const stat = await this.toJSON()
    if (!stat.isEncrypted) {
      const destPath = options.destPath ? pathLikeToFilePath(options.destPath) : FilePath.of(`${stat.root}/${stat.name}`)
      return new MIDIFile(await this.path.copy(destPath))
    }
    const { destPath, devKLicHash } = useDefaultOptions(
      {
        destPath: FilePath.of(`${stat.root}/${stat.name}`),
        devKLicHash: stat.devKLicHash ?? '',
      },
      options
    )
    const dest = pathLikeToFilePath(destPath)
    dest.changeThisFileExt('.mid')
    await BinaryAPI.edatToolDecrypt(this.path, devKLicHash, dest)
    return new MIDIFile(dest)
  }
}
