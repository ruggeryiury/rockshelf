import { BinaryReader, BinaryWriter, FilePath, type FilePathLikeTypes, pathLikeToFilePath, StreamWriter } from 'node-lib'
import { createReadStream } from 'node:fs'
import { useDefaultOptions } from 'use-default-options'
import { rsPackImage, type ParsedRSPackImageObject, type RSPackImageEncryptionStatusValues, type RSPackImagePackageCategoryValues, type RSPackImageSourceValues, type RSPackImageTypeValues } from '../../lib.exports'
import { getKeyFromMapValue, dateISOFormatToObject } from '../rbtools/utils.exports'

export interface RSPackImageCreatorOptions {
  type?: RSPackImageTypeValues
  source?: RSPackImageSourceValues
  encryptionStatus?: RSPackImageEncryptionStatusValues
  category?: RSPackImagePackageCategoryValues
  packageName?: string
  creationDate?: string
}

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

export const createRSPackImage = async (imageFilePathOrBuffer: FilePathLikeTypes | Buffer, destPath: FilePathLikeTypes, options?: RSPackImageCreatorOptions): Promise<{ path: FilePath; header: ParsedRSPackImageObject }> => {
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

  extraData.writeUInt8(packageName.length)
  extraData.writeUTF8(packageName)

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
