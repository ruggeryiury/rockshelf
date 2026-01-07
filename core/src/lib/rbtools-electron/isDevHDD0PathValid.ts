import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { activateMessagePopUp } from '../electron-lib/activateMessagePopUp'

export const isDevHDD0PathValid = (win: BrowserWindow, __: IpcMainInvokeEvent, devhdd0Path: DirPathLikeTypes): boolean => {
  let proof = true
  const devhdd0 = pathLikeToDirPath(devhdd0Path)

  const game = devhdd0.gotoDir('game')
  if (!game.exists) proof = false

  const home = devhdd0.gotoDir('home')
  if (!home.exists) proof = false

  if (!proof)
    return activateMessagePopUp(win, {
      type: 'error',
      module: 'rbtools',
      method: 'isDevHDD0PathValid',
      code: 'invalidPath',
      messageValues: {
        devhdd0Path: devhdd0.path,
      },
    })

  return proof
}
