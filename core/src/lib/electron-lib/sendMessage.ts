import type { BrowserWindow } from 'electron'

export interface MessagePopUpOptions {
  /**
   * The type of the message
   */
  type: 'error' | 'warn' | 'success' | 'loading'
  /**
   * The module or subsystem that emitted the message.
   */
  module: 'generic' | 'electronLib' | 'rockshelf' | 'dom'
  /**
   * The method or function name where the message originated.
   */
  method: string
  /**
   * A unique message or error code.
   */
  code: string
  /**
   * Optional dynamic values used for interpolation or localization.
   */
  messageValues?: Record<string, string | number | boolean>
}

/**
 * Sends a message event to a renderer process.
 * - - - -
 * @param {BrowserWindow} window Target `BrowserWindow` that will receive the message.
 * @param {MessagePopUpOptions} options Message configuration payload.
 * @returns {true} Always returns true after dispatching the message.
 */
export const sendMessage = (window: BrowserWindow, options: MessagePopUpOptions): true => {
  window.webContents.send('@Message', options)
  return true
}
