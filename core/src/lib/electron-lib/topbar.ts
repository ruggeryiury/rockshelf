import { shell, type BrowserWindow } from 'electron'
import { execAsync } from 'node-lib'
import { FS } from '../../core'

export const winMinimize = (win: BrowserWindow): void => win.minimize()
export const winMaximize = (win: BrowserWindow): boolean => {
  if (win.isMaximized()) {
    win.restore()
    return false
  }
  win.maximize()
  return true
}
export const winClose = (win: BrowserWindow): void => win.close()

export const openUserDataFolder = async () => {
  const userDataFolderPath = FS.userDataFolder()
  await shell.openPath(userDataFolderPath.path)
}
