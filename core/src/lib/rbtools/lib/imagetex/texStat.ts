import { type FilePathLikeTypes, pathLikeToFilePath } from 'node-lib'
import { getDDSHeader, imageHeaders } from '../../lib.exports'

export interface TextureFileStatReturnObject {
  /**
   * An array with the texture file's width and height.
   */
  dimensions: [number, number]
  /**
   * The extension of the image file.
   */
  ext: string
  /**
   * A description to the texture file format.
   */
  extDesc: string
  /**
   * The height of the texture file.
   */
  height: number
  /**
   * The size of the texture file in bytes.
   */
  size: number
  /**
   * The type of the encoding method of the texture file.
   */
  type: string
  /**
   * The width of the texture file.
   */
  width: number
}

/**
 * Returns an object with statistics of a PNG_WII texture file.
 * - - - -
 * @param {FilePathLikeTypes} pngWiiFilePath The path of the PNG_WII file.
 * @returns {Promise<TextureFileStatReturnObject>} An object with statistics of a PNG_WII texture file
 */
export const texWiiStat = async (pngWiiFilePath: FilePathLikeTypes): Promise<TextureFileStatReturnObject> => {
  const srcPath = pathLikeToFilePath(pngWiiFilePath)
  const size = (await srcPath.stat()).size

  const srcBuffer = await srcPath.read()
  const srcHeader = srcBuffer.subarray(0, 32)

  let width = 0
  let height = 0
  let type = ''

  const allHeaders = (Object.keys(imageHeaders) as (keyof typeof imageHeaders)[]).filter((header) => header.startsWith('WII'))

  for (const header of allHeaders) {
    if (srcHeader.toString() === Buffer.from(imageHeaders[header]).toString()) {
      const [w, h] = header
        .slice(3)
        .split('_')[0]
        .split('x')
        .map((size) => Number(size))
      width = w
      height = h
      type = header.slice(3).split('_')[1] ?? 'NORMAL'
    }
  }

  if (width === 0 && height === 0 && !type) throw new Error('Provided file path is not recognizable as a PNG_WII file.')

  return {
    dimensions: [width, height],
    ext: '.png_wii',
    extDesc: `PNG_WII: TPL (Texture Pallete Library) file with Harmonix header`,
    height,
    size,
    type,
    width,
  }
}

/**
 * Returns an object with statistics of a PNG_XBOX/PNG_PS3 texture file.
 * - - - -
 * @param {FilePathLikeTypes} texFilePath The path of the PNG_XBOX/PNG_PS3 file.
 * @returns {Promise<TextureFileStatReturnObject>} An object with statistics of a PNG_XBOX/PNG_PS3 texture file
 */
export const texXboxPs3Stat = async (texFilePath: FilePathLikeTypes): Promise<TextureFileStatReturnObject> => {
  const srcPath = pathLikeToFilePath(texFilePath)

  const srcBuffer = await srcPath.read()
  const fullSrcHeader = Buffer.alloc(16)
  const shortSrcHeader = Buffer.alloc(11)

  srcBuffer.copy(fullSrcHeader, 0, 0, 16)
  srcBuffer.copy(shortSrcHeader, 0, 5, 11)

  const { type, height, width } = await getDDSHeader(fullSrcHeader, shortSrcHeader)
  const ext = srcPath.ext.slice(1).toUpperCase()

  return {
    dimensions: [width, height],
    ext: `.${ext.toLowerCase()}`,
    extDesc: `${ext}: DDS Image file ${ext === 'PNG_XBOX' ? '(byte-swapped) ' : ''}with Harmonix header`,
    height,
    size: srcBuffer.length,
    type,
    width,
  }
}
