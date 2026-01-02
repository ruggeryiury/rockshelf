import { app } from 'electron'
import { DirPath } from 'node-lib'

export async function setAppDataFolder(folderName: string): Promise<DirPath> {
  const oldAppDataPath = DirPath.of(app.getPath('userData'))
  const newAppDataPath = oldAppDataPath.gotoDir(`../${folderName}`)
  app.setPath('userData', newAppDataPath.path)
  if (oldAppDataPath.exists) await oldAppDataPath.deleteDir()
  return newAppDataPath
}
