import { BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron'
import { getBrowserWindowByEvent } from '../../lib'

type HandlerCallbackFn = (win: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => any

/**
 * Creates a `ipcMain` handler for a channel, with automatic `BrowserWindow` instance getter.
 * - - - -
 * @param {string} channel The channel of the handler.
 * @param {HandlerCallbackFn} cb Callback function to execute when the channel handler is invoked.
 */
export function addHandler(channel: string, cb: HandlerCallbackFn) {
  ipcMain.handle(channel, (event, ...args) => cb(getBrowserWindowByEvent(event), event, ...args))
}
