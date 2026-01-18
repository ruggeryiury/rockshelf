import { dialog, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { DirPath, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { activateMessagePopUp } from '../lib'
import { RPCS3, type InstrumentScoreData } from 'rbtools'

export const selectDevHDD0FolderInit = async (win: BrowserWindow) => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    activateMessagePopUp(win, {
      type: 'warn',
      module: 'generic',
      method: 'selectDevHDD0FolderInit',
      code: 'actionCancelledByUser',
    })
    return false
  }
  const [dir] = selection.filePaths.map((d) => DirPath.of(d))
  return dir.path
}

export const selectRPCS3ExeFileInit = async (win: BrowserWindow, _: IpcMainInvokeEvent, rpcs3ExeLocale: string) => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ extensions: ['exe'], name: rpcs3ExeLocale }] })
  if (selection.canceled) {
    activateMessagePopUp(win, {
      type: 'warn',
      module: 'generic',
      method: 'selectRPCS3ExeFileInit',
      code: 'actionCancelledByUser',
    })
    return false
  }
  const [dir] = selection.filePaths.map((d) => DirPath.of(d))
  return dir.path
}

export const fetchRPCS3Data = async (win: BrowserWindow, _: IpcMainInvokeEvent, devhdd0FolderPath: string, rpcs3ExeFilePath: string) => {
  const rpcs3 = new RPCS3(devhdd0FolderPath, rpcs3ExeFilePath)
  const stats = await rpcs3.getStats()
  const packages = await rpcs3.getPackagesStats()
  const saveData = await rpcs3.getSaveData()
  let scores: InstrumentScoreData | undefined
  if (saveData) {
    const mostPlayedInstrument = saveData.mostPlayedInstrument
    scores = rpcs3.getInstrumentScoresData(saveData, mostPlayedInstrument ?? 'band')
  }

  return {
    stats,
    packages,
    saveData,
    scores,
  }
}
