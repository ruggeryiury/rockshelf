import { app } from 'electron'
import { DirPath } from 'node-lib'

/**
 * Modifies the user data folder used on an Electron app.
 * - - - -
 * @param folderName The new folder name.
 * @returns {DirPath}
 */
export const setAppDataFolder = async (folderName: string): Promise<DirPath> => {
  const oldAppDataPath = DirPath.of(app.getPath('userData'))
  const newAppDataPath = oldAppDataPath.gotoDir(`../${folderName}`)
  app.setPath('userData', newAppDataPath.path)
  if (oldAppDataPath.exists) await oldAppDataPath.deleteDir()
  return newAppDataPath
}
