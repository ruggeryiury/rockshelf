import { BinaryReader, BinaryWriter, FilePath, type FilePathLikeTypes, pathLikeToFilePath, StreamWriter } from 'node-lib'
import { createReadStream } from 'node:fs'
import { useDefaultOptions } from 'use-default-options'
import { rsPackImage, type ParsedRSPackImageObject, type RSPackImageEncryptionStatusValues, type RSPackImagePackageCategoryValues, type RSPackImageSourceValues, type RSPackImageTypeValues } from '../../lib.exports'
import { getKeyFromMapValue, dateISOFormatToObject } from '../rbtools/utils.exports'

export interface RSPackImageCreatorOptions {
  /**
   * The installation type of the song package. Tells if the song was created/installed through Rockshelf or other methods.
   *
   * - `0` = Created/installed through Rockshelf.
   * - `1` = Created/installed through other methods (probably installed directly on RPCS3 using PKG files/folder).
   */
  type?: RSPackImageTypeValues
  /**
   * The source of the song package.
   *
   * - `0` = Merged (Different packages file types joined).
   * - `1` = STFS (Package created from a single CON file).
   * - `2` = PKG (Package created from a single PKG file).
   */
  source?: RSPackImageSourceValues
  /**
   * The encryption status of the song package.
   *
   * - `0` = Unknown (Might have both encrypted and decrypted files).
   * - `1` = Encrypted.
   * - `2` = Decrypted.
   * - `3` = Mixed (Rarely used).
   */
  encryptionStatus?: RSPackImageEncryptionStatusValues
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
  category?: RSPackImagePackageCategoryValues
  /**
   * The name of the song package.
   */
  packageName?: string
  /**
   * The song package creation date encoded as a ISO string.
   */
  creationDate?: string
}

/**
 * Removes the extra bytes from a Rockshelf Pack Image file buffer, returning the buffer with only raw JPEG file data.
 * - - - -
 * @param {Buffer} input The Rockshelf Pack Image file buffer you want to extract the JPEG data from.
 * @returns {Promise<Buffer>}
 */
export const removeRSDataFromBuffer = async (input: Buffer): Promise<Buffer> => {
  const reader = BinaryReader.fromBuffer(input)
  const imageFileSize = reader.length
  reader.seek(imageFileSize - 4)
  const footerSizeLength = await reader.readUInt32LE()
  if (imageFileSize - footerSizeLength <= 4) {
    await reader.close()
    return input
  }
  reader.seek(imageFileSize - footerSizeLength)
  const magic = await reader.readASCII(4)
  if (magic !== 'RSDT') {
    await reader.close()
    return input
  }

  reader.seek(0)
  return await reader.read(imageFileSize - footerSizeLength)
}

export interface RockshelfPackImageCreatorReturnObject {
  /**
   * The path of the new Rockshelf Pack Image file.
   */
  path: FilePath
  /**
   * An object with values from the extra bytes of the Rockshelf Pack Image file.
   */
  header: ParsedRSPackImageObject
}

/**
 * Creates a Rockshelf Pack Image file.
 * - - - -
 * @param {FilePathLikeTypes | Buffer} imageFilePathOrBuffer The path to an image file, or an image file buffer.
 * @param {FilePathLikeTypes} destPath The destination path of the new Rockshelf Pack Image file.
 * @param {RSPackImageCreatorOptions | undefined} [options] `OPTIONAL` An object with values that tweaks the file creation process.
 * @returns {Promise<RockshelfPackImageCreatorReturnObject>}
 */
export const createRSPackImage = async (imageFilePathOrBuffer: FilePathLikeTypes | Buffer, destPath: FilePathLikeTypes, options?: RSPackImageCreatorOptions): Promise<RockshelfPackImageCreatorReturnObject> => {
  let img: FilePath | Buffer
  if (Buffer.isBuffer(imageFilePathOrBuffer)) img = await removeRSDataFromBuffer(imageFilePathOrBuffer)
  else img = pathLikeToFilePath(imageFilePathOrBuffer)
  const dest = pathLikeToFilePath(destPath)

  const nowDate = new Date().toISOString()
  const date = dateISOFormatToObject(nowDate)

  const { type, source, encryptionStatus, category, packageName, creationDate } = useDefaultOptions<RSPackImageCreatorOptions>(
    {
      type: 'rockshelf',
      source: 'stfs',
      encryptionStatus: 'unknown',
      category: 'other',
      packageName: '',
      creationDate: nowDate,
    },
    options
  )

  if (packageName.length === 0) throw new Error("Provided package name for Rockshelf Pack Image file can't be blank.")
  const writer = await StreamWriter.toFile(dest)

  await new Promise((resolve, reject) => {
    if (Buffer.isBuffer(img)) {
      writer.write(img)
      resolve(null)
    } else {
      const srcReadStream = createReadStream(img.path)

      srcReadStream.on('data', (chunk) => {
        writer.write(chunk)
      })

      srcReadStream.on('error', (err) => reject(err))

      srcReadStream.on('end', () => {
        srcReadStream.close()
        resolve(null)
      })
    }
  })

  const extraData = new BinaryWriter()
  extraData.writeASCII('RSDT')
  extraData.writeUInt8(1) // File version
  extraData.writeUInt8(getKeyFromMapValue(rsPackImage.type, type) ?? 0)
  extraData.writeUInt8(getKeyFromMapValue(rsPackImage.source, source) ?? 0)
  extraData.writeUInt8(getKeyFromMapValue(rsPackImage.encryptionStatus, encryptionStatus) ?? 0)
  extraData.writeUInt8(getKeyFromMapValue(rsPackImage.packageCategory, category) ?? 0)

  extraData.write(Buffer.alloc(12))

  extraData.writeUInt16LE(date.year)
  extraData.writeUInt8(date.month)
  extraData.writeUInt8(date.day)
  extraData.writeUInt8(date.hour)
  extraData.writeUInt8(date.min)
  extraData.writeUInt8(date.sec)

  const packageNameBuffer = Buffer.from(packageName, 'utf-8')

  extraData.writeUInt8(packageNameBuffer.length)
  extraData.write(packageNameBuffer)

  const extraDataLength = extraData.length + 4
  extraData.writeUInt32LE(extraDataLength)

  writer.write(extraData.toBuffer())

  extraData.clearContents()
  await writer.close()

  return {
    path: dest,
    header: {
      fileVersion: 1,
      type,
      source,
      encryptionStatus,
      category,
      creationDate,
      packageName,
    },
  }
}
