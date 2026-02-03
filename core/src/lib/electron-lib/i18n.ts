import {ipcMain, type BrowserWindow} from 'electron'
import { randomBytesFromRanges } from 'node-lib/lib'

/**
 * Returns a localized string from renderer from the provided key. If the key is not registered on the renderer's locale file, the function will return the key itself.
 * - - - -
 * @param {BrowserWindow} win Target `BrowserWindow` that will receive the message.
 * @param {string} key The key of the locale value.
 */
export const getLocaleKeyValueFromRenderer = (win: BrowserWindow, key: string): Promise<string> => {
    const uuid = randomBytesFromRanges(16)
    return new Promise<string>((resolve, reject) => {
        ipcMain.once(`@LocaleRequest/${uuid}`, (_, val: string) => resolve(val))

        win.webContents.send('@LocaleRequest', uuid, key)
    })
}