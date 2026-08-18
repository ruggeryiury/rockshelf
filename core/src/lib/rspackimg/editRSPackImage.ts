import { BinaryReader, FilePath, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { createRSPackImage, isJPEGRockshelfPackImage, parseRSDATBuffer, type RSPackImageCreatorOptions, type RSPackImageEncryptionStatusValues, type RSPackImagePackageCategoryValues } from '../../lib.exports'
import { temporaryFile } from 'tempy'
import { RockshelfFileSystemAPI } from '../../core.exports'
import { TextureFile, PythonAPI } from '../rbtools'
import { imgCropAndSaveToTemp } from '../../handlers.exports'
import { temps } from '../../init'

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
  /**
   * Determines how the image is fitted into the target dimensions.
   *
   * - `contain`: Preserves the aspect ratio, ensuring the entire image fits within the target size.
   * - `stretch`: Scales the image independently in each dimension to exactly match the target size, which may distort the image.
   */
  mode?: 'contain' | 'stretch'
}

export interface EditPackageDataOptions {
  /**
   * The name of the song package.
   */
  packageName?: string
  /**
   * A path to an image that will replace the raw JPEG image data.
   */
  imgPath?: string
  /**
   * An object with values to handle the image cropping.
   */
  imgCropOptions?: CropImageCoordinatesObject
  /**
   * The encryption status of the song package.
   *
   * - `0` = Unknown (Might have both encrypted and decrypted files).
   * - `1` = Encrypted.
   * - `2` = Decrypted.
   * - `3` = Mixed (Rarely used).
   */
  encryptionStatus?: RSPackImageEncryptionStatusValues
  /**
   * The category of the song package. The catogies are pre-defined in Rockshelf.
   *
   * - `0` = "Other Packages"
   * - `1` = "Author Packages"
   * - `2` = "Artist/Band Packages"
   * - `3` = "Full Album Packages"
   * - `4` = "Singles"
   * - `5` = "Rock Band Packages"
   * - `6` = "Guitar Hero Packages"
   * - `7` = "Official Packages"
   * - `8` = "Unofficial Packages"
   * - `9` = "Themed Packages"
   * - `10` = "Seasonal Packages"
   * - `11` = "Debug"
   */
  category?: RSPackImagePackageCategoryValues
  /**
   * The song package creation date encoded as a ISO string.
   */
  creationDate?: string
}

/**
 * Edits a Rockshelf Pack Image file.
 * - - - -
 * @param {FilePathLikeTypes} rsPackImagePath The path to the Rockshelf Pack Image file to de edited.
 * @param {EditPackageDataOptions} options An object with values that tweaks the editing process.
 * @returns {Promise<FilePath>}
 */
export const editRSPackImage = async (rsPackImagePath: FilePathLikeTypes, options: EditPackageDataOptions): Promise<FilePath> => {
  const { imgCropOptions, imgPath, packageName, encryptionStatus, category, creationDate } = options
  const src = pathLikeToFilePath(rsPackImagePath)

  const results = await isJPEGRockshelfPackImage(src)
  if (!results) throw new Error(`Provided JPEG image file "${src.path}" is not a valid Rockshelf Pack Image file.`)

  const rsDataBuffer = await parseRSDATBuffer(results.buffer)
  const opts: RSPackImageCreatorOptions = { packageName: packageName || rsDataBuffer.packageName, source: rsDataBuffer.source, type: rsDataBuffer.type, encryptionStatus: encryptionStatus || rsDataBuffer.encryptionStatus, category: category || rsDataBuffer.category, creationDate: creationDate || rsDataBuffer.creationDate }

  if (!imgPath) {
    const srcReader = await BinaryReader.fromFile(src)
    const srcBuffer = await srcReader.read(srcReader.length - results.footerSizeLength)
    await srcReader.close()

    await createRSPackImage(srcBuffer, src, opts)
  } else {
    let filePath: FilePath
    if (imgPath.startsWith('rbicons://')) {
      const root = RockshelfFileSystemAPI.coreModuleRootDir()
      const code = imgPath.slice('rbicons://'.length)
      filePath = root.gotoFile(`bin/icons/${code}.webp`)
      if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)
    } else filePath = pathLikeToFilePath(imgPath)

    if (filePath.ext === '.png_xbox' || filePath.ext === '.png_ps3' || filePath.ext === '.png_wii') {
      const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
      const tex = new TextureFile(imgPath)
      await tex.convertToImage(tempPNG, 'png')
      filePath = tempPNG
      temps.addTempFile(filePath)
    }

    if (imgCropOptions) {
      const tempPNG = await imgCropAndSaveToTemp(filePath.path, { cropX: imgCropOptions.x, cropY: imgCropOptions.y, cropWidth: imgCropOptions.width, cropHeight: imgCropOptions.height })
      filePath = FilePath.of(tempPNG.path)
      temps.addTempFile(FilePath.of(tempPNG.path))
    }

    const tempJPG = pathLikeToFilePath(temporaryFile({ extension: 'jpg' }))

    await PythonAPI.imageConverter(filePath, tempJPG, 'jpg', { height: 256, width: 256 })
    await createRSPackImage(tempJPG, src, opts)
    temps.addTempFile(tempJPG)
  }

  return src
}
