import { temporaryFile } from 'tempy'
import { RockshelfProtocolAPI } from '../core.exports'
import { FilePath, pathLikeToFilePath, type FilePathJSONRepresentation } from 'node-lib'
import { ImageFile, PythonAPI, TextureFile, type ImageCropOptions } from '../lib/rbtools'
import { temps } from '../init'

export const imgCropAndSaveToTemp = async (srcFile: string, options?: ImageCropOptions): Promise<FilePathJSONRepresentation> => {
  let src: FilePath
  const tempFile = pathLikeToFilePath(temporaryFile({ extension: 'jpg' }))

  if (srcFile.startsWith('rbicons://')) {
    src = RockshelfProtocolAPI.rbiconsToPath(srcFile)
  } else if (srcFile.endsWith('.png_xbox') || srcFile.endsWith('.png_ps3') || srcFile.endsWith('.png_wii')) {
    const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
    const tex = new TextureFile(srcFile)
    await tex.convertToImage(tempPNG, 'png')
    src = tempPNG
    temps.addTempFile(tempPNG)
  } else src = pathLikeToFilePath(srcFile)

  const srcStat = await new ImageFile(src).stat()
  if (options?.cropX !== 0 || options?.cropY !== 0 || options?.cropWidth !== srcStat.width || options?.cropHeight !== srcStat.height) {
    const tempCrop = await PythonAPI.imageCrop(src, { destPath: temporaryFile(), cropX: options?.cropX || 0, cropY: options?.cropY || 0, cropWidth: options?.cropWidth || srcStat.width, cropHeight: options?.cropHeight || srcStat.height, outHeight: 256, outWidth: 256, imgFormat: 'png' })
    src = tempCrop.path
    temps.addTempFile(tempCrop.path)
  }
  await PythonAPI.imageConverter(src, tempFile, 'jpg', { height: 256, width: 256 })
  temps.addTempFile(tempFile)
  return tempFile.toJSON()
}
