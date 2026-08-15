import { BinaryReader, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { dateISOFormatObjectToDateISOString } from '../rbtools/utils.exports'
import { rsPackImage, type RSPackImagePackageCategoryNumbers, type RSPackImagePackageCategoryValues } from '../rspackimg/parseRSPackImage'
import { RB3_HEADER_PADDING, RB3_HEADER_SIZE, RB3_SONG_ENTRY_PADDING, RB3_SONG_ENTRY_SIZE, RB3_SONGNAME_MAX_LENGTH } from './createRB3File'

export interface RB3FileHeaderSongEntriesObject {
  /**
   * The song's internal name.
   */
  songname: string
  /**
   * The offset where the song data starts.
   */
  offset: number
  /**
   * The length of the song's MOGG file.
   */
  moggSize: number
  /**
   * The length of the song's MIDI file.
   */
  midiSize: number
  /**
   * The length of the song's artwork thumbnail file.
   */
  artworkSize: number
  /**
   * The length of the song's MILO file.
   */
  miloSize: number
  /**
   * The length of the song's PAN file.
   */
  panSize: number
  /**
   * The length of the song's USR file.
   */
  usrSize: number
  /**
   * The length of the song's VNN file.
   */
  vnnSize: number
  /**
   * The length of the song's VOC file.
   */
  vocSize: number
  /**
   * The length of the song's XVOCAB file.
   */
  xvocabSize: number
  /**
   * The length of the song's WEIGHTS file.
   */
  weightsSize: number
}

export interface RB3FileHeaderObject {
  /**
   * The version of the RB3 file. Used to switch between different parsing process.
   */
  fileVersion: number
  /**
   * The amount of songs included on the song package.
   */
  songsCount: number
  /**
   * The length of the song package name string.
   */
  packageNameLength: number
  /**
   * The length of the default song package folder name.
   */
  packageFolderNameLength: number
  /**
   * The installation type of the song package. Tells if the song was created/installed through Rockshelf or other methods.
   *
   * - `0` = Created/installed through Rockshelf.
   * - `1` = Created/installed through other methods (probably installed directly on RPCS3 using PKG files/folder).
   */
  installationType: 'rockshelf' | 'other'
  /**
   * The source of the song package.
   *
   * - `0` = Merged (Different packages file types joined).
   * - `1` = STFS (Package created from a single CON file).
   * - `2` = PKG (Package created from a single PKG file).
   */
  sourceType: 'merged' | 'stfs' | 'pkg'
  /**
   * The encryption status of the song package.
   *
   * - `0` = Unknown (Might have both encrypted and decrypted files).
   * - `1` = Encrypted.
   * - `2` = Decrypted.
   * - `3` = Mixed (Rarely used).
   */
  encryptionStatus: 'unknown' | 'encrypted' | 'decrypted' | 'mixed'
  /**
   * The category of the song package. The catogies are pre-defined in Rockshelf.
   *
   * - `0` = "Other Packages"
   * - `1` = "Author Packages"
   * - `2` = "Artist/Band Packages"
   * - `3` = "Full Album Packages"
   * - `4` = "Singles"
   * - `5` = "Rock Band Packages"
   * - `6` = "Guitar Hero Packages"
   * - `7` = "Official Packages"
   * - `8` = "Unofficial Packages"
   * - `9` = "Themed Packages"
   * - `10` = "Seasonal Packages"
   * - `11` = "Debug"
   */
  packageCategory: RSPackImagePackageCategoryValues
  /**
   * The length of the song package creator name.
   */
  packageCreatorNameLength: number
  /**
   * The length of the song package DTA file bytes.
   */
  dtaFileLength: number
  /**
   * The length of the song package description file bytes.
   */
  descriptionLength: number
  /**
   * The length of the song package thumbnail image file bytes (only RAW JPEG data).
   */
  thumbnailLength: number
  /**
   * The length of the song package creator thumbnail image file bytes (only RAW JPEG data).
   */
  packageCreatorThumbnailLength: number
  /**
   * The song package creation year ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).
   */
  creationYear: number
  /**
   * The song package creation month ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).
   */
  creationMonth: number
  /**
   * The song package creation day ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).
   */
  creationDay: number
  /**
   * The song package creation hours ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).
   */
  creationHour: number
  /**
   * The song package creation minutes ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).
   */
  creationMinute: number
  /**
   * The song package creation seconds ([ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format).
   */
  creationSecond: number
  /**
   * The song package creation date encoded as a ISO string.
   */
  dateISOString: string
  /**
   * The size of the song package.
   */
  packageSize: number
  /**
   * The offset where the actual songs data starts on the package.
   */
  songDataOffset: number
  /**
   * The console-specific format of the song package files
   *
   * - `0` = Xbox 360.
   * - `1` = PS3.
   */
  filesFormat: 'xbox' | 'ps3'
  /**
   * The song package contents hash in [SHA256 algorithm](https://en.wikipedia.org/wiki/SHA-2).
   */
  packageHash: string
  /**
   * An array of objects representing the offset of each file from a song available on the package.
   */
  songEntries: RB3FileHeaderSongEntriesObject[]
}

/**
 * Parses a Rock Band 3 Song Package file contents.
 * - - - -
 * @param {FilePathLikeTypes} rb3FilePath The path to the Rock Band 3 Song Package file to be parsed.
 * @returns {Promise<RB3FileHeaderObject>}
 */
export const parseRB3FileHeader = async (rb3FilePath: FilePathLikeTypes): Promise<RB3FileHeaderObject> => {
  const rb3File = pathLikeToFilePath(rb3FilePath)
  const reader = await BinaryReader.fromFile(rb3File)

  if (reader.length < RB3_HEADER_SIZE + RB3_SONG_ENTRY_SIZE) throw new Error('RB3 Song Package file is too small to process, is the file corrupted?')

  reader.seek(0)

  const magic = await reader.readASCII(3)
  if (magic !== 'RB3') throw new Error(`Invalid file signature of RB3 Song Package file.`)

  const fileVersion = await reader.readUInt8()
  const songsCount = await reader.readUInt16LE()
  const dtaFileLength = await reader.readUInt24LE()
  const descriptionLength = await reader.readUInt24LE()
  const thumbnailLength = await reader.readUInt24LE()

  const pff = await reader.readUInt8()
  const filesFormat = pff === 0 ? 'xbox' : 'ps3'

  const packageCreatorThumbnailLength = await reader.readUInt16LE()
  const packageNameLength = await reader.readUInt8()
  const packageFolderNameLength = await reader.readUInt8()
  const packageCreatorNameLength = await reader.readUInt8()

  const it = await reader.readUInt8()
  const installationType = it === 0 ? 'rockshelf' : 'other'

  const st = await reader.readUInt8()
  const sourceType = st === 0 ? 'merged' : st === 1 ? 'stfs' : 'pkg'

  const es = await reader.readUInt8()
  const encryptionStatus = es === 0 ? 'unknown' : es === 1 ? 'encrypted' : es === 2 ? 'decrypted' : 'mixed'

  const cat = (await reader.readUInt8()) as RSPackImagePackageCategoryNumbers
  const packageCategory = rsPackImage.packageCategory[cat]

  const creationHour = await reader.readUInt8()
  const creationMinute = await reader.readUInt8()
  const creationSecond = await reader.readUInt8()
  const creationYear = await reader.readUInt16LE()
  const creationMonth = await reader.readUInt8()
  const creationDay = await reader.readUInt8()
  const dateISOString = dateISOFormatObjectToDateISOString({ day: creationDay, month: creationMonth, hour: creationHour, min: creationMinute, sec: creationSecond, year: creationYear })

  const songDataOffset = await reader.readUInt32LE()
  const packageSize = await reader.readUInt24LE()
  reader.padding(RB3_HEADER_PADDING)
  const packageHash = await reader.readHex(0x20, false)

  reader.seek(RB3_HEADER_SIZE)

  const songEntries: RB3FileHeaderObject['songEntries'] = []

  for (let i = 0; i < songsCount; i++) {
    const songname = await reader.readASCII(RB3_SONGNAME_MAX_LENGTH)
    const offset = Number(await reader.readUInt64LE())
    const moggSize = await reader.readUInt32LE()
    const midiSize = await reader.readUInt32LE()
    const artworkSize = await reader.readUInt32LE()
    const miloSize = await reader.readUInt32LE()
    const panSize = await reader.readUInt24LE()
    const usrSize = await reader.readUInt24LE()
    const vnnSize = await reader.readUInt24LE()
    const vocSize = await reader.readUInt24LE()
    const xvocabSize = await reader.readUInt24LE()
    const weightsSize = await reader.readUInt24LE()
    reader.padding(RB3_SONG_ENTRY_PADDING)
    songEntries.push({ songname, offset, moggSize, midiSize, artworkSize, miloSize, panSize, usrSize, vnnSize, vocSize, xvocabSize, weightsSize })
  }

  await reader.close()

  return {
    fileVersion,
    songsCount,
    packageNameLength,
    packageFolderNameLength,
    installationType,
    sourceType,
    encryptionStatus,
    packageCreatorNameLength,
    dtaFileLength,
    descriptionLength,
    thumbnailLength,
    packageCreatorThumbnailLength,
    creationYear,
    creationMonth,
    creationDay,
    creationHour,
    creationMinute,
    creationSecond,
    dateISOString,
    packageSize,
    songDataOffset,
    filesFormat,
    packageCategory,
    packageHash,
    songEntries,
  }
}
