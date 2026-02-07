import { app, BrowserWindow } from 'electron'
import { createWindow, setUserDataFolder, type CreateWindowOptions } from './lib'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { InitHandlers } from './core'

export async function initRockshelfApp(options: CreateWindowOptions): Promise<void> {
  await setUserDataFolder(app, 'Rockshelf')

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  await app.whenReady()
  // await dependencyChecker()

  electronApp.setAppUserModelId('com.electron.rockshelf')

  app.on('browser-window-created', (event, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow(options)
  InitHandlers()

  app.on('activate', function (event, hasVisibleWindows) {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(options)
  })
}
