// #region Types

import { BinaryReader, type FilePathLikeTypes } from 'node-lib'

export interface U8ArchiveEntries {
  /**
   * The name of the file or directory.
   */
  name: string
  /**
   * The type of the node.
   */
  nodeType: 'file' | 'dir'
  /**
   * The offset of the entry name in the string pool.
   */
  stringPoolOffset: number
  /**
   * - File: Offset of begin of data.
   * - Directory: Index of the parent directory.
   */
  fileDataOffset: number
  /**
   * - File: Size of data.
   * - Directory: Index of the first node that is not part of this directory (skip to node).
   */
  fileDataSize: number
}

export interface U8AppFileHeader {
  /**
   * The file signature. Always `55` `AA` `38` `2D`.
   */
  magic: string
  /**
   * The offset to the first node.
   */
  firstNodeOffset: number
  /**
   * Size of all nodes including the string table.
   */
  allNodesSizePlusStringTable: number
  /**
   * File offset of data.
   */
  dataOffset: number
  /**
   * The offset of the string pool.
   */
  stringPoolOffset: number
  /**
   * The amount of file entries on the U8 archive.
   */
  entriesCount: number
  /**
   * An array with the entries of the archive.
   */
  entries: U8ArchiveEntries[]
}

/**
 * Parses the U8 archive header and entries.
 * - - - -
 * @returns {Promise<U8AppFileHeader>}
 * @throws {Error} When it identifies file signature of any unknown file format.
 */
export const parseU8ArchiveHeader = async (u8FilePath: FilePathLikeTypes): Promise<U8AppFileHeader> => {
  const reader = await BinaryReader.fromFile(u8FilePath)
  const magic = await reader.readHex(4)
  const firstNodeOffset = await reader.readInt32BE()
  const allNodesSizePlusStringTable = await reader.readInt32BE()
  const dataOffset = await reader.readInt32BE()
  reader.seek(firstNodeOffset)
  const filesSpec: { nodeType: 'file' | 'dir'; stringPoolOffset: number; fileDataOffset: number; fileDataSize: number }[] = []

  let gettingNodesData = true
  let entriesCount = 0
  do {
    const dataTable = await reader.read(0xc)
    const dataReader = BinaryReader.fromBuffer(dataTable)
    const nodeType = (await dataReader.readUInt8()) === 0 ? 'file' : 'dir'
    const stringPoolOffset = await dataReader.readUInt24BE()
    if (stringPoolOffset > allNodesSizePlusStringTable) {
      gettingNodesData = false
      continue
    }
    const fileDataOffset = await dataReader.readUInt32BE()
    const fileDataSize = await dataReader.readUInt32BE()
    entriesCount++
    filesSpec.push({ nodeType, stringPoolOffset, fileDataOffset, fileDataSize })
    continue
  } while (gettingNodesData)

  const entries: { name: string; nodeType: 'file' | 'dir'; stringPoolOffset: number; fileDataOffset: number; fileDataSize: number }[] = []
  const stringPoolOffset = 0x20 + entriesCount * 0xc
  let nextStringOffset = 0
  reader.seek(stringPoolOffset)

  for (let i = 0; i < filesSpec.length; i++) {
    reader.seek(stringPoolOffset + nextStringOffset)
    const spec = filesSpec[i]
    if (i === 0) {
      entries.push({
        name: '.',
        ...spec,
      })
      nextStringOffset = filesSpec[i + 1].stringPoolOffset
    } else if (i < filesSpec.length - 1) {
      entries.push({ name: await reader.readASCII(filesSpec[i + 1].stringPoolOffset - nextStringOffset), ...spec })
      nextStringOffset = filesSpec[i + 1].stringPoolOffset
    } else {
      entries.push({ name: await reader.readASCII(dataOffset - stringPoolOffset - nextStringOffset), ...spec })
    }
  }

  await reader.close()

  return {
    magic,
    firstNodeOffset,
    allNodesSizePlusStringTable,
    dataOffset,
    stringPoolOffset,
    entriesCount,
    entries,
  }
}
