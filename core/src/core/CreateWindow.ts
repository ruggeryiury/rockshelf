import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { pathLikeToDirPath, pathLikeToString, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'

export interface CreateWindowOptions {
  mainScriptRootFolder: DirPathLikeTypes
  linuxIconPath: FilePathLikeTypes
}

export function CreateWindow(options: CreateWindowOptions): BrowserWindow {
  const { linuxIconPath, mainScriptRootFolder } = options
  const icon = pathLikeToString(linuxIconPath)
  const main = pathLikeToDirPath(mainScriptRootFolder)

  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 900,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: main.gotoFile('../preload/index.mjs').path,
      sandbox: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    if (is.dev) mainWindow.webContents.openDevTools({ mode: 'detach' })
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(main.gotoFile('../renderer/index.html').path)
  }

  return mainWindow
}
