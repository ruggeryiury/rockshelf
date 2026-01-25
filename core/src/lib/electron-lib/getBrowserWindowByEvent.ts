import { BrowserWindow, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

/**
 * Resolves the BrowserWindow instance associated with an IPC event.
 * - - - -
 * @param {IpcMainEvent | IpcMainInvokeEvent} event The IPC event emitted from a renderer process.
 * @returns {BrowserWindow} The BrowserWindow that emitted the event.
 * @throws {Error} Throws if the BrowserWindow cannot be resolved from the event sender.
 */
export const getBrowserWindowByEvent = (event: IpcMainEvent | IpcMainInvokeEvent): BrowserWindow => {
  const win = BrowserWindow.fromId(event.sender.id)
  if (win) return win
  else throw new Error('Error when getting browser window object from emmited event')
}
