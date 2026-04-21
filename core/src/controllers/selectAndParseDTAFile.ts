import { dialog } from 'electron'
import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import { DTAParser } from '../lib/rbtools'

export const selectAndParseDTAFile = useHandler(async (win, _) => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: await getLocaleStringFromRenderer(win, 'dtaFile'), extensions: ['dta'] }] })

  if (selection.canceled) {
    sendMessageBox(win, {
      type: 'info',
      method: 'selectAndParseDTAFile',
      code: 'actionCancelledByUser',
    })
    return false
  }

  const [dtaFile] = selection.filePaths
  try {
    const dta = await DTAParser.fromFile(dtaFile)
    dta.sort('Song Title')

    return dta.toJSON()
  } catch (err) {
    sendMessageBox(win, { type: 'error', method: 'selectAndParseDTAFile', code: 'parsingError' })
    return false
  }
})
