import { dialog } from 'electron'
import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import { isRPCS3ExePathValid } from '../lib/rbtools/lib.exports'

export const selectRPCS3Exe = useHandler(async (win, _): Promise<string | false> => {
  const rpcs3ExeFilterName = await getLocaleStringFromRenderer(win, 'rpcs3Exe')
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: rpcs3ExeFilterName, extensions: ['exe'] }] })
  if (selection.canceled) {
    sendMessageBox(win, {
      type: 'info',
      method: 'selectRPCS3Exe',
      code: 'actionCancelledByUser',
    })
    return false
  }

  try {
    const rpcs3Exe = isRPCS3ExePathValid(selection.filePaths[0])
    return rpcs3Exe.path
  } catch (err) {
    sendMessageBox(win, {
      type: 'error',
      method: 'selectRPCS3Exe',
      code: 'invalidExecutable',
      messageValues: { path: selection.filePaths[0] },
    })
    return false
  }
})
