import type { BrowserWindow } from 'electron'

export interface MessageBoxObject {
  /**
   * The type of the message.
   *
   * The `"loading"` type won't create timeout event to unrender it.
   *
   * The `"debug"` type also won't create a timeout event, but it will use the "code" property as an unlocalized text (to use it as a message).
   */
  type: 'error' | 'info' | 'success' | 'warn' | 'loading' | 'debug'
  /**
   * A unique message or error code.
   */
  code: string
  /**
   * The name of the function/controller where the error originated from.
   */
  method: string
  /**
   * The amount of time (in milliseconds) that the message will disappear. Default is `4000` (4secs).
   */
  timeout?: number
  /**
   * Optional dynamic values used for interpolation or localization.
   */
  messageValues?: Record<string, string | number | boolean>
}

/**
 * Sends a small message box event to the renderer process.
 * - - - -
 * @param {BrowserWindow} win Target `BrowserWindow` that will receive the message.
 * @param {MessagePopUpOptions} message Message configuration payload.
 * @returns {true} Always returns true after dispatching the message.
 */
export const sendMessageBox = (win: BrowserWindow, message: MessageBoxObject): true => {
  win.webContents.send('sendMessageBox', message)
  return true
}
