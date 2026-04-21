import { BinaryReader, FilePath, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { createRSPackImage, cropImageToTempPNG, isJPEGRockshelfPackImage, parseRSDATBuffer, type RSPackImageCreatorOptions } from '../../lib.exports'
import { temporaryFile } from 'tempy'
import { getRockshelfModuleRootDir } from '../../core.exports'
import { TextureFile, PythonAPI } from '../rbtools'

export interface CropImageCoordinatesObject {
  /**
   * The starting point of the horizontal cut (in pixels).
   */
  x: number
  /**
   * The size of the horizontal cut (in pixels).
   */
  width: number
  /**
   * The starting point of the vertical cut (in pixels).
   */
  y: number
  /**
   * The size of the horizontal cut (in pixels).
   */
  height: number
  mode?: 'contain' | 'stretch'
}

export interface EditPackageDataOptions {
  packageName?: string
  imgPath?: string
  imgCropOptions?: CropImageCoordinatesObject
}

export const editRSPackImage = async (rsPackImagePath: FilePathLikeTypes, options: EditPackageDataOptions): Promise<FilePath> => {
  const { imgCropOptions, imgPath, packageName } = options
  const src = pathLikeToFilePath(rsPackImagePath)

  const results = await isJPEGRockshelfPackImage(src)
  if (!results) throw new Error(`Provided JPEG image file "${src.path}" is not a valid Rockshelf Pack Image file.`)

  const rsDataBuffer = await parseRSDATBuffer(results.buffer)
  const opts: RSPackImageCreatorOptions = { packageName: packageName || rsDataBuffer.packageName, source: rsDataBuffer.source, type: rsDataBuffer.type, encryptionStatus: rsDataBuffer.encryptionStatus }

  if (!imgPath) {
    const srcReader = await BinaryReader.fromFile(src)
    const srcBuffer = await srcReader.read(srcReader.length - results.footerSizeLength)
    await srcReader.close()

    await createRSPackImage(srcBuffer, src, opts)
  } else {
    let filePath: FilePath
    let isFilePathTemp: boolean = false
    if (imgPath.startsWith('rbicons://')) {
      const root = getRockshelfModuleRootDir()
      const code = imgPath.slice('rbicons://'.length)
      filePath = root.gotoFile(`bin/icons/${code}.webp`)
      if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)
    } else filePath = pathLikeToFilePath(imgPath)

    if (filePath.ext === '.png_xbox' || filePath.ext === '.png_ps3' || filePath.ext === '.png_wii') {
      const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
      const tex = new TextureFile(imgPath)
      await tex.convertToImage(tempPNG, 'png')
      filePath = tempPNG
      isFilePathTemp = true
    }

    if (imgCropOptions) {
      const tempPNG = await cropImageToTempPNG(filePath, imgCropOptions)
      if (isFilePathTemp && filePath.exists) await filePath.delete()
      filePath = tempPNG
      isFilePathTemp = true
    }

    const tempJPG = pathLikeToFilePath(temporaryFile({ extension: 'jpg' }))

    await PythonAPI.imageConverter(filePath, tempJPG, 'jpg', { height: 256, width: 256 })
    if (isFilePathTemp && filePath.exists) await filePath.delete()
    await createRSPackImage(tempJPG, src, opts)
    if (tempJPG.exists) await tempJPG.delete()
  }

  return src
}
