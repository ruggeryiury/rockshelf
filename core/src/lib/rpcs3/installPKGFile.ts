import { DirPath, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { useHandler } from '../electron-lib/useHandler'
import { FileSystem } from '../../core'
import { extractPKGToFolder, sendMessage, type SelectPKGFileReturnObject } from '../../lib'
import { temporaryDirectory } from 'tempy'

export const installPKGFile = useHandler(async (win, _, selectedPKG: SelectPKGFileReturnObject, devhdd0Folder: DirPathLikeTypes): Promise<DirPath | false> => {
  const devhdd0 = pathLikeToDirPath(devhdd0Folder)
  const usrdir = FileSystem.dirs.rb3UsrDir(devhdd0)
  const installationRootDir = usrdir.gotoDir('../')

  // Only TU5 and DX will extract and just move all files
  if (selectedPKG.pkgType === 'tu5' || selectedPKG.pkgType === 'dx') {
    const destFolder = pathLikeToDirPath(temporaryDirectory())

    sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'extractingPKGFile' })

    const extractedPathDir = await extractPKGToFolder(selectedPKG.pkgPath, destFolder)
    if (!extractedPathDir.exists) {
      sendMessage(win, { type: 'error', method: 'installPKGFile', module: 'rpcs3', code: 'extractionError' })
      return false
    }
    sendMessage(win, { type: 'loading', method: 'installPKGFile', module: 'rpcs3', code: 'movingPKGContents' })

    // TODO: Method to move each file individually, overwriting existing automatically
    await destFolder.deleteDir(true)
    // await extractedPathDir.moveDir(installationRootDir)

    sendMessage(win, { type: 'success', method: 'installPKGFile', module: 'rpcs3', code: selectedPKG.pkgType === 'tu5' ? 'TU5' : 'RB3DX' })
  }

  return usrdir
})
