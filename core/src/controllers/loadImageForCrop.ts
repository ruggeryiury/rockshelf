import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import { dialog } from 'electron'
import { MyObject, pathLikeToFilePath } from 'node-lib'
import { ImageFile, TextureFile } from '../lib/rbtools'

export interface LoadImageForCropReturnObject {
  path: string
  dataURL: string
}

/**
 * Opens a prompt to select an image/texture file and retrieve data from the selected image/texture file.
 */
export const loadImageForCrop = useHandler(async (win, _, defaultPath?: string): Promise<LoadImageForCropReturnObject | false> => {
  const selection = await dialog.showOpenDialog({ defaultPath, properties: ['openFile'], filters: [{ name: await getLocaleStringFromRenderer(win, 'supportedImageFiles'), extensions: ['jpg', 'jpeg', 'bmp', 'png', 'webp', 'png_xbox', 'png_ps3', 'png_wii'] }] })

  if (selection.canceled) {
    sendMessageBox(win, {
      type: 'info',
      method: 'LoadImageForCrop',
      code: 'actionCancelledByUser',
    })
    return false
  }

  sendMessageBox(win, {
    type: 'info',
    method: 'LoadImageForCrop',
    code: 'processing',
  })

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
