import type { BrowserWindow } from 'electron'

export interface BuzyLoadScreenSenderObject {
  code: 'incrementStep' | 'callSuccess'
}

export interface BuzyLoadErrorObject {
  code: 'throwError'
  errorIndex?: number
  errorName: string
  messageValues?: Record<string, string>
  error: {
    message: string
    stack: string | undefined
    name: string
    cause: unknown
  }
}

export type BuzyLoadOnCompleteActions = 'refreshRB3Stats' | 'resetDeluxeInstallScreenState'

export interface BuzyLoadInitObject {
  code: 'init'
  title: string
  steps: string[]
  onCompleted?: BuzyLoadOnCompleteActions[]
}

export const sendBuzyLoad = (win: BrowserWindow, func: BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject): true => {
  win.webContents.send('sendBuzyLoad', func)
  return true
}
