import { dialog } from 'electron'
import { sendMessageBox, useHandler } from '../core.exports'
import { isRPCS3Devhdd0PathValid } from '../lib/rbtools/lib.exports'

/**
 * Opens a prompt for the user to select a valid `dev_hdd0` folder.
 */
export const selectDevhdd0Dir = useHandler(async (win): Promise<string | false> => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    sendMessageBox(win, {
      type: 'info',
      method: 'selectDevhdd0Dir',
      code: 'actionCancelledByUser',
    })
    return false
  }

  try {
    const devhdd0 = isRPCS3Devhdd0PathValid(selection.filePaths[0])
    return devhdd0.path
  } catch (err) {
    sendMessageBox(win, {
      type: 'error',
      method: 'selectDevhdd0Dir',
      code: 'invalidFolder',
      messageValues: { path: selection.filePaths[0] },
    })
    return false
  }
})
