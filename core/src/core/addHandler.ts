import { BrowserWindow, ipcMain, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

/**
 * Gets the `BrowserWindow` instance of a channel emitter.
 * - - - -
 * @param {IpcMainEvent | IpcMainInvokeEvent} event The event object of the channel
 * @returns {BrowserWindow}
 */
export const getBrowserWindowFromEvent = (event: IpcMainEvent | IpcMainInvokeEvent): BrowserWindow => {
  const win = BrowserWindow.fromId(event.sender.id)
  if (win) return win
  else throw new Error('Error when getting window from event.')
}

type HandlerCallbackFn = (win: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => any

/**
 * Creates a `ipcMain` handler for a channel, with automatic `BrowserWindow` instance getter.
 * - - - -
 * @param {string} channel The channel of the handler.
 * @param {HandlerCallbackFn} cb Callback function to execute when the channel handler is invoked.
 */
export function addHandler(channel: string, cb: HandlerCallbackFn) {
  ipcMain.handle(channel, (event, ...args) => cb(getBrowserWindowFromEvent(event), event, ...args))
}
