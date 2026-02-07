import { is } from '@electron-toolkit/utils'
import { BrowserWindow, shell } from 'electron'
import { pathLikeToDirPath, pathLikeToString, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'

export interface CreateWindowOptions {
  /**
   * The root folder of the loaded main process file.
   *
   * You can get it using both `__dirname` (CommonJS) or `import.meta.dirname` (ESModules).
   */
  mainScriptRootFolder: DirPathLikeTypes
  /**
   * The path to the icon asset used on Linux systems.
   */
  linuxIconPath: FilePathLikeTypes
}

/**
 * Initialize the Rockshelf window.
 * - - - -
 * @param {CreateWindowOptions} options An object with values that can only be accessed on the loaded main process.
 * @returns {BrowserWindow}
 */
export function createWindow(options: CreateWindowOptions): BrowserWindow {
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
