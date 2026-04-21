import { FilePath, pathLikeToFilePath, randomByteFromRanges } from 'node-lib'
import { getRockshelfTempDir, rbiconsToPath, useHandler } from '../core.exports'
import { cropImageToTempPNG, type CropImageCoordinatesObject } from '../lib.exports'
import { temporaryFile } from 'tempy'
import { PythonAPI, TextureFile } from '../lib/rbtools'

export interface CropImageAndSaveToTempOptions {
  /**
   * The path to the image to be cropped and processed.
   */
  imgPath: string
  /**
   * An object with coordinates to crop the image.
   */
  imgCropOptions?: CropImageCoordinatesObject
  /**
   * The name of the temp image file. If `undefined`, it will assign a random name.
   */
  name?: string
}
export const cropImageAndSaveToTemp = useHandler(async (_, __, options: CropImageAndSaveToTempOptions) => {
  const { imgPath, imgCropOptions, name } = options

  const tempJPG = getRockshelfTempDir().gotoFile(`${name ?? `${randomByteFromRanges(16).toString('hex')}`}.jpg`)
  let filePath: FilePath,
    isFilePathProtocol = false,
    isFilePathTemp = false

  if (imgPath.startsWith('rbicons://')) {
    filePath = rbiconsToPath(imgPath)
    isFilePathProtocol = true
  } else if (imgPath.endsWith('.png_xbox') || imgPath.endsWith('.png_ps3') || imgPath.endsWith('.png_wii')) {
    const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
    const tex = new TextureFile(imgPath)
    await tex.convertToImage(tempPNG, 'png')
    filePath = tempPNG
    isFilePathTemp = true
  } else filePath = pathLikeToFilePath(imgPath)

  if (imgCropOptions) {
    filePath = await cropImageToTempPNG(filePath, imgCropOptions)
    isFilePathTemp = true
    isFilePathProtocol = false
  }
  await PythonAPI.imageConverter(filePath, tempJPG, 'jpg', { height: 256, width: 256 })
  if (isFilePathTemp && filePath.exists) await filePath.delete()
  return tempJPG.toJSON()
})
