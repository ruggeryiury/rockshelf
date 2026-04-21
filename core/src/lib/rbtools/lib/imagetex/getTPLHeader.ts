import { pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { imageHeaders, texWiiStat, type ArtworkSizeTypes } from '../../lib.exports'

export type TPLFormatTypes = 'RGBA32' | 'NORMAL'
export interface TPLHeaderParserObject {
  /**
   * The encoding type of the DDS file.
   */
  type: TPLFormatTypes
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
 * Builds the right Texture Pallete Library (`.tpl`) header to put on the PNG_WII texture file.
 * - - - -
 * @param {FilePathLikeTypes} texWiiPath The path of the PNG_WII file.
 * @returns {Promise<TPLHeaderParserObject>} An object with the header data and values.
 */
export const getTPLHeader = async (texWiiPath: FilePathLikeTypes): Promise<TPLHeaderParserObject> => {
  const src = pathLikeToFilePath(texWiiPath)
  if (!src.exists) throw new Error('Provided file path does not exists.')
  if (src.ext === '.png_wii') {
    const { width, height, type } = await texWiiStat(src)
    const headerKey = `TPL${width.toString()}x${height.toString()}${type === 'NORMAL' ? '' : `_${type}`}`
    if (headerKey in imageHeaders)
      return {
        type: type as TPLFormatTypes,
        width: width as ArtworkSizeTypes,
        height: height as ArtworkSizeTypes,
        data: Buffer.from(imageHeaders[headerKey as keyof typeof imageHeaders]),
      }
    else throw new Error('Provided file path is not recognizable as a PNG_WII file.')
  }

  throw new Error('Provided file path is not recognizable as a PNG_WII file.')
}
