import { dialog, type BrowserWindow } from 'electron'
import { getUserConfigFilePath } from '../core'
import { DirPath } from 'node-lib'
import { sendErrorMessage } from '../lib'

/**
 * Checks if the user config JSON file exists on the user data folder.
 * - - - -
 * @param {BrowserWindow} win The window object of the invoker.
 * @returns {boolean}
 */
export const checkUserConfig = (win: BrowserWindow): boolean => {
  const configPath = getUserConfigFilePath()
  return configPath.exists
}

export const selectDevHDD0FolderInit = async (win: BrowserWindow) => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    sendErrorMessage(win, {
      type: 'warn',
      module: 'generic',
      method: 'selectDevHDD0FolderInit',
      code: 'action_cancelled_by_user',
      message: 'DevHDD0 folder path selection cancelled by the user',
    })
    return false
  }
  const [dir] = selection.filePaths.map((d) => DirPath.of(d))
  return dir.path
}
