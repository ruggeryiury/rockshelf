import { dialog, shell } from 'electron'
import { getLocaleStringFromRenderer, RockshelfFileSystemAPI, sendMessageBox, useHandler } from '../core.exports'
import { userData } from '../init'
import { pathLikeToDirPath, pathLikeToFilePath, type DirPath } from 'node-lib'
import { ImageFile, TextureFile } from '../lib/rbtools'

export const openExternalURL = useHandler(async (_, __, url: string): Promise<void> => {
  return await shell.openExternal(url)
})

export type RockshelfFileSystemAPItemCommand = 'coreModuleRootDir' | 'appUserDataDir' | 'appDownloadableContentDir' | 'rb1UsrDir' | 'rb2UsrDir' | 'rb3UsrDir'

export const openRockshelfFSDir = useHandler(async (_, __, command: RockshelfFileSystemAPItemCommand): Promise<boolean> => {
  if (!userData.userConfig) throw new Error('User config data is not loaded.')
  let path: DirPath

  switch (command) {
    case 'coreModuleRootDir': {
      path = RockshelfFileSystemAPI.coreModuleRootDir()
      break
    }
    case 'appUserDataDir':
    default: {
      path = RockshelfFileSystemAPI.appUserDataDir()
      break
    }
    case 'appDownloadableContentDir': {
      path = RockshelfFileSystemAPI.appDownloadableContentDir()
      break
    }
    case 'rb1UsrDir':
    case 'rb2UsrDir':
    case 'rb3UsrDir': {
      const devhdd0 = pathLikeToDirPath(userData.userConfig.devhdd0Path)
      path = command === 'rb1UsrDir' ? RockshelfFileSystemAPI.rb1UsrDir(devhdd0) : command === 'rb2UsrDir' ? RockshelfFileSystemAPI.rb2UsrDir(devhdd0) : RockshelfFileSystemAPI.rb3UsrDir(devhdd0)
      break
    }
  }

  await shell.openPath(path.path)
  return true
})

export const openDir = useHandler(async (_, __, dirPath: string): Promise<void> => {
  await shell.openPath(dirPath)
})

export interface LoadImageForCropReturnObject {
  path: string
  dataURL: string
}

export const openImageToCrop = useHandler(async (win, __, defaultPath?: string): Promise<LoadImageForCropReturnObject | false> => {
  const selection = await dialog.showOpenDialog({ defaultPath, properties: ['openFile'], filters: [{ name: await getLocaleStringFromRenderer(win, 'supportedImageFiles'), extensions: ['jpg', 'jpeg', 'bmp', 'png', 'webp', 'png_xbox', 'png_ps3', 'png_wii'] }] })

  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'loadImageForCropCancelledByUser' })
    return false
  }

  sendMessageBox(win, { type: 'info', code: 'loadImageForCropProcessing' })

  const [imgFile] = selection.filePaths

  const img = pathLikeToFilePath(imgFile)

  if (!img.exists) return false

  if (img.ext === '.png_xbox' || img.ext === '.png_ps3' || img.ext === '.png_wii') {
    const dataURL = await new TextureFile(img).toDataURL()
    return {
      path: img.path,
      dataURL,
    }
  }

  const dataURL = await new ImageFile(img).toDataURL()
  return {
    path: img.path,
    dataURL,
  }
})

export const openConsoleWindow = useHandler((win): void => {
  win.webContents.openDevTools({ mode: 'detach' })
})
