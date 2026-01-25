import { app, BrowserWindow } from 'electron'
import { initHandlers, setUserDataFolder } from './lib'
import { electronApp, optimizer } from '@electron-toolkit/utils'

export async function initRockshelfApp(createWindow: () => BrowserWindow): Promise<void> {
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

  createWindow()
  initHandlers()

  app.on('activate', function (event, hasVisibleWindows) {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}
