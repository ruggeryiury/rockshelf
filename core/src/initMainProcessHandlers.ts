import { shell, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { deletePackage, deleteRockshelfDataFromPackages, deleteUserConfigAndRestart, editPackageData, sortAndFilterSongsFromPackage, getSongArtworkDataURL, installHighMemoryPatch, installPKGFile, playRockBand3, refreshPackagesData, rpcs3GetInstrumentScores, rpcs3GetPackagesData, rpcs3GetRB3Stats, rpcs3GetSaveDataStats, selectAndParseDTAFile, selectDevhdd0Dir, loadImageForCrop, selectPackageFiles, selectPKGFile, selectRPCS3Exe, testUserConfig, cropImageAndSaveToTemp, createNewPackage, testBuzyLoad, getScoresFromGoCentral, extractMultitrackOrSongAudioFromSong, encDecPackage, verifyPackageEncryptionStatus, extractMIDIFromSong, batchDeleteSongs, sortAndFilterSongPackages, fetchRhythmverseData, useSongArtworkFromUniqueSongPKG, changeDecryptedPackageFolderName, installQuickConfig, mergePackages, exportPackage, selectPathToSaveRB3File, selectRB3File, openConsoleWindow, installRB3File, getCommitDataFromCommitHash, checkCommitsAhead, getInstalledDeluxeData, downloadAndInstallDeluxe, openFSFolderInExplorer, getDownloadedContentData, selectDir } from './controllers.exports'
import { openUserDataFolder, readUserConfigFile, saveUserConfigFile, windowClose, windowMaximize, windowMinimize, type UserConfigObject } from './core.exports'
import { addHandler } from './core/handler'
import { getSongPackageDescriptionFileFromFolderHandler } from './controllers/getSongPackageDescriptionFileFromFolder'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>
export type InitHandlersArray = [string, HandlerFnType][]

export const initMainProcessHandlers = (): void => {
  const handlers: InitHandlersArray = [
    ['batchDeleteSongs', batchDeleteSongs],
    ['changeDecryptedPackageFolderName', changeDecryptedPackageFolderName],
    ['checkCommitsAhead', checkCommitsAhead],
    ['createNewPackage', createNewPackage],
    ['cropImageAndSaveToTemp', cropImageAndSaveToTemp],
    ['deletePackage', deletePackage],
    ['deleteRockshelfDataFromPackages', deleteRockshelfDataFromPackages],
    ['deleteUserConfigAndRestart', deleteUserConfigAndRestart],
    ['downloadAndInstallDeluxe', downloadAndInstallDeluxe],
    ['editPackageData', editPackageData],
    ['encDecPackage', encDecPackage],
    ['exportPackage', exportPackage],
    ['extractMIDIFromSong', extractMIDIFromSong],
    ['extractMultitrackOrSongAudioFromSong', extractMultitrackOrSongAudioFromSong],
    ['fetchRhythmverseData', fetchRhythmverseData],
    ['getCommitDataFromCommitHash', getCommitDataFromCommitHash],
    ['getDownloadedContentData', getDownloadedContentData],
    ['getInstalledDeluxeData', getInstalledDeluxeData],
    ['getScoresFromGoCentral', getScoresFromGoCentral],
    ['getSongArtworkDataURL', getSongArtworkDataURL],
    ['getSongPackageDescriptionFileFromFolder', getSongPackageDescriptionFileFromFolderHandler],
    ['installHighMemoryPatch', installHighMemoryPatch],
    ['installPKGFile', installPKGFile],
    ['installQuickConfig', installQuickConfig],
    ['installRB3File', installRB3File],
    ['loadImageForCrop', loadImageForCrop],
    ['mergePackages', mergePackages],
    ['openConsoleWindow', openConsoleWindow],
    ['openFolderInExplorer', async (_, __, folderPath: string): Promise<string> => await shell.openPath(folderPath)],
    ['openFSFolderInExplorer', openFSFolderInExplorer],
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
    ['selectDir', selectDir],
    ['selectPackageFiles', selectPackageFiles],
    ['selectPathToSaveRB3File', selectPathToSaveRB3File],
    ['selectPKGFile', selectPKGFile],
    ['selectRB3File', selectRB3File],
    ['selectRPCS3Exe', selectRPCS3Exe],
    ['sortAndFilterSongPackages', sortAndFilterSongPackages],
    ['sortAndFilterSongsFromPackage', sortAndFilterSongsFromPackage],
    ['testBuzyLoad', testBuzyLoad],
    ['testError', (_, __, message?: string): Error => new Error(message || '')],
    ['testUserConfig', testUserConfig],
    ['useSongArtworkFromUniqueSongPKG', useSongArtworkFromUniqueSongPKG],
    ['verifyPackageEncryptionStatus', verifyPackageEncryptionStatus],
    ['windowClose', windowClose],
    ['windowMaximize', windowMaximize],
    ['windowMinimize', windowMinimize],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
