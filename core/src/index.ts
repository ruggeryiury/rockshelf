import { app, BrowserWindow, protocol, net, ipcMain } from 'electron'
import { pathToFileURL } from 'node:url'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createPythonEnvOnUserDataDir, createWindow, SongDownloadQueueAPI, initRichPresence, RockshelfFileSystemAPI, setElectronUserDataFolder, UserConfigAPI, type CreateWindowOptions } from './core.exports'
import { initMainProcessHandlers } from './initMainProcessHandlers'

export async function initRockshelfMainProcess(options: CreateWindowOptions): Promise<void> {
  await setElectronUserDataFolder(app, 'Rockshelf')
  await RockshelfFileSystemAPI.deleteDeprecatedEntries()
  await RockshelfFileSystemAPI.checkAndCreateAppEntries()
  await createPythonEnvOnUserDataDir()

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  await app.whenReady()

  protocol.handle('rbicons', async (request) => {
    const root = RockshelfFileSystemAPI.coreModuleRootDir()
    const code = request.url.slice('rbicons://'.length)
    const name = code === 'songPackage' ? 'custom' : code
    let filePath = root.gotoFile(`bin/icons/${name}.webp`)
    if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)

    const fileBuffer = await filePath.read()

    return new Response(fileBuffer, { headers: { 'Content-Type': 'image/webp' } })
  })

  protocol.handle('rb1packimg', async (request) => {
    const userConfig = await UserConfigAPI.readFile()
    if (!userConfig) throw new Error('User config file not found, aborting...')
    const rb1usrdir = RockshelfFileSystemAPI.rb1UsrDir(userConfig.devhdd0Path)
    const packageFolderName = decodeURIComponent(request.url.slice('rb1packimg://'.length))
    const filePath = rb1usrdir.gotoFile(`${packageFolderName}/folder.jpg`)

    if (!filePath.exists) return new Response(null)

    const fileBuffer = await filePath.read()

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    })
  })

  protocol.handle('rb3packimg', async (request) => {
    const userConfig = await UserConfigAPI.readFile()
    if (!userConfig) throw new Error('User config file not found, aborting...')
    const rb3usrdir = RockshelfFileSystemAPI.rb3UsrDir(userConfig.devhdd0Path)
    const packageFolderName = decodeURIComponent(request.url.slice('rb3packimg://'.length))
    const filePath = rb3usrdir.gotoFile(`${packageFolderName}/folder.jpg`)

    const fileBuffer = await filePath.read()

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    })
  })

  protocol.handle('artworks', async (request) => {
    const root = RockshelfFileSystemAPI.coreModuleRootDir()
    const songShortname = request.url.slice('artworks://'.length)
    const artwork = root.gotoFile(`bin/artworks/${songShortname}_keep.png`)

    if (!artwork.exists) return new Response(null)

    return net.fetch(pathToFileURL(artwork.path).toString(), { headers: { 'Content-Type': 'image/png' } })
  })

  protocol.handle('tempjpg', async (request) => {
    const root = RockshelfFileSystemAPI.appTempDir()
    const name = request.url.slice('tempjpg://'.length)
    const artwork = root.gotoFile(`${name}.jpg`)

    if (!artwork.exists) return new Response(null)

    const fileBuffer = await artwork.read()

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    })
  })

  electronApp.setAppUserModelId('com.electron.rockshelf')

  app.on('browser-window-created', (event, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  void initRichPresence()
  void SongDownloadQueueAPI.initRhythmverseDownloader()
  void initMainProcessHandlers()
  void createWindow(options)

  app.on('activate', function (event, hasVisibleWindows) {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(options)
  })
}

export * from './controllers.exports'
export * from './core.exports'
export * from './lib.exports'
