import { DirPath } from 'node-lib'

export const setUserDataFolder = async (app: Electron.App, folderName: string) => {
  const oldAppDataPath = DirPath.of(app.getPath('userData'))
  const newAppDataPath = oldAppDataPath.gotoDir(`../${folderName}`)
  app.setPath('userData', newAppDataPath.path)
  if (oldAppDataPath.exists) await oldAppDataPath.deleteDir()
  return newAppDataPath
}
