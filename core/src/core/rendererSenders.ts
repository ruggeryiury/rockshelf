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
 * Sends a small message event to a renderer process.
 * - - - -
 * @param {BrowserWindow} win Target `BrowserWindow` that will receive the message.
 * @param {MessagePopUpOptions} options Message configuration payload.
 * @returns {true} Always returns true after dispatching the message.
 */
export const sendMessageBox = (win: BrowserWindow, options: MessageBoxObject): true => {
  win.webContents.send('sendMessageBox', options)
  return true
}

export const sendDialog = (win: BrowserWindow, code: string): true => {
  win.webContents.send('sendDialog', code)
  return true
}

export interface BuzyLoadObject {
  code: 'incrementStep' | 'throwError' | 'callSuccess'
}

export type BuzyLoadOnCompleteActions = 'refreshRB3Stats'

export interface BuzyLoadInitObject {
  code: 'init'
  title: string
  steps: string[]
  onCompleted?: BuzyLoadOnCompleteActions[]
}

export const sendBuzyLoad = (win: BrowserWindow, func: BuzyLoadObject | BuzyLoadInitObject): true => {
  win.webContents.send('sendBuzyLoad', func)
  return true
}
