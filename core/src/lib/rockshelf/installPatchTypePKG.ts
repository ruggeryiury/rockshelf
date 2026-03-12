import { BinaryAPI } from 'rbtools'
import type { SelectPKGFileReturnObject } from '../../controllers.exports'
import { temporaryDirectory } from 'tempy'
import { DirPath, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'

export const installPatchTypePKG = async (rb3GameFolderPath: DirPathLikeTypes, selectedPKG: SelectPKGFileReturnObject): Promise<boolean> => {
  const rb3GameFolder = pathLikeToDirPath(rb3GameFolderPath)
  const tempFolderPath = await BinaryAPI.ps3pPKGRipper(selectedPKG.pkgPath, temporaryDirectory())

  for (const entry of await tempFolderPath.readDir(true)) {
    const relPath = entry.path.slice(tempFolderPath.path.length + 1)
    if (entry instanceof DirPath) {
      const newDirPath = rb3GameFolder.gotoDir(relPath)
      if (!newDirPath.exists) await newDirPath.mkDir(true)
      continue
    }

    const newFilePath = rb3GameFolder.gotoFile(relPath)
    await entry.move(newFilePath, true)
  }

  await tempFolderPath.deleteDir(true)
  return true
}
