import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { getBrowserWindowByEvent } from '../../lib'

type HandlerListenerFn = (win: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => any

/**
 * Registers an IPC handler and automatically resolves the BrowserWindow
 * associated with the event.
 *
 * This is a small utility wrapper around `ipcMain.handle`.
 * - - - -
 * @param {string} channel The IPC channel name.
 * @param {HandlerListenerFn} listener The handler function to execute when the channel is invoked.
 * @returns {void}
 */
export const addHandler = (channel: string, listener: HandlerListenerFn) => {
  ipcMain.handle(channel, (event, ...args) => listener(getBrowserWindowByEvent(event), event, ...args))
}
