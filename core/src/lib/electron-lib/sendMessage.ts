import type { BrowserWindow } from 'electron'

export interface RendererMessageObject {
  /**
   * The type of the message
   */
  type: 'error' | 'warn' | 'success' | 'info'
  /**
   * The module or subsystem that emitted the message.
   */
  module: 'generic' | 'electronLib' | 'rockshelf' | 'dom' | 'rpcs3'
  /**
   * The method or function name where the message originated.
   */
  method: string
  /**
   * A unique message or error code.
   */
  code: string
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
 * Sends a message event to a renderer process.
 * - - - -
 * @param {BrowserWindow} win Target `BrowserWindow` that will receive the message.
 * @param {MessagePopUpOptions} options Message configuration payload.
 * @returns {true} Always returns true after dispatching the message.
 */
export const sendMessage = (win: BrowserWindow, options: RendererMessageObject): true => {
  win.webContents.send('@Message', options)
  return true
}
