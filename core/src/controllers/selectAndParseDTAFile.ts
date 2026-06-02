import { dialog } from 'electron'
import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import { DTAParser, type DTAParserJSONRepresentation } from '../lib/rbtools'

export const selectAndParseDTAFile = useHandler(async (win): Promise<false | DTAParserJSONRepresentation> => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: await getLocaleStringFromRenderer(win, 'dtaFile'), extensions: ['dta'] }] })

  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectAndParseDTAFileCancelledByUser' })
    return false
  }

  const [dtaFile] = selection.filePaths
  try {
    const dta = await DTAParser.fromFile(dtaFile)
    dta.sort('Song Title')

    return dta.toJSON()
  } catch (err) {
    sendMessageBox(win, { type: 'error', code: 'selectAndParseDTAFileParsingError' })
    return false
  }
})
