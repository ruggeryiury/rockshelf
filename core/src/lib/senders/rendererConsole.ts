import type { BrowserWindow } from 'electron'

/**
 * Sends a small console log event to the renderer process.
 * - - - -
 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
 * @param {any[]} value Any value that you want to be logged into console.
 */
export const sendRendererConsole = (win: BrowserWindow, ...value: any[]): true => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  win.webContents.send('sendRendererConsole', ...value)
  return true
}
