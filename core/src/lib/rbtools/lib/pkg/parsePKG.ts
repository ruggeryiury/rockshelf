import { BinaryReader, createHashFromBuffer, HexStr, MyObject, pathLikeToFilePath, pathLikeToString, type FilePathLikeTypes } from 'node-lib'
import { calculateAesAlignedOffsetAndSize, parseSFOFileOrBuffer, PkgAesCtrCounter, pkgContentKeys, PkgXorSha1Counter, type CalculatedAesOffsetAndSizeObject, type SFOData } from '../../lib.exports'
import { createCipheriv } from 'node:crypto'

// #region Types
export interface PKGHeaderData {
  /**
   * The file signature.
   *
   * Always `[0x7F 0x50 0x4B 0x47]` " PKG" for Rock Band 3 Song Package.
   */
  magic: string
  /**
   * `[0x80 0x00]` for finalized (retail), `[0x00 0x00]` for non finalized (debug).
   *
   * Always `[0x00 0x00]` for Rock Band 3 Song Package.
   */
  revision: number
  pkgType: number
  pkgPlatform: string
  metadataOffset: number
  metadataCount: number
  headerSize: number
  itemCount: number
  totalSize: number
  dataOffset: number
  dataSize: number
  contentID: string
  cidTitle1: string
  cidTitle2: string
  digest: string
  dataRIV: string
  metadataSize: number
  keyIndex: number
  pkgDebug: boolean
  paramSFO: string
  debugXorIV: string
  metadata: PKGMetadata[]
  aesCtr: PkgAesCtrCounter[]
  xorCtr: PkgXorSha1Counter
}

export interface PKGMetadata {
  typeDesc: string
  value:
    | {
        type: string
        data: number[]
      }
    | string
    | number
    | bigint
    | Buffer
  size?: number
  hexSize?: number
  binSize?: number
  pkgSize?: number
  revision?: string
  version?: string
  unknownBytes?: Buffer
}

export interface PKGItemEntriesData {
  offset: number
  size: number
  entriesSize: number
  namesOffset: number
  namesSize: number
  sha256: string
  fileOffset: number
  fileOffsetEnd: number
  dlcFolderName: string
  items: PKGItemEntriesMap[]
}

export interface PKGItemEntriesMap {
  name: string
  itemIndex: number
  itemKeyIndex: number
  itemNameOffset: number
  itemNameSize: number
  itemDataOffset: number
  itemDataSize: number
  itemAlign: CalculatedAesOffsetAndSizeObject
  flags: number
  isFile: boolean
  isDir: boolean
}

export interface PKGData {
  /**
   * The path of the processed PKG file. This value is `null` if the provided parsing object was a PKG file `Buffer`.
   */
  pkgFilePath: string | null
  /**
   * An object containing parsed data from the PKG file header.
   */
  header: PKGHeaderData
  /**
   * An object containing parsed data from the PKG file entries.
   */
  entries: PKGItemEntriesData
  /**
   * An object containing parsed data from the PKG's SFO file.
   */
  sfo?: SFOData
  /**
   * The size of the PKG file.
   */
  fileSize: number
  /**
   * The header contents SHA256 hash of the STFS file.
   */
  contentsHash: string
}

// #region Functions

/**
 * Parses a PKG file header.
 * - - - -
 * @param {FilePathLikeTypes | Buffer} pkgFilePathOrBuffer A `Buffer` of the PKG file or a path to a PKG file.
 * @returns {PKGHeaderData}
 */
export const parsePKGHeader = async (pkgFilePathOrBuffer: FilePathLikeTypes | Buffer): Promise<PKGHeaderData> => {
  const reader = Buffer.isBuffer(pkgFilePathOrBuffer) ? BinaryReader.fromBuffer(pkgFilePathOrBuffer) : await BinaryReader.fromFile(pkgFilePathOrBuffer)

  // Header
  const magic = await reader.readHex(4)
  if (magic !== '0x7f504b47') throw new Error(reader.getOperatorType() === 'fileHandle' && reader.path !== null ? `Provided file "${pathLikeToString(reader.path)}" has invalid PS3 PKG file signature.` : 'Provided buffer has invalid PS3 PKG file buffer signature.')
  const revision = await reader.readUInt16LE()
  const pkgDebug = revision === 0
  const pkgType = await reader.readUInt16BE()
  const pkgPlatform = pkgType === 1 ? 'PS3' : pkgType === 2 ? 'PSP/PSVita' : 'Unknown'
  if (pkgPlatform !== 'PS3') {
    await reader.close()
    throw new Error(reader.getOperatorType() === 'fileHandle' && reader.path !== null ? `Provided file "${pathLikeToString(reader.path)}" is not a PS3 PKG file.` : 'Provided buffer  is not a PS3 PKG file buffer.')
  }
  const metadataOffset = await reader.readUInt32BE()
  const metadataCount = await reader.readUInt32BE()
  const headerSize = await reader.readUInt32BE()
  const itemCount = await reader.readUInt32BE()
  const totalSize = Number(await reader.readUInt64BE())
  const dataOffset = Number(await reader.readUInt64BE())
  const dataSize = Number(await reader.readUInt64BE())
  const contentID = await reader.readUTF8(0x30)
  const digest = await reader.readHex(0x10, false)
  const dataRIV = await reader.readHex(0x10, false)
  let metadataSize = 0

  // Metadata
  reader.seek(metadataOffset)
  const metadata: PKGMetadata[] = []

  for (let i = 0; i < metadataCount; i++) {
    const metadataMap = new MyObject<PKGMetadata>()
    const metadataEntryType = await reader.readUInt32BE()
    const metadataEntrySize = await reader.readInt32BE()
    const tempBytes = await reader.read(metadataEntrySize)

    // (1) DRM Type
    // (2) Content Type
    if (metadataEntryType === 1 || metadataEntryType === 2) {
      if (metadataEntryType === 1) metadataMap.set('typeDesc', 'DRM Type')
      else metadataMap.set('typeDesc', 'Content Type')
      metadataMap.setMany({
        value: tempBytes.readUInt32BE(),
        size: 4,
        hexSize: 2 + 4 * 2,
        binSize: 2 + 4 * 8,
      })

      if (metadataEntrySize > 4) metadataMap.set('unknownBytes', tempBytes.subarray(0x04))
    }

    // (5) MAKE_PACKAGE_NPDRM Revision + Package Version
    else if (metadataEntryType === 5) {
      metadataMap.set('typeDesc', 'MAKE_PACKAGE_NPDRM Revision + Package Version')
      const tempBytesReader = BinaryReader.fromBuffer(tempBytes)
      metadataMap.set('value', await tempBytesReader.read())
      let revision = ''
      let pkgVersion = ''
      revision += await tempBytesReader.readHex(1, false)
      revision += await tempBytesReader.readHex(1, false)
      pkgVersion += await tempBytesReader.readHex(1, false)
      pkgVersion += `.${await tempBytesReader.readHex(1, false)}`
      metadataMap.setMany({
        revision,
        version: pkgVersion,
      })
      await tempBytesReader.close()
    }

    // (6) TitleID (when size 0xc) (otherwise Version + App Version)
    else if (metadataEntryType === 6 && metadataEntrySize === 0x0c) {
      metadataMap.set('typeDesc', 'Title ID')
      const tempBytesReader = BinaryReader.fromBuffer(tempBytes)
      metadataMap.set('value', await tempBytesReader.readUTF8())
      await tempBytesReader.close()
    }

    // (10) Install Directory
    else if (metadataEntryType === 10) {
      metadataMap.set('typeDesc', 'Install Directory')
      const tempBytesReader = BinaryReader.fromBuffer(tempBytes)
      tempBytesReader.seek(8)
      metadataMap.set('value', await tempBytesReader.readUTF8())
      await tempBytesReader.close()
      metadataMap.set('unknownBytes', tempBytes.subarray(0, 8))
    } else {
      metadataMap.set('typeDesc', metadataEntryType === 3 ? 'Package Type/Flags' : metadataEntryType === 4 ? 'Package Size' : metadataEntryType === 6 ? 'Version + App Version' : metadataEntryType === 7 ? 'QA Digest' : metadataEntryType === 5 ? 'MAKE_PACKAGE_NPDRM Revision' : 'Unknown')
      const tempBytesReader = BinaryReader.fromBuffer(tempBytes)
      const value = await tempBytesReader.read()
      metadataMap.set('value', value)
      await tempBytesReader.close()

      if (metadataEntryType === 4) metadataMap.set('pkgSize', Number(value.readBigUint64BE()))
    }

    metadataSize = reader.offset - metadataOffset

    metadata.push(metadataMap.toJSON())
  }

  // Content keys
  const keyIndex = 0
  const paramSFO = 'PARAM.SFO'

  // const aesCtr = new PkgAesCtrCounter()
  const aesCtr: PkgAesCtrCounter[] = []

  for (const key of pkgContentKeys) {
    if ('derive' in key && key.derive) {
      const aes = createCipheriv('aes-128-ecb', key.key, null)
      aes.setAutoPadding(false)
      const pkgKey = Buffer.concat([aes.update(Buffer.from(dataRIV, 'hex')), aes.final()])
      aesCtr.push(new PkgAesCtrCounter(pkgKey, Buffer.from(dataRIV, 'hex')))
    } else {
      aesCtr.push(new PkgAesCtrCounter(key.key, Buffer.from(dataRIV, 'hex')))
    }
  }

  const debugXorIV = Buffer.alloc(0x40)
  const digestBuf = Buffer.from(digest, 'hex')
  digestBuf.subarray(0x00, 0x08).copy(debugXorIV, 0x00)
  digestBuf.subarray(0x00, 0x08).copy(debugXorIV, 0x08)
  digestBuf.subarray(0x08, 0x10).copy(debugXorIV, 0x10)
  digestBuf.subarray(0x08, 0x10).copy(debugXorIV, 0x18)
  const xorCtr = new PkgXorSha1Counter(debugXorIV)

  const map = new MyObject<PKGHeaderData>()
  map.setMany({
    magic,
    revision,
    pkgType,
    pkgPlatform,
    metadataOffset,
    metadataCount,
    headerSize,
    itemCount,
    totalSize,
    dataOffset,
    dataSize,
    contentID,
    cidTitle1: contentID.slice(7, 16),
    cidTitle2: contentID.slice(20),
    digest,
    dataRIV,
    metadataSize,
    keyIndex,
    pkgDebug,
    paramSFO,
    debugXorIV: debugXorIV.toString('hex'),
    metadata,
    xorCtr,
    aesCtr,
  })

  await reader.close()
  return map.toJSON()
}

/**
 * Parses the item entries of a PKG file.
 * - - - -
 * @param {FilePathLikeTypes | Buffer} pkgFilePathOrBuffer A `Buffer` of the PKG file or a path to a PKG file.
 * @returns {Promise<PKGItemEntriesData>}
 */
export const parsePKGItemEntries = async (pkgFilePathOrBuffer: FilePathLikeTypes | Buffer): Promise<PKGItemEntriesData> => {
  const header = await parsePKGHeader(pkgFilePathOrBuffer)
  const reader = Buffer.isBuffer(pkgFilePathOrBuffer) ? BinaryReader.fromBuffer(pkgFilePathOrBuffer) : await BinaryReader.fromFile(pkgFilePathOrBuffer)

  const itemEntrySize = 0x20
  const offset = 0
  let size = header.itemCount * itemEntrySize
  const entriesSize = header.itemCount * itemEntrySize
  let align = calculateAesAlignedOffsetAndSize(offset, size)

  if (align.offsetDelta > 0) throw new Error(`Unaligned encrypted offset ${offset} - ${align.offsetDelta} = ${align.offset} (+${header.dataOffset})`)

  reader.seek(header.dataOffset + align.offset)

  let encryptedData = await reader.read(align.size)
  let decryptedData: Buffer
  if (header.pkgDebug) {
    decryptedData = header.xorCtr.decrypt(align.offset, encryptedData)
  } else {
    decryptedData = header.aesCtr[header.keyIndex].decrypt(align.offset, encryptedData)
  }

  const itemEntries: PKGItemEntriesMap[] = []
  let offset2 = align.offsetDelta
  let namesOffset: number | null = null
  let nameOffsetEnd: number | null = null
  let itemNameSizeMax = 0

  for (let i = 0; i < header.itemCount; i++) {
    const entryMap = new MyObject<PKGItemEntriesMap>()
    const itemEntryReader = BinaryReader.fromBuffer(decryptedData.subarray(offset2, offset2 + itemEntrySize))
    const itemNameOffset = await itemEntryReader.readUInt32BE()
    const itemNameSize = await itemEntryReader.readUInt32BE()
    const itemDataOffset = Number((await itemEntryReader.readUInt64BE()).toString())
    const itemDataSize = Number((await itemEntryReader.readUInt64BE()).toString())
    const flags = await itemEntryReader.readUInt32BE()
    itemEntryReader.padding(0x04)
    const itemKeyIndex = (flags >> 28) & 0x7
    entryMap.setMany({
      itemIndex: i,
      itemKeyIndex,
      itemNameOffset,
      itemNameSize,
      itemDataOffset,
      itemDataSize,
      flags,
    })

    const itemAlign = calculateAesAlignedOffsetAndSize(itemDataOffset, itemDataSize)
    if (itemAlign.offsetDelta > 0) throw new Error(`PKG Item Entries Parsing Error: Unaligned encrypted offset ${HexStr.processHex(header.dataOffset)} - ${HexStr.processHex(itemAlign.offsetDelta)} = ${HexStr.processHex(itemAlign.offset)} (+${HexStr.processHex(header.dataOffset)}) for item #${i.toString()}.`)

    const itemFlags = flags & 0xff

    if (itemFlags == 0x04 || itemFlags === 0x12) {
      entryMap.setMany({
        isFile: false,
        isDir: true,
      })
    } else {
      entryMap.setMany({
        isFile: true,
        isDir: false,
      })
    }

    if (itemNameSize > 0) {
      if (namesOffset === null || itemNameOffset < namesOffset) namesOffset = itemNameOffset
      if (nameOffsetEnd === null || itemNameOffset >= nameOffsetEnd) nameOffsetEnd = itemNameOffset + itemNameSize
      if (itemNameSize > itemNameSizeMax) itemNameSizeMax = itemNameSize
    }

    offset2 += itemEntrySize

    await itemEntryReader.close()
    itemEntries.push(entryMap.toJSON())
  }

  if (nameOffsetEnd === null || namesOffset === null) throw new Error("PKG Item Entries Parsing Error: Name offset and its end can't remain null after iterating through PKG file entries.")

  const namesSize = nameOffsetEnd - namesOffset

  if (namesOffset < entriesSize) throw new Error(`PKG Item Entries Parsing Error: Item Names with offset ${HexStr.processHex(namesOffset)} are INTERLEAVED with the Item Entries of size ${HexStr.processHex(entriesSize)}.`)
  else if (namesOffset > entriesSize) throw new Error(`PKG Item Entries Parsing Error: Item Names with offset ${HexStr.processHex(namesOffset)} are not directly following the Item Entries with size ${HexStr.processHex(entriesSize)}.`)

  let readSize = namesOffset + namesSize
  if (readSize > size) {
    size = readSize
    align = calculateAesAlignedOffsetAndSize(offset, size)
    const readOffset = align.offset + encryptedData.length
    readSize = align.size - encryptedData.length
    reader.seek(header.dataOffset + readOffset)

    encryptedData = Buffer.concat([encryptedData, await reader.read(readSize)])
    decryptedData = Buffer.concat([decryptedData, encryptedData.subarray(decryptedData.length)])
  } else throw new Error('PKG Item Entries Parsing Error: Read size of names from file entries if smaller than the provided size of buffer.')

  let dlcFolderName = ''
  for (let i = 0; i < itemEntries.length; i++) {
    const entry = itemEntries[i]
    if (entry.itemNameSize <= 0) continue
    const keyIndex = entry.itemKeyIndex
    offset2 = offset + entry.itemNameOffset
    const itemAlign = calculateAesAlignedOffsetAndSize(offset2, entry.itemNameSize)
    // entry.itemAlign = itemAlign
    if (itemAlign.offsetDelta > 0) throw new Error(`PKG Item Entries Parsing Error: Unaligned encrypted offset ${HexStr.processHex(offset2)} - ${HexStr.processHex(itemAlign.offsetDelta)} = ${HexStr.processHex(itemAlign.offset)} (+${header.dataOffset.toString()}) for item #${i.toString()}.`)

    offset2 = itemAlign.offset - align.offset

    if (header.pkgDebug) {
      const decryptedName = header.xorCtr.decrypt(itemAlign.offset, encryptedData.subarray(offset2, offset2 + itemAlign.size))
      decryptedName.copy(decryptedData, offset2)
    } else {
      const decryptedName = header.aesCtr[keyIndex].decrypt(itemAlign.offset, encryptedData.subarray(offset2, offset2 + itemAlign.size))
      decryptedName.copy(decryptedData, offset2)
    }

    const nameBytes = decryptedData.subarray(offset2 + itemAlign.offsetDelta, offset2 + itemAlign.offsetDelta + entry.itemNameSize)
    entry.name = nameBytes.toString('utf8')

    const nameSplit = entry.name.split('/')
    if (nameSplit.length > 1 && nameSplit[0] === 'USRDIR') dlcFolderName = nameSplit[1]
  }

  const sha256 = createHashFromBuffer(decryptedData)
  const fileOffset = header.dataOffset + offset
  const fileOffsetEnd = fileOffset + size

  const map = new MyObject<PKGItemEntriesData>()
  map.setMany({
    offset,
    size,
    entriesSize,
    namesOffset,
    namesSize,
    sha256,
    fileOffset,
    fileOffsetEnd,
    dlcFolderName,
    items: itemEntries,
  })

  await reader.close()
  return map.toJSON()
}

/**
 * Process and decrypt the item entries of the PKG file and returns their Buffers in an array.
 * - - - -
 * @param {PKGHeaderData} pkgFileHeader An object with parsed information of the header from the PKG file.
 * @param {PKGItemEntriesData} pkgFileEntries An object with parsed information of the entries from the PKG file.
 * @param {FilePathLikeTypes | Buffer} pkgFilePathOrBuffer A `Buffer` of the PKG file or a path to a PKG file.
 * @param {string | RegExp} [pathPattern] `OPTIONAL` A pattern.
 * @returns {Promise<Buffer[]>}
 */
export const processPKGItemEntries = async (pkgFileHeader: PKGHeaderData, pkgFileEntries: PKGItemEntriesData, pkgFilePathOrBuffer: FilePathLikeTypes | Buffer, pathPattern?: string | RegExp): Promise<Buffer[]> => {
  const reader = Buffer.isBuffer(pkgFilePathOrBuffer) ? BinaryReader.fromBuffer(pkgFilePathOrBuffer) : await BinaryReader.fromFile(pkgFilePathOrBuffer)
  let itemDataUsable = 0

  const decryptedBytes: Buffer[] = []

  const pattern = pathPattern ? new RegExp(pathPattern) : null
  if (pkgFileEntries.items.length > 0) {
    for (const entry of pkgFileEntries.items) {
      if (pattern && !pattern.test(entry.name)) continue
      const size = entry.itemDataSize
      const align = calculateAesAlignedOffsetAndSize(entry.itemDataOffset, size)
      let dataOffset = align.offset
      let fileOffset = pkgFileHeader.dataOffset + dataOffset
      let restSize = align.size

      let encBytes: Buffer
      let decBytes: Buffer
      let blockDataOffset = align.offsetDelta
      let blockDataSizeDelta = 0
      let blockSize = 0
      while (restSize > 0) {
        if (itemDataUsable > 0) blockSize = itemDataUsable
        else blockSize = Math.min(restSize, (Math.floor(Math.random() * (100 - 50 + 1)) + 50) * 0x100000)

        // eslint-disable-next-line no-unused-vars
        if (restSize <= blockSize) blockDataSizeDelta = align.sizeDelta - align.offsetDelta
        // const blockDataSize = blockSize - blockDataOffset - blockDataSizeDelta

        reader.seek(fileOffset)
        encBytes = await reader.read(blockSize)

        if (pkgFileHeader.pkgDebug) decBytes = pkgFileHeader.xorCtr.decrypt(dataOffset, encBytes)
        else decBytes = pkgFileHeader.aesCtr[pkgFileHeader.keyIndex].decrypt(dataOffset, encBytes)

        restSize -= blockSize
        fileOffset += blockSize
        dataOffset += blockSize
        // eslint-disable-next-line no-unused-vars
        blockDataOffset = 0
        itemDataUsable = 0

        decryptedBytes.push(decBytes)
      }
    }
  }

  await reader.close()
  return decryptedBytes
}

/**
 * Parses a PKG file of file buffer.
 * - - - -
 * @param {FilePathLikeTypes | Buffer} pkgFilePathOrBuffer A `Buffer` of the PKG file or a path to a PKG file.
 * @returns {Promise<PKGData>}
 */
export const parsePKGFileOrBuffer = async (pkgFilePathOrBuffer: FilePathLikeTypes | Buffer): Promise<PKGData> => {
  const header = await parsePKGHeader(pkgFilePathOrBuffer)
  const entries = await parsePKGItemEntries(pkgFilePathOrBuffer)
  const sfoArray = await processPKGItemEntries(header, entries, pkgFilePathOrBuffer, /\.(sfo|SFO)$/)
  let sfo: SFOData | undefined
  if (sfoArray.length > 0) sfo = await parseSFOFileOrBuffer(sfoArray[0])
  const fileSize = Buffer.isBuffer(pkgFilePathOrBuffer) ? pkgFilePathOrBuffer.length : (await pathLikeToFilePath(pkgFilePathOrBuffer).stat()).size
  return {
    pkgFilePath: !Buffer.isBuffer(pkgFilePathOrBuffer) ? pathLikeToString(pkgFilePathOrBuffer) : null,
    header,
    entries,
    sfo,
    fileSize,
    contentsHash: entries.sha256,
  }
}
