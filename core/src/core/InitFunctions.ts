import { dialog, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { DirPath } from 'node-lib'
import { activateMessagePopUp } from '../lib'

export const selectDevHDD0FolderInit = async (win: BrowserWindow) => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    activateMessagePopUp(win, {
      type: 'warn',
      module: 'generic',
      method: 'selectDevHDD0FolderInit',
      code: 'actionCancelledByUser',
    })
    return false
  }
  const [dir] = selection.filePaths.map((d) => DirPath.of(d))
  return dir.path
}

export const selectRPCS3ExeFileInit = async (win: BrowserWindow, _: IpcMainInvokeEvent, rpcs3ExeLocale: string) => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ extensions: ['exe'], name: rpcs3ExeLocale }] })
  if (selection.canceled) {
    activateMessagePopUp(win, {
      type: 'warn',
      module: 'generic',
      method: 'selectRPCS3ExeFileInit',
      code: 'actionCancelledByUser',
    })
    return false
  }
  const [dir] = selection.filePaths.map((d) => DirPath.of(d))
  return dir.path
}
