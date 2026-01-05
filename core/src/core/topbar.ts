import type { BrowserWindow } from 'electron'

export const winMinimize = (win: BrowserWindow): void => win.minimize()
export const winMaximize = (win: BrowserWindow): boolean => {
  if (win.isMaximized()) {
    win.restore()
    return false
  }
  win.maximize()
  return true
}
export const winClose = (win: BrowserWindow): void => win.close()
