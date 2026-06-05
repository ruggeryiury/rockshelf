import { BinaryReader, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { dateISOFormatObjectToDateISOString } from '../utils/date'

export interface RB3FileHeaderSongEntriesObject {
  songname: string
  offset: number
  moggSize: number
  midiSize: number
  artworkSize: number
  miloSize: number
}

export interface RB3FileHeaderObject {
  fileVersion: number
  songsCount: number
  packageNameLength: number
  defaultFolderNameLength: number
  installationType: 'rockshelf' | 'other'
  sourceType: 'merged' | 'stfs' | 'pkg'
  encryptionStatus: 'unknown' | 'encrypted' | 'decrypted' | 'mixed'
  authorNameLength: number
  dtaFileLength: number
  descriptionLength: number
  thumbnailLength: number
  authorThumbnailLength: number
  creationYear: number
  creationMonth: number
  creationDay: number
  creationHour: number
  creationMinute: number
  creationSecond: number
  dateISOString: string
  packageSize: number
  songDataOffset: number
  packageFilesFormat: 'xbox' | 'ps3'
  packageHash: string
  songEntries: RB3FileHeaderSongEntriesObject[]
}

export const parseRB3FileHeader = async (rb3FilePath: FilePathLikeTypes): Promise<RB3FileHeaderObject> => {
  const rb3File = pathLikeToFilePath(rb3FilePath)
  const reader = await BinaryReader.fromFile(rb3File)

  if (reader.length < 0xa0) throw new Error('RB3 Song Package file is too small to process, is the file corrupted?')

  reader.seek(0)

  const magic = await reader.readASCII(3)
  if (magic !== 'RB3') throw new Error(`Invalid file signature of RB3 Song Package file.`)

  const fileVersion = await reader.readUInt8()
  const songsCount = await reader.readUInt16LE()
  const packageNameLength = await reader.readUInt8()
  const defaultFolderNameLength = await reader.readUInt8()

  const it = await reader.readUInt8()
  const installationType = it === 0 ? 'rockshelf' : 'other'
  const st = await reader.readUInt8()
  const sourceType = st === 0 ? 'merged' : st === 1 ? 'stfs' : 'pkg'
  const es = await reader.readUInt8()
  const encryptionStatus = es === 0 ? 'unknown' : es === 1 ? 'encrypted' : es === 2 ? 'decrypted' : 'mixed'
  const authorNameLength = await reader.readUInt8()
  const dtaFileLength = await reader.readUInt32LE()
  const descriptionLength = await reader.readUInt32LE()
  const thumbnailLength = await reader.readUInt32LE()
  const authorThumbnailLength = await reader.readUInt16LE()

  const creationYear = await reader.readUInt16LE()
  const creationMonth = await reader.readUInt8()
  const creationDay = await reader.readUInt8()
  const creationHour = await reader.readUInt8()
  const creationMinute = await reader.readUInt8()
  const creationSecond = await reader.readUInt8()
  const dateISOString = dateISOFormatObjectToDateISOString({ day: creationDay, month: creationMonth, hour: creationHour, min: creationMinute, sec: creationSecond, year: creationYear })

  const packageSize = Number(await reader.readUInt64LE())
  const songDataOffset = await reader.readUInt32LE()
  const pff = await reader.readUInt8()
  const packageFilesFormat = pff === 0 ? 'xbox' : 'ps3'
  reader.padding(0x02)
  const packageHash = await reader.readHex(0x20, false)

  reader.seek(0x50)

  const songEntries: RB3FileHeaderObject['songEntries'] = []

  for (let i = 0; i < songsCount; i++) {
    const songname = await reader.readASCII(0x2a)
    const offset = Number(await reader.readUInt64LE())
    const moggSize = await reader.readUInt32LE()
    const midiSize = await reader.readUInt32LE()
    const artworkSize = await reader.readUInt32LE()
    const miloSize = await reader.readUInt32LE()
    reader.padding(0x0e)
    songEntries.push({ songname, offset, moggSize, midiSize, artworkSize, miloSize })
  }

  await reader.close()

  return {
    fileVersion,
    songsCount,
    packageNameLength,
    defaultFolderNameLength,
    installationType,
    sourceType,
    encryptionStatus,
    authorNameLength,
    dtaFileLength,
    descriptionLength,
    thumbnailLength,
    authorThumbnailLength,
    creationYear,
    creationMonth,
    creationDay,
    creationHour,
    creationMinute,
    creationSecond,
    dateISOString,
    packageSize,
    songDataOffset,
    packageFilesFormat,
    packageHash,
    songEntries,
  }
}

export const parseRB3FileJSONRepresentation = async (rb3FilePath: FilePathLikeTypes) => {
  const header = parseRB3FileHeader(rb3FilePath)

  const reader = await BinaryReader.fromFile(rb3FilePath)

  await reader.close()
}
