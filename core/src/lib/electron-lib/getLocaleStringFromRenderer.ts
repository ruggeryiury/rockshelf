import { ipcMain, type BrowserWindow } from 'electron'
import { randomByteFromRanges } from 'node-lib'

/**
 * Returns a localized string from renderer from the provided key. If the key is not registered on the renderer's locale file, the function will return the key itself.
 * - - - -
 * @param {BrowserWindow} win Target `BrowserWindow` that will receive the message.
 * @param {string} key The key of the locale value.
 */
export const getLocaleStringFromRenderer = (win: BrowserWindow, key: string): Promise<string> => {
  const uuid = randomByteFromRanges(16).toString('hex')
  return new Promise<string>((resolve, _) => {
    ipcMain.once(`@LocaleRequest/${uuid}`, (_, val: string) => resolve(val))
    win.webContents.send('@LocaleRequest', uuid, key)
  })
}
