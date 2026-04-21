import { DirPath, pathLikeToFilePath } from 'node-lib'
import { RBTools } from '../../core.exports'

export type DDSFormatTypes = 'DXT1' | 'DXT3' | 'DXT5' | 'NORMAL' | 'UNKNOWN'
export type MainArtworkSizeTypes = 128 | 256 | 512 | 1024 | 2048
export type SmallArtworkSizeTypes = 8 | 16 | 32 | 64
export type ArtworkSizeTypes = SmallArtworkSizeTypes | MainArtworkSizeTypes

export interface DDSHeaderParserObject {
  /**
   * The encoding type of the DDS file.
   */
  type: DDSFormatTypes
  /**
   * The width of the DDS file.
   */
  width: ArtworkSizeTypes
  /**
   * The height of the DDS file.
   */
  height: ArtworkSizeTypes
  /**
   * The header data as buffer.
   */
  data: Buffer
}

/**
 * Builds the DDS texture file header based on its dimensions and image format.
 * - - - -
 * @param {DDSFormatTypes} format The format of the image.
 * @param {number} width The width of the image.
 * @param {number} height The height of the image.
 * @returns {Buffer} A built DDS texture file header.
 */
export const buildDDSHeader = (format: DDSFormatTypes, width: number, height: number): Buffer => {
  const dds = [0x44, 0x44, 0x53, 0x20, 0x7c, 0x00, 0x00, 0x00, 0x07, 0x10, 0x0a, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x4e, 0x45, 0x4d, 0x4f, 0x00, 0x00, 0x00, 0x00, 0x20, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x44, 0x58, 0x54, 0x35, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]

  switch (format.toLowerCase()) {
    case 'dxt1':
      dds[87] = 0x31
      break
    case 'dxt3':
      dds[87] = 0x33
      break
    case 'normal':
      dds[84] = 0x41
      dds[85] = 0x54
      dds[86] = 0x49
      dds[87] = 0x32
      break
  }

  switch (height) {
    case 8:
      dds[12] = 0x08
      dds[13] = 0x00
      break
    case 16:
      dds[12] = 0x10
      dds[13] = 0x00
      break
    case 32:
      dds[12] = 0x20
      dds[13] = 0x00
      break
    case 64:
      dds[12] = 0x40
      dds[13] = 0x00
      break
    case 128:
      dds[12] = 0x80
      dds[13] = 0x00
      break
    case 256:
      dds[13] = 0x01
      break
    case 1024:
      dds[13] = 0x04
      break
    case 2048:
      dds[13] = 0x08
      break
  }

  switch (width) {
    case 8:
      dds[16] = 0x08
      dds[17] = 0x00
      break
    case 16:
      dds[16] = 0x10
      dds[17] = 0x00
      break
    case 32:
      dds[16] = 0x20
      dds[17] = 0x00
      break
    case 64:
      dds[16] = 0x40
      dds[17] = 0x00
      break
    case 128:
      dds[16] = 0x80
      dds[17] = 0x00
      break
    case 256:
      dds[17] = 0x01
      break
    case 1024:
      dds[17] = 0x04
      break
    case 2048:
      dds[17] = 0x08
      break
  }

  if (width === height) {
    switch (width) {
      case 8:
        // No mipmaps at this size
        dds[0x1c] = 0x00
        break
      case 16:
        dds[0x1c] = 0x05
        break
      case 32:
        dds[0x1c] = 0x06
        break
      case 64:
        dds[0x1c] = 0x07
        break
      case 128:
        dds[0x1c] = 0x08
        break
      case 256:
        dds[0x1c] = 0x09
        break
      case 1024:
        dds[0x1c] = 0x0b
        break
      case 2048:
        dds[0x1c] = 0x0c
        break
    }
  }
  return Buffer.from(dds)
}

/**
 * Builds the right NVIDIA Texture file (`.dds`) header to put on the texture file.
 * - - - -
 * @param {Buffer} fullDDSHeader First 16 bytes of the DDS file.
 * @param {Buffer} shortDDSHeader Bytes 5-16 of the DDS file.
 *
 * _Some games have a bunch of headers for the same files. Bytes 5-16 has only the dimensions and image format._
 * @returns {Promise<DDSHeaderParserObject>} An object with the header data and values.
 */
export const getDDSHeader = async (fullDDSHeader: Buffer, shortDDSHeader: Buffer): Promise<DDSHeaderParserObject> => {
  let header = buildDDSHeader('DXT1', 256, 256)
  const headerPaths = await RBTools.headersFolder.readDir()
  let ddsFormat: DDSFormatTypes = 'UNKNOWN'
  let ddsWidth: ArtworkSizeTypes = 512
  let ddsHeight: ArtworkSizeTypes = 512

  for (const headerPath of headerPaths) {
    if (headerPath instanceof DirPath) continue
    const headerFilePath = pathLikeToFilePath(headerPath)
    const headerName = headerFilePath.name
    const headerBytes = await headerFilePath.read()
    if (headerBytes.toString() === fullDDSHeader.toString() || headerBytes.toString() === shortDDSHeader.toString()) {
      ddsFormat = 'DXT5'
      if (headerName.includes('DXT1')) ddsFormat = 'DXT1'
      else if (headerName.includes('NORMAL')) ddsFormat = 'NORMAL'

      let index1 = headerName.indexOf('_') + 1
      let index2 = headerName.indexOf('x')
      const width = parseInt(headerName.substring(index1, index2))
      ddsWidth = width as ArtworkSizeTypes
      index1 = headerName.indexOf('_', index2)
      index2++
      const height = parseInt(headerName.substring(index2, index1))
      ddsHeight = height as ArtworkSizeTypes
      header = buildDDSHeader(ddsFormat as DDSFormatTypes, width, height)
    }
  }

  return {
    type: ddsFormat,
    width: ddsWidth,
    height: ddsHeight,
    data: header,
  }
}
