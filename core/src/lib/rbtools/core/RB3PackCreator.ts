import { DirPath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'
import { PKGFile, STFSFile, type PKGFileJSONRepresentation, type STFSFileJSONRepresentation } from '../core.exports'
import { extractPackagesForExtractedSTFS, extractPackagesForRPCS3, extractPackagesForSTFSFile, type STFSExtractionOptions, type STFSPackageExtractionObject, type RPCS3ExtractionOptions, type RPCS3PackageExtractionObject, type STFSCreationOptions, type UnpackedFilePathsFromSongObject, type STFSCreationObject } from '../lib.exports'

export type SupportedRB3PackageFileType = STFSFile | PKGFile
export type SupportedRB3PackageFileNames = 'stfs' | 'pkg'
export type RB3PackageLikeType = SupportedRB3PackageFileType | FilePathLikeTypes

export interface PackageExtractionSongsObject {
  /**
   * The internal songname used by the song and all its files.
   */
  songname: string
  /**
   * The internal songname used by the song and all its files after the metadata update.
   */
  newSongname: string
  /**
   * An object with the path of all files from the extracted song.
   */
  files: UnpackedFilePathsFromSongObject
}

export interface STFSExtractionTempFolderObject {
  /**
   * The path where the STFS package were extracted.
   */
  path: DirPath
  /**
   * The type of the package extracted.
   */
  type: 'stfs'
  /**
   * An array with objects representing extracted songs from the package and its files.
   */
  songs: PackageExtractionSongsObject[]
  /**
   * An object with stats of the extracted STFS file.
   */
  stat: STFSFileJSONRepresentation
}

export interface PKGExtractionTempFolderObject {
  /**
   * The path where the PKG package were extracted.
   */
  path: DirPath
  /**
   * The type of the package extracted.
   */
  type: 'pkg'
  /**
   * An array with objects representing extracted songs from the package and its files.
   */
  songs: PackageExtractionSongsObject[]
  /**
   * An object with stats of the extracted PKG file.
   */
  stat: PKGFileJSONRepresentation
}

export interface SelectedSongForExtractionObject {
  /**
   * The type of value provided to select the song. It can be the song ID, internal songname, or songID.
   */
  type: 'id' | 'songname' | 'songID'
  /**
   * The value provided to select the song. It can be the song ID, internal songname, or songID.
   */
  value: string | number
}
export interface SelectedSongFromSongnameObject {
  /**
   * The type of value provided to select the song.
   */
  type: 'songname'
  /**
   * The value provided to select the song.
   */
  value: string
}

/**
 * A class that gathers Rock Band 3 package files from Xbox 360 and PS3 systems to different package formats and extraction types.
 */
export class RB3PackCreator {
  /**
   * An array with package files to be extracted.
   */
  packages: RB3PackageLikeType[]

  /**
   * A class that gathers Rock Band 3 package files from Xbox 360 and PS3 systems to different package formats and extraction types.
   * - - - -
   * @param {RB3PackageLikeType[] | undefined} packages An array with Xbox 360 and PS3 package files to be extracted.
   */
  constructor(packages?: RB3PackageLikeType[]) {
    this.packages = []
    if (packages) this.packages = packages
  }

  /**
   * Extracts all provided song packages and merged them to create a new package compatible with RPCS3.
   *
   * The `options` parameter is an object where you can tweak the extraction and package creation process, selecting the package folder name, and forcing encryption/decryption of all files for vanilla Rock Band 3 support.
   * - - - -
   * @param {DirPathLikeTypes} destFolderPath The destination folder you want to place the extracted package. You can use any folder, but placing a valid `dev_hdd0` folder, this function will install the new package on Rock Band 3's USRDIR folder on RPCS3.
   * @param {string} packageFolderName The name of the new package folder.
   * @param {RPCS3ExtractionOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the extraction and package creation process.
   * @returns {Promise<RPCS3PackageExtractionObject>}
   */
  async toRPCS3(destFolderPath: DirPathLikeTypes, packageFolderName: string, options?: RPCS3ExtractionOptions): Promise<RPCS3PackageExtractionObject> {
    return await extractPackagesForRPCS3(this.packages, destFolderPath, packageFolderName, options)
  }

  /**
   * Extracts all provided song packages and merged them to create a new package formatted as an extracted STFS package.
   *
   * The `options` parameter is an object where you can tweak the extraction and package creation process, like forcing encryption/decryption of all MOGG files.
   * - - - -
   * @param {DirPathLikeTypes} destFolderPath The destination folder you want to place the extracted package.
   * @param {STFSExtractionOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the extraction and package creation process.
   * @returns {Promise<STFSPackageExtractionObject>}
   */
  async toExtractedSTFS(destFolderPath: DirPathLikeTypes, options?: STFSExtractionOptions): Promise<STFSPackageExtractionObject> {
    return await extractPackagesForExtractedSTFS(this.packages, destFolderPath, options)
  }

  /**
   * Extracts all provided song packages and merged them to create a new STFS package file.
   *
   * The `options` parameter is an object where you can tweak the extraction and package creation process, like forcing encryption/decryption of all MOGG files, change the package name and description, as well as selecting images for both thumbnail and title thumbnail.
   *
   * _NOTE: This function requires Onyx CLI. You can download the CLI version of Onyx [here](https://github.com/mtolly/onyx)._
   * - - - -
   * @param {FilePathLikeTypes} destSTFSFile The destination STFS file you want to create.
   * @param {FilePathLikeTypes} onyxCLIEXEPath The path to the Onyx CLI executable.
   * @param {STFSCreationOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the extraction and package creation process.
   * @returns {Promise<STFSCreationObject>}
   */
  async toSTFSFile(destSTFSFile: FilePathLikeTypes, onyxCLIEXEPath: FilePathLikeTypes, options?: STFSCreationOptions): Promise<STFSCreationObject> {
    return await extractPackagesForSTFSFile(this.packages, destSTFSFile, onyxCLIEXEPath, options)
  }
}
