import { dialog } from 'electron'
import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'

export const selectPathToSaveRB3File = useHandler(async (win, _) => {
  const buttonLabel = await getLocaleStringFromRenderer(win, 'save')
  const rb3ExtName = await getLocaleStringFromRenderer(win, 'rb3File')
  const title = await getLocaleStringFromRenderer(win, 'exportPackage')
  const selection = await dialog.showSaveDialog({ buttonLabel, filters: [{ extensions: ['rb3'], name: rb3ExtName }], title, properties: ['showOverwriteConfirmation'], nameFieldLabel: 'r' })

  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'exportPackagePathSelectCancelledByUser' })
    return false
  }

  return selection.filePath
})
