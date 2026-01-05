import type { BrowserWindow } from 'electron'

export type MainErrorMessageModules = 'utils' | 'rbtools' | 'generic' | 'core'

export interface MainErrorMessageObject {
  type: 'error' | 'warn'
  module: MainErrorMessageModules
  method: string
  code: string
  message: string
  messageValues?: Record<string, string | number | boolean>
}

export const sendErrorMessage = (win: BrowserWindow, options: MainErrorMessageObject) => {
  win.webContents.send('@Error/message', options)
}
