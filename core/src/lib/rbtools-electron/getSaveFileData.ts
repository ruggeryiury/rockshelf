import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { pathLikeToDirPath } from 'node-lib'
import { RB3SaveData } from './rb3SaveFile'

export const getSaveFileData = async (_: BrowserWindow, __: IpcMainInvokeEvent, devhdd0Path: string) => {
  const devhdd0 = pathLikeToDirPath(devhdd0Path)

  const saveDataPath = devhdd0.gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
  if (!saveDataPath.exists) return false

  const data = await RB3SaveData.parseFromFile(saveDataPath)
  return data
}
