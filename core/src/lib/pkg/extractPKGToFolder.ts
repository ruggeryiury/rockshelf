import { DirPath, pathLikeToDirPath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'
import { PKGFile } from 'rbtools'
import { temporaryDirectory } from 'tempy'

export const extractPKGToFolder = async (pkgFilePath: FilePathLikeTypes, destFolder?: DirPathLikeTypes): Promise<DirPath> => {
  const pkg = new PKGFile(pkgFilePath)
  const folder = destFolder ? pathLikeToDirPath(destFolder) : pathLikeToDirPath(temporaryDirectory())
  if (folder.exists) {
    await folder.deleteDir()
    await folder.mkDir()
  }
  try {
    return await pkg.extract(folder)
  } catch (err) {
    await folder.deleteDir()
    return folder
  }
}
