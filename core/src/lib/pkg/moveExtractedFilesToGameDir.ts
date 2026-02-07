import { type DirPathLikeTypes, pathLikeToDirPath, DirPath } from 'node-lib'
import type { SelectPKGFileReturnObject } from '../../lib'

export const moveExtractedFilesToGameDir = async (selectedPKG: SelectPKGFileReturnObject, extractedPKGFolder: DirPathLikeTypes, gameFolder: DirPathLikeTypes): Promise<true> => {
  const extracted = pathLikeToDirPath(extractedPKGFolder)
  const game = pathLikeToDirPath(gameFolder)
  if (!game.exists) await game.mkDir(true)

  const allPaths = await extracted.readDir(true)
  for (const path of allPaths) {
    const isNotPatchPackage = selectedPKG.pkgType !== 'tu5' && selectedPKG.pkgType !== 'dx'
    const relPath = path.path.slice(extracted.path.length + 1)
    if (isNotPatchPackage && ['icon0.png', 'param.sfo', 'ps3logo.dat'].includes(relPath.toLowerCase())) continue

    if (path instanceof DirPath) {
      const newDir = game.gotoDir(relPath)
      if (!newDir.exists) await newDir.mkDir(true)
    } else {
      const newFile = game.gotoFile(relPath)
      await path.move(newFile, true)
    }
  }

  return true
}
