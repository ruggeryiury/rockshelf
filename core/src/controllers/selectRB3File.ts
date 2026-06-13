import { dialog } from 'electron'
import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import { RB3File } from '../lib.exports'
import { isRB3FolderNameFreeOnRPCS3 } from '../lib/rbtools/lib.exports'

export const selectRB3File = useHandler(async (win) => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: await getLocaleStringFromRenderer(win, 'rb3File'), extensions: ['rb3'] }] })

  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectRB3FileCancelledByUser' })
    return false
  }

  const [rb3File] = selection.filePaths
  const rb3 = new RB3File(rb3File)

  try {
    await rb3.checkFileIntegrity()
  } catch (err) {
    sendMessageBox(win, { type: 'error', code: 'selectRB3FileInvalidFileSignature', messageValues: { path: rb3.path.path } })
    return false
  }

  return await rb3.toJSON()
})
