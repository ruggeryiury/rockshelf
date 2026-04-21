import { type DirPathLikeTypes, type FilePath, pathLikeToDirPath } from 'node-lib'
import type { SupportedRB3PackageFileNames } from '../../core.exports'

export interface UnpackedFilePathsFromSongObject {
  /**
   * The path to the song's extrated MOGG file.
   */
  mogg: FilePath
  /**
   * The path to the song's extrated MIDI file.
   */
  mid: FilePath
  /**
   * The path to the song's extrated texture file.
   */
  png: FilePath
  /**
   * The path to the song's extrated MILO file.
   */
  milo: FilePath
}

/**
 * Generates `FilePath` instances for all files from a song extracted from a package file. The contents of the package must be extracted on root.
 * - - - -
 * @param {SupportedRB3PackageFileNames} type The type of the package extracted. PS3 PKG files have different extensions for MIDI and Texture files.
 * @param {DirPathLikeTypes} rootFolderPath The path to the folder where the package file where extracted.
 * @param {string} songname The internal songname of the song you want to generates path from.
 * @returns {UnpackedFilePathsFromSongObject}
 */
export const getUnpackedFilesPathFromRootExtraction = (type: SupportedRB3PackageFileNames, rootFolderPath: DirPathLikeTypes, songname: string): UnpackedFilePathsFromSongObject => {
  const root = pathLikeToDirPath(rootFolderPath)
  const isSTFS = type === 'stfs'

  return {
    mid: isSTFS ? root.gotoFile(`${songname}.mid`) : root.gotoFile(`${songname}.mid.edat`),
    mogg: root.gotoFile(`${songname}.mogg`),
    png: root.gotoFile(`${songname}_keep.png_${isSTFS ? 'xbox' : 'ps3'}`),
    milo: root.gotoFile(`${songname}.milo_${isSTFS ? 'xbox' : 'ps3'}`),
  }
}
