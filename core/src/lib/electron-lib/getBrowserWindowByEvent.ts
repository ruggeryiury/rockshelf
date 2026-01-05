import { type IpcMainEvent, type IpcMainInvokeEvent, BrowserWindow } from 'electron'

/**
 * Gets the `BrowserWindow` instance of a channel emitter.
 * - - - -
 * @param {IpcMainEvent | IpcMainInvokeEvent} event The event object of the channel
 * @returns {BrowserWindow}
 */
export const getBrowserWindowByEvent = (event: IpcMainEvent | IpcMainInvokeEvent): BrowserWindow => {
  const win = BrowserWindow.fromId(event.sender.id)
  if (win) return win
  else throw new Error('Error when getting browser window object from emmited event')
}
