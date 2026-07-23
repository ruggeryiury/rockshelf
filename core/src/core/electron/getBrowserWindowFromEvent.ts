import { BrowserWindow, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

/**
 * Gets the `BrowserWindow` object instance from the IPC event of a triggered renderer process.
 * - - - -
 * @param {IpcMainEvent | IpcMainInvokeEvent} event The IPC event emitted from a renderer process.
 * @returns {BrowserWindow} The BrowserWindow that emitted the event.
 * @throws {Error} If the BrowserWindow cannot be resolved from the event emitter.
 */
export const getBrowserWindowFromEvent = (event: IpcMainEvent | IpcMainInvokeEvent): BrowserWindow => {
  const win = BrowserWindow.fromId(event.sender.id)
  if (win) return win
  else throw new Error('Error when getting browser window object from emmited event')
}
