import { dialog } from 'electron'
import { sendMessageBox, useHandler } from '../core.exports'
import { DirPath } from 'node-lib'

export const selectDir = useHandler(async (win) => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectDirCancelledByUser' })
    return false
  }

  return DirPath.of(selection.filePaths[0]).path
})
