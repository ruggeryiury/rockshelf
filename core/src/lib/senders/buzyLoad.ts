import type { BrowserWindow } from 'electron'

export interface BuzyLoadScreenSenderObject {
  code: 'incrementStep' | 'callSuccess'
}

export interface BuzyLoadErrorObject {
  code: 'throwError'
  key?: string
  messageValues?: Record<string, string>
}

export type BuzyLoadOnCompleteActions = 'refreshRB3Stats' | 'resetDeluxeInstallScreenState' | 'resetCreateNewPackageScreenState'

export interface BuzyLoadInitObject {
  code: 'init'
  title: string
  steps: string[]
  onCompleted?: BuzyLoadOnCompleteActions[]
}

export interface BuzyLoadSubtextObject {
  code: 'subtext'
  key: string
  messageValues?: Record<string, string>
}

export const sendBuzyLoad = (win: BrowserWindow, func: BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject | BuzyLoadSubtextObject): true => {
  win.webContents.send('sendBuzyLoad', func)
  return true
}
