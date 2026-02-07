import { DirPath, pathLikeToDirPath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'
import { PKGFile } from 'rbtools'
import { temporaryDirectory } from 'tempy'

export const extractPKGToTempFolder = async (pkgFilePath: FilePathLikeTypes, destFolder?: DirPathLikeTypes): Promise<DirPath | false> => {
  const pkg = new PKGFile(pkgFilePath)

  // If destination folder is not provided [destFolder]
  // use create temp folder under X:/Users/[USERNAME]/AppData/Local (On Windows).
  const folder = destFolder ? pathLikeToDirPath(destFolder) : pathLikeToDirPath(temporaryDirectory())

  try {
    return await pkg.extract(folder)
  } catch (err) {
    //
    await folder.deleteDir()
    return folder
  }
}
