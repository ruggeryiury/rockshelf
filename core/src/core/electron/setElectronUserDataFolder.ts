import type { App } from 'electron'
import { DirPath } from 'node-lib'

/**
 * Changes Electron's `userData` directory to a custom folder and optionally removes the old one.
 * - - - -
 * @param {App} app The Electron App instance.
 * @param {string} folderName Name of the new user data folder.
 * @returns {Promise<DirPath>} The resolved directory path pointing to the new user data directory.
 */
export const setElectronUserDataFolder = async (app: App, folderName: string): Promise<DirPath> => {
  const oldAppDataPath = DirPath.of(app.getPath('userData'))
  const newAppDataPath = oldAppDataPath.gotoDir(`../${folderName}`)
  app.setPath('userData', newAppDataPath.path)
  if (oldAppDataPath.exists) await oldAppDataPath.deleteDir()
  return newAppDataPath
}
