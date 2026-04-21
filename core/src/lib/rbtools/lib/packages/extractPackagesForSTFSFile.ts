import { DirPath, pathLikeToDirPath, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { ImageFile, OnyxCLI, PythonAPI, RBTools, STFSFile, TextureFile, type RB3PackageLikeType, type SelectedSongForExtractionObject } from '../../core.exports'
import { useDefaultOptions } from 'use-default-options'
import { temporaryDirectory, temporaryFile } from 'tempy'
import { extractPackagesForExtractedSTFS, type STFSPackageExtractionObject, type DTAFileUpdateObject, type DTAFileBatchUpdateObject } from '../../lib.exports'
import { stringify as stringifyYAML } from 'yaml'
import type { LiteralUnion } from 'type-fest'

export interface STFSCreationOptions {
  /**
   * Force encryption/decryption of the MOGG files. Default is `"disabled"`.
   */
  forceEncryption?: 'enabled' | 'disabled'
  /**
   * An array with the internal songnames of the songs you want to extract from the packages. If left empty, all songs from the packages will be extracted and installed.
   *
   * If the value is a string, it will be considered as the internal songname of the song. If the value is an object, you can select the song by its internal songname, its entry ID, or its song ID. Example: `{ type: 'id', value: 'songentryid' }` or `{ type: 'songID', value: 5678 }`
   */
  songs?: (string | SelectedSongForExtractionObject)[]
  /**
   * An array with objects which will updates a specific parsed song object based on its provided entry ID.
   */
  updates?: DTAFileUpdateObject[]
  /**
   * An object which will update all parsed song objects.
   */
  updateAllSongs?: DTAFileBatchUpdateObject | null
  /**
   * `"magma"`: Default MAGMA package name `{artist} - {name}` (Only works with single song package, with multiple song packages it will put the first song's artist and song title).
   */
  packageName?: LiteralUnion<'magma', string>
  /**
   * `"magma"`: Default MAGMA package description.
   *
   * `"rbtools"`: Created with RBTools. For more information, visit github.com/ruggeryiury/rbtools.
   *
   * `"rockshelf"`: Created with Rockshelf, a Rock Band 3 Package Manager. For more information, visit github.com/ruggeryiury/rockshelf.
   */
  packageDescription?: LiteralUnion<'magma' | 'rbtools' | 'rockshelf', string>
  /**
   * Thumbnail for the package. It can be a path to an image, an `ImageFile` instance, or a preset string:
   *
   * `"rb3"`: Default RB3 package thumbnail.
   *
   * `"rockshelf"`: Rockshelf package thumbnail.
   *
   * `"magma"`: Extract album art from the first song in the package and use it as thumbnail.
   */
  thumbnail?: LiteralUnion<'rb3' | 'rockshelf' | 'magma', string> | Omit<FilePathLikeTypes, string> | ImageFile
  /**
   * Title thumbnail for the package. It can be a path to an image, an `ImageFile` instance, or a preset string:
   *
   * `"rb3"`: Default RB3 package thumbnail.
   *
   * `"rockshelf"`: Rockshelf package thumbnail.
   */
  titleThumbnail?: LiteralUnion<'rb3' | 'rockshelf', string> | Omit<FilePathLikeTypes, string> | ImageFile
}

export interface STFSCreationObject {
  /**
   * A `STFSFile` instance of the created STFS package.
   */
  stfs: STFSFile
  /**
   * The path to temporary folder created to ultimately gather all package files to move to the actual package folder inside the `dev_hdd0` folder.
   */
  mainTempFolder: DirPath
  /**
   * An object with all the extracted files and stats of the songs extracted from the original packages, before being repacked into the final STFS package.
   */
  extraction: STFSPackageExtractionObject
}

/**
 * Extracts all provided song packages and merged them to create a new STFS package file.
 *
 * The `options` parameter is an object where you can tweak the extraction and package creation process, like forcing encryption/decryption of all MOGG files, change the package name and description, as well as selecting images for both thumbnail and title thumbnail.
 *
 * _NOTE: This function requires Onyx CLI. You can download the CLI version of Onyx [here](https://github.com/mtolly/onyx)._
 * - - - -
 * @param {RB3PackageLikeType[]} packages An array with paths to STFS or PKG files to be installed. You can select individual song or multiple songs package.
 * @param {FilePathLikeTypes} destSTFSFile The destination STFS file you want to create.
 * @param {FilePathLikeTypes} onyxCLIEXEPath The path to the Onyx CLI executable.
 * @param {STFSCreationOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the extraction and package creation process.
 * @returns {Promise<STFSCreationObject>}
 */
export const extractPackagesForSTFSFile = async (packages: RB3PackageLikeType[], destSTFSFile: FilePathLikeTypes, onyxCLIEXEPath: FilePathLikeTypes, options?: STFSCreationOptions): Promise<STFSCreationObject> => {
  const { forceEncryption, songs, packageName, packageDescription, thumbnail, titleThumbnail, updateAllSongs, updates } = useDefaultOptions<STFSCreationOptions>(
    {
      forceEncryption: 'disabled',
      songs: [],
      packageName: 'magma',
      packageDescription: 'rbtools',
      updates: [],
      updateAllSongs: null,
      thumbnail: 'magma',
      titleThumbnail: 'rb3',
    },
    options
  )

  const onyx = new OnyxCLI(onyxCLIEXEPath)
  onyx.checkIntegrity()

  const tempExtractionFolder = pathLikeToDirPath(temporaryDirectory())
  let stfsExtraction: STFSPackageExtractionObject
  try {
    stfsExtraction = await extractPackagesForExtractedSTFS(packages, tempExtractionFolder, {
      forceEncryption,
      songs,
      updateAllSongs,
      updates,
    })
  } catch (err) {
    await tempExtractionFolder.deleteDir(true)
    throw err
  }

  const firstSong = stfsExtraction.songs[0]
  console.log(tempExtractionFolder)

  const onyxRepackFolder = tempExtractionFolder.gotoDir('onyx-repack')
  await onyxRepackFolder.mkDir(true)

  const repackYAMLPath = onyxRepackFolder.gotoFile('repack-stfs.yaml')
  const repackYAMLContents = OnyxCLI.repackSTFSRB3Object
  if (packageName === 'magma') {
    repackYAMLContents['package-name'][0] = `${firstSong.artist} - ${firstSong.name}`
  } else repackYAMLContents['package-name'][0] = packageName

  if (packageDescription === 'magma') repackYAMLContents['package-description'][0] = 'Created with Magma: C3 Roks Edition. For more great customs authoring tools, visit forums.customscreators.com'
  else if (packageDescription === 'rbtools') repackYAMLContents['package-description'][0] = 'Created with RBTools. For more information, visit github.com/ruggeryiury/rbtools'
  else if (packageDescription === 'rockshelf') repackYAMLContents['package-description'][0] = 'Created with Rockshelf, a Rock Band 3 Package Manager. For more information, visit github.com/ruggeryiury/rockshelf'
  else repackYAMLContents['package-description'][0] = packageDescription

  await repackYAMLPath.write(stringifyYAML(repackYAMLContents))

  const thumbnailPath = onyxRepackFolder.gotoFile('thumbnail.png')
  const titleThumbnailPath = onyxRepackFolder.gotoFile('title-thumbnail.png')

  if (typeof thumbnail === 'string') {
    if (thumbnail === 'rb3') await RBTools.resFolder.gotoFile('rb3_thumbnail.png').copy(thumbnailPath)
    else if (thumbnail === 'rockshelf') await RBTools.resFolder.gotoFile('rockshelf_thumbnail.png').copy(thumbnailPath)
    else if (thumbnail === 'magma') {
      // Extract album art from the first song in the package and use it as thumbnail
      const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
      const tempPNG2 = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
      const tex = new TextureFile(tempExtractionFolder.gotoFile(`songs/${firstSong.songname}/gen/${firstSong.songname}_keep.png_xbox`))
      await tex.convertToImage(tempPNG, 'png')
      await PythonAPI.imageConverter(tempPNG, tempPNG2, 'png', { width: 64, height: 64 })
      await tempPNG2.move(thumbnailPath, true)
      await tempPNG.delete()
    } else {
      // Normal image path.
      const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
      await PythonAPI.imageConverter(thumbnail, tempPNG, 'png', { width: 64, height: 64 })
      await tempPNG.move(thumbnailPath, true)
    }
  } else if (thumbnail instanceof ImageFile) {
    const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
    await PythonAPI.imageConverter(thumbnail.path, tempPNG, 'png', { width: 64, height: 64 })
    await tempPNG.move(thumbnailPath, true)
  } else {
    const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
    const thumbPath = pathLikeToFilePath(thumbnail as FilePathLikeTypes)
    await PythonAPI.imageConverter(thumbPath, tempPNG, 'png', { width: 64, height: 64 })
    await tempPNG.move(thumbnailPath, true)
  }

  if (typeof titleThumbnail === 'string') {
    if (titleThumbnail === 'rb3') await RBTools.resFolder.gotoFile('rb3_thumbnail.png').copy(titleThumbnailPath)
    else if (titleThumbnail === 'rockshelf') await RBTools.resFolder.gotoFile('rockshelf_thumbnail.png').copy(titleThumbnailPath)
    else {
      // Normal image path.
      const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
      await PythonAPI.imageConverter(titleThumbnail, tempPNG, 'png', { width: 64, height: 64 })
      await tempPNG.move(titleThumbnailPath, true)
    }
  } else if (titleThumbnail instanceof ImageFile) {
    const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
    await PythonAPI.imageConverter(titleThumbnail.path, tempPNG, 'png', { width: 64, height: 64 })
    await tempPNG.move(titleThumbnailPath, true)
  } else {
    const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
    const thumbPath = pathLikeToFilePath(titleThumbnail as FilePathLikeTypes)
    await PythonAPI.imageConverter(thumbPath, tempPNG, 'png', { width: 64, height: 64 })
    await tempPNG.move(titleThumbnailPath, true)
  }

  let stfs: STFSFile
  try {
    await onyx.stfs(tempExtractionFolder, destSTFSFile)
    stfs = new STFSFile(destSTFSFile)
  } catch (err) {
    await tempExtractionFolder.deleteDir(true)
    throw err
  }

  await tempExtractionFolder.deleteDir(true)
  return {
    stfs,
    mainTempFolder: tempExtractionFolder,
    extraction: stfsExtraction,
  }
}
