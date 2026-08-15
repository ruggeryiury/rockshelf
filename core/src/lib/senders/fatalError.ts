import type { BrowserWindow } from 'electron'

export interface FatalErrorObject {
  name: string
  message: string
  stack: string | undefined
}

/**
 * Sends a message that controls the `FatalErrorScreen` component on the renderer.
 * - - - -
 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
 * @param {Error} err The error object to be displayed on the renderer.
 */
export const sendFatalError = (win: BrowserWindow, err: Error): true => {
  const errObject = {
    name: err.name,
    message: err.message,
    stack: err.stack,
  }
  win.webContents.send('sendFatalError', errObject)
  return true
}
