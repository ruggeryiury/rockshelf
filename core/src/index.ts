import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { checkDeps, createWindow, initMainProcessHandlers, setElectronUserDataFolder, type CreateWindowOptions } from './core.exports'

export async function initRockshelfMainProcess(options: CreateWindowOptions): Promise<void> {
  await setElectronUserDataFolder(app, 'Rockshelf')
  await checkDeps(app)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  await app.whenReady()

  electronApp.setAppUserModelId('com.electron.rockshelf')

  app.on('browser-window-created', (event, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow(options)
  initMainProcessHandlers()

  app.on('activate', function (event, hasVisibleWindows) {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(options)
  })
}

export * from './core.exports'
