import type { BrowserWindow } from 'electron'

export type MainMessageModules = 'utils' | 'rbtools' | 'generic' | 'core'

export interface MessagePopUpOptions {
  type: 'error' | 'warn' | 'success'
  module: MainMessageModules
  method: string
  code: string
  messageValues?: Record<string, string | number | boolean>
}

export const activateMessagePopUp = (win: BrowserWindow, options: MessagePopUpOptions): false => {
  win.webContents.send('@PopUp/message', options)
  return false
}
