import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { sendErrorMessage } from '../electron-lib/sendErrorMessage'

export const isDevHDD0PathValid = (win: BrowserWindow, __: IpcMainInvokeEvent, devHDD0Path: DirPathLikeTypes): boolean => {
  const devhdd0 = pathLikeToDirPath(devHDD0Path)
  const game = devhdd0.gotoDir('game')
  if (!game.exists) {
    sendErrorMessage(win, {
      type: 'error',
      module: 'rbtools',
      method: 'isDevHDD0PathValid',
      code: 'invalid_devhdd0_path',
      message: `Provided DevHDD0 folder path "${devhdd0.path}" is invalid`,
      messageValues: {
        devhdd0: devhdd0.path,
      },
    })
    return false
  }
  const home = devhdd0.gotoDir('home')
  if (!home.exists) {
    sendErrorMessage(win, {
      type: 'error',
      module: 'rbtools',
      method: 'isDevHDD0PathValid',
      code: 'invalid_devhdd0_path',
      message: `Provided DevHDD0 folder path "${devhdd0.path}" is invalid`,
      messageValues: {
        devhdd0: devhdd0.path,
      },
    })
    return false
  }

  return true
}
