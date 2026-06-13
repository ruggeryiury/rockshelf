import { BinaryReader, type FilePathLikeTypes, pathLikeToFilePath } from 'node-lib'
import { dateISOFormatObjectToDateISOString } from '../rbtools/utils.exports'

export const rsPackImage = {
  fileVersion: {
    1: 'Version 1',
  },
  type: {
    0: 'rockshelf',
    1: 'other',
  },
  source: {
    0: 'merged',
    1: 'stfs',
    2: 'pkg',
    3: 'rb3',
  },
  encryptionStatus: {
    0: 'unknown',
    1: 'encrypted',
    2: 'decrypted',
    3: 'mixed',
  },
} as const

export type RSPackImageFileVersionNumbers = keyof typeof rsPackImage.fileVersion
export type RSPackImageFileVersionValues = (typeof rsPackImage.fileVersion)[keyof typeof rsPackImage.fileVersion]

export type RSPackImageTypeNumbers = keyof typeof rsPackImage.type
export type RSPackImageTypeValues = (typeof rsPackImage.type)[keyof typeof rsPackImage.type]

export type RSPackImageSourceNumbers = keyof typeof rsPackImage.source
export type RSPackImageSourceValues = (typeof rsPackImage.source)[keyof typeof rsPackImage.source]

export type RSPackImageEncryptionStatusNumbers = keyof typeof rsPackImage.encryptionStatus
export type RSPackImageEncryptionStatusValues = (typeof rsPackImage.encryptionStatus)[keyof typeof rsPackImage.encryptionStatus]

export interface ParsedRSPackImageObject {
  /**
   * The version of the Rockshelf Pack Image. This is used internally to switch between different parser methods based on the version of the file.
   */
  fileVersion: RSPackImageFileVersionNumbers
  /**
   * The installation type of the song package.
   *
   * - `"rockshelf"`: Installed through Rockshelf itself.
   * - `"other"`: Installed through other program (probably Onyx).
   */
  type: RSPackImageTypeValues
  /**
   * The installation source of the song package.
   */
  source: RSPackImageSourceValues
  /**
   * The encryption status of the package files.
   */
  encryptionStatus: RSPackImageEncryptionStatusValues
  /**
   * The display name of the song package on Rockshelf.
   */
  packageName: string
  /**
   * The creation date of the file in ISO string format.
   */
  creationDate: string
}

export interface RSPackImageValidationResults {
  fileVersion: RSPackImageFileVersionNumbers
  buffer: Buffer
  footerSizeLength: number
}

/**
 * Checks if a provided image file is a valid Rockshelf Pack Image file. Returns `undefined` if the provided image file doesn't have a valid Rockshelf Pack Image file signature found on the file's footer, or an array with the Rockshelf Pack Image file version and a `Buffer` object of the additional data.
 * - - - -
 * @param {FilePathLikeTypes} srcPath The path to the JPEG image to be evaluated.
 * @returns {Promise<RSPackImageValidationResults | undefined>}
 */
export const isJPEGRockshelfPackImage = async (srcPath: FilePathLikeTypes): Promise<RSPackImageValidationResults | undefined> => {
  const src = pathLikeToFilePath(srcPath)
  const reader = await src.openReader()
  const imageFileSize = reader.length
  reader.seek(imageFileSize - 4)
  const footerSizeLength = await reader.readUInt32LE()
  if (imageFileSize - footerSizeLength <= 4) {
    await reader.close()
    return
  }
  reader.seek(imageFileSize - footerSizeLength)
  const magic = await reader.readASCII(4)
  if (magic !== 'RSDT') {
    await reader.close()
    return
  }
  const fileVersion = (await reader.readUInt8()) as RSPackImageFileVersionNumbers
  const buffer = await reader.read()
  await reader.close()
  return {
    fileVersion,
    buffer,
    footerSizeLength,
  }
}

/**
 * Parses a version 1 Rockshelf Pack Image footer `Buffer` object.
 * - - - -
 * @param {Buffer} rsdatBuffer The footer bytes of a Rockshelf Pack Image as `Buffer`.
 * @returns {Promise<ParsedRSPackImageObject>}
 */
export const parseRSDATBuffer = async (rsdatBuffer: Buffer): Promise<ParsedRSPackImageObject> => {
  const reader = BinaryReader.fromBuffer(rsdatBuffer)
  const type = (await reader.readUInt8()) as RSPackImageTypeNumbers
  const source = (await reader.readUInt8()) as RSPackImageSourceNumbers
  const encryptionStatus = (await reader.readUInt8()) as RSPackImageEncryptionStatusNumbers
  reader.padding(13)
  const year = await reader.readUInt16LE()
  const month = await reader.readUInt8()
  const day = await reader.readUInt8()
  const hour = await reader.readUInt8()
  const min = await reader.readUInt8()
  const sec = await reader.readUInt8()

  const creationDate = dateISOFormatObjectToDateISOString({ day, hour, min, month, sec, year })

  const packageNameLength = await reader.readUInt8()
  const packageName = await reader.readUTF8(packageNameLength)

  return {
    fileVersion: 1,
    type: (rsPackImage.type[type] as RSPackImageTypeValues | undefined) ?? 'rockshelf',
    source: (rsPackImage.source[source] as RSPackImageSourceValues | undefined) ?? 'stfs',
    encryptionStatus: (rsPackImage.encryptionStatus[encryptionStatus] as RSPackImageEncryptionStatusValues | undefined) ?? 'unknown',
    creationDate,
    packageName,
  }
}

/**
 * Parses a Rockshelf Pack Image file.
 * - - - -
 * @param {FilePathLikeTypes} srcPath The path to the JPEG image to be parsed.
 * @returns {Promise<ParsedRSPackImageObject>}
 * @throws {Error} If the provided JPEG image file is not a valid Rockshelf Pack Image file.
 */
export const parseRSPackImageFile = async (srcPath: FilePathLikeTypes): Promise<ParsedRSPackImageObject> => {
  const src = pathLikeToFilePath(srcPath)
  const results = await isJPEGRockshelfPackImage(srcPath)
  if (!results) throw new Error(`Provided JPEG image file "${src.path}" is not a valid Rockshelf Pack Image file.`)
  const { buffer, fileVersion } = results

  switch (fileVersion) {
    case 1:
    default:
      return await parseRSDATBuffer(buffer)
  }
}
