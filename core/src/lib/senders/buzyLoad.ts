import type { BrowserWindow } from 'electron'

export interface BuzyLoadScreenSenderObject {
  code: 'incrementStep' | 'callSuccess'
}

export interface BuzyLoadErrorObject {
  code: 'throwError'
  key?: string
  messageValues?: Record<string, string>
}

export type BuzyLoadOnCompleteActions = 'refreshRB3Stats' | 'resetCreateNewPackageScreenState' | 'resetExportPackageModalState' | 'resetInstallRB3FileScreenState'

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

/**
 * Sends a message that controls the `BuzyLoadScreen` component on the renderer.
 * - - - -
 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
 * @param {BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject | BuzyLoadSubtextObject} func An object with properties for specific commands on the `BuzyLoadScreen` component.
 * @returns {true}
 */
export const sendBuzyLoad = (win: BrowserWindow, func: BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject | BuzyLoadSubtextObject): true => {
  win.webContents.send('sendBuzyLoad', func)
  return true
}
