import { shell, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { deletePackage, deletePackageThumbnails, deleteUserConfigAndRestart, editPackageData, getDTAFilteringFromPackage, getSongArtworkDataURL, installHighMemoryPatch, installPKGFile, playRockBand3, refreshPackagesData, rpcs3GetInstrumentScores, rpcs3GetPackagesData, rpcs3GetRB3Stats, rpcs3GetSaveDataStats, selectAndParseDTAFile, selectDevhdd0Dir, loadImageForCrop, selectPackageFiles, selectPKGFile, selectRPCS3Exe, testUserConfig, cropImageAndSaveToTemp, createNewPackage, testBuzyLoad, getScoresFromGoCentral, extractMultitrackOrSongAudioFromSong } from './controllers.exports'
import { openUserDataFolder, readUserConfigFile, saveUserConfigFile, windowClose, windowMaximize, windowMinimize, type UserConfigObject } from './core.exports'
import { addHandler } from './core/handler'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>
export type InitHandlersArray = [string, HandlerFnType][]

export const initMainProcessHandlers = (): void => {
  const handlers: InitHandlersArray = [
    ['createNewPackage', createNewPackage],
    ['cropImageAndSaveToTemp', cropImageAndSaveToTemp],
    ['deletePackage', deletePackage],
    ['deletePackageThumbnails', deletePackageThumbnails],
    ['deleteUserConfigAndRestart', deleteUserConfigAndRestart],
    ['editPackageData', editPackageData],
    ['extractMultitrackOrSongAudioFromSong', extractMultitrackOrSongAudioFromSong],
    ['getDTAFilteringFromPackage', getDTAFilteringFromPackage],
    ['getScoresFromGoCentral', getScoresFromGoCentral],
    ['getSongArtworkDataURL', getSongArtworkDataURL],
    ['installHighMemoryPatch', installHighMemoryPatch],
    ['installPKGFile', installPKGFile],
    ['loadImageForCrop', loadImageForCrop],
    ['openFolderInExplorer', async (_, __, folderPath: string): Promise<string> => await shell.openPath(folderPath)],
    ['openUserDataFolder', openUserDataFolder],
    ['playRockBand3', playRockBand3],
    ['readUserConfigFile', readUserConfigFile],
    ['refreshPackagesData', refreshPackagesData],
    ['rpcs3GetInstrumentScores', rpcs3GetInstrumentScores],
    ['rpcs3GetPackagesData', rpcs3GetPackagesData],
    ['rpcs3GetRB3Stats', rpcs3GetRB3Stats],
    ['rpcs3GetSaveDataStats', rpcs3GetSaveDataStats],
    ['saveUserConfigFile', async (_, __, newConfig?: Partial<UserConfigObject>): Promise<string> => await saveUserConfigFile(newConfig)],
    ['selectAndParseDTAFile', selectAndParseDTAFile],
    ['selectDevhdd0Dir', selectDevhdd0Dir],
    ['selectPackageFiles', selectPackageFiles],
    ['selectPKGFile', selectPKGFile],
    ['selectRPCS3Exe', selectRPCS3Exe],
    ['testBuzyLoad', testBuzyLoad],
    ['testError', (_, __, message?: string): Error => new Error(message || '')],
    ['testUserConfig', testUserConfig],
    ['windowClose', windowClose],
    ['windowMaximize', windowMaximize],
    ['windowMinimize', windowMinimize],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
