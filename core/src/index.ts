import { app, BrowserWindow, protocol, net } from 'electron'
import { pathToFileURL } from 'node:url'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { checkDeps, createWindow, getRockshelfModuleRootDir, initMainProcessHandlers, setElectronUserDataFolder, type CreateWindowOptions } from './core.exports'
import { RBTools } from 'rbtools'

export async function initRockshelfMainProcess(options: CreateWindowOptions): Promise<void> {
  await setElectronUserDataFolder(app, 'Rockshelf')
  await checkDeps(app)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  await app.whenReady()

  protocol.handle('rbicons', (request) => {
    const root = getRockshelfModuleRootDir()
    const code = request.url.slice('rbicons://'.length)
    const name = code === 'songPackage' ? 'custom' : code
    let filePath = root.gotoFile(`bin/icons/${name}.webp`)
    if (!filePath.exists) {
      filePath = root.gotoFile(`bin/icons/${name}.jpg`)
      if (!filePath.exists) {
        filePath = root.gotoFile(`bin/icons/${name}.png`)
        if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)
      }
    }

    return net.fetch(pathToFileURL(filePath.path).toString())
  })

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

export * from './controllers.exports'
export * from './core.exports'
export * from './lib.exports'
