import type { App } from 'electron'
import { DirPath } from 'node-lib'

/**
 * Changes Electron's `userData` directory to a custom folder and optionally removes the old one.
 * - - - -
 * @param {App} app The Electron App instance.
 * @param {string} folderName Name of the new user data folder.
 * @returns {Promise<void>}
 */
export const setElectronUserDataFolder = async (app: App, folderName: string): Promise<void> => {
  const oldAppDataPath = DirPath.of(app.getPath('userData'))
  const newAppDataPath = oldAppDataPath.gotoDir(`../${folderName}`)
  app.setPath('userData', newAppDataPath.path)
  if (oldAppDataPath.exists) await oldAppDataPath.deleteDir()

  const rockshelfDocumentFolder = DirPath.of(app.getPath('documents')).gotoDir('Rockshelf')
  app.setPath('documents', rockshelfDocumentFolder.path)
  if (!rockshelfDocumentFolder.exists) await rockshelfDocumentFolder.mkDir()
  return
}
