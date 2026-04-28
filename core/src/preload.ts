/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, shell, webUtils, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { Promisable } from 'type-fest'
import type { openUserDataFolder, readUserConfigFile, MessageBoxObject, saveUserConfigFile, UserConfigObject, windowClose, windowMaximize, windowMinimize, BuzyLoadInitObject, BuzyLoadScreenSenderObject, BuzyLoadErrorObject, DialogScreenPromptsTypes, BuzyLoadSubtextObject } from './core.exports'
import type { deletePackage, deletePackageThumbnails, deleteUserConfigAndRestart, editPackageData, getDTAFilteringFromPackage, getSongArtworkDataURL, installHighMemoryPatch, installPKGFile, playRockBand3, refreshPackagesData, rpcs3GetInstrumentScores, rpcs3GetPackagesData, rpcs3GetRB3Stats, rpcs3GetSaveDataStats, selectAndParseDTAFile, selectDevhdd0Dir, loadImageForCrop, selectPackageFiles, SelectPackageFilesStatsTypes, SelectPKGFileReturnObject, selectPKGFile, selectRPCS3Exe, testUserConfig, cropImageAndSaveToTemp, CropImageAndSaveToTempOptions, createNewPackage, CreateNewPackageOptions, testBuzyLoad, getScoresFromGoCentral, extractMultitrackOrSongAudioFromSong } from './controllers.exports'
import type { ParsedRB3SaveData, ScoreDataInstrumentTypes } from 'rockshelf-core/rbtools'
import type { EditPackageDataOptions, RPCS3SongPackagesObjectExtra } from './lib.exports'
import type { FatalErrorObject } from './lib/senders/fatalError'
import type { DTAFilterOptions, DTAFilterTypes, RB3CompatibleDTAFile } from 'rockshelf-core/rbtools/lib'

const invoke = ipcRenderer.invoke.bind(ipcRenderer)
const on = ipcRenderer.on.bind(ipcRenderer)
const send = ipcRenderer.send.bind(ipcRenderer)

export type OnBuzyLoadCallback = (event: IpcRendererEvent, func: BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject | BuzyLoadSubtextObject) => void
export type OnDialogScreenCallback = (event: IpcRendererEvent, code: DialogScreenPromptsTypes) => Promisable<any>
export type OnLocaleRequestCallback = (event: IpcRendererEvent, uuid: string, key: string, messageValues?: Record<string, string | number>) => void
export type OnMessageCallback = (event: IpcRendererEvent, message: MessageBoxObject) => Promisable<any>
export type OnRendererConsoleCallback = (event: IpcRendererEvent, value: any) => Promisable<any>
export type OnFatalErrorCallback = (event: IpcRendererEvent, errObject: FatalErrorObject) => Promisable<any>

export const rockshelfAPI = {
  // #region Listeners
  onBuzyLoad(callback: OnBuzyLoadCallback): IpcRenderer {
    return on('sendBuzyLoad', callback)
  },
  onDialog(callback: OnDialogScreenCallback): IpcRenderer {
    return on('sendDialog', callback)
  },
  onRendererConsole(callback: OnRendererConsoleCallback): IpcRenderer {
    return on('sendRendererConsole', callback)
  },
  onFatalError(callback: OnFatalErrorCallback): IpcRenderer {
    return on('sendFatalError', callback)
  },
  /**
   * Listens for small messages from the main process.
   * - - - -
   * @param {OnMessageCallback} callback The callback function to handle the message event.
   * @returns {IpcRenderer}
   */
  onMessage(callback: OnMessageCallback): IpcRenderer {
    return on('sendMessageBox', callback)
  },
  /**
   * Listens for requests to localized values.
   * - - - -
   * @param {(event: IpcRendererEvent, uuid: string, key: string) => Promise<string>} callback The callback function to handle the localized string request.
   */
  onLocaleRequest(callback: OnLocaleRequestCallback): IpcRenderer {
    return on('getLocaleStringFromRenderer', callback)
  },
  /**
   * Sends a localized string to the main process. This function must be called inside the `onLocaleRequest` listener to get the request UUID.
   * - - - -
   * @param {string} uuid A unique
   * @param {string} text The localized string you want to send to the main process.
   */
  sendLocale(uuid: string, text: string): void {
    return ipcRenderer.send(`sendLocale/${uuid}`, text)
  },

  /**
   * Open an external link in the default web browser.
   * - - - -
   * @param {string} url The URL to open.
   * @returns {Promise<void>}
   */
  async openExternalLink(url: string): Promise<void> {
    return await shell.openExternal(url)
  },
  /**
   * Convert a `File` object or an array of `File` objects to their respective file paths.
   * - - - -
   * @param {T} files The File or array of Files to convert.
   * @returns {RT}
   */
  fileToPath<T extends File | File[], RT extends T extends File ? string : string[]>(files: T): RT {
    if (Array.isArray(files)) {
      const filesPath: string[] = []

      for (const file of files) {
        const path = webUtils.getPathForFile(file as File)
        filesPath.push(path)
      }

      return filesPath as RT
    }

    const path = webUtils.getPathForFile(files)
    return path as RT
  },

  /**
   * Close the application window.
   * - - - -
   * @returns {Promise<void>}
   */
  windowClose: async (): Promise<ReturnType<typeof windowClose>> => await invoke('windowClose'),
  /**
   * Minimize the application window.
   * - - - -
   * @returns {Promise<void>}
   */
  windowMinimize: async (): Promise<ReturnType<typeof windowMinimize>> => await invoke('windowMinimize'),
  /**
   * Maximize the application window. Returns true if the window is maximized, false otherwise.
   * - - - -
   * @returns {Promise<boolean>}
   */
  windowMaximize: async (): Promise<ReturnType<typeof windowMaximize>> => await invoke('windowMaximize'),

  createNewPackage: async (options: CreateNewPackageOptions): ReturnType<typeof createNewPackage> => await invoke('createNewPackage', options),
  cropImageAndSaveToTemp: async (options: CropImageAndSaveToTempOptions): ReturnType<typeof cropImageAndSaveToTemp> => await invoke('cropImageAndSaveToTemp', options),
  deletePackage: async (pkgIndex: number): ReturnType<typeof deletePackage> => await invoke('deletePackage', pkgIndex),
  deletePackageThumbnails: async (): ReturnType<typeof deletePackageThumbnails> => await invoke('deletePackageThumbnails'),
  deleteUserConfigAndRestart: async (): ReturnType<typeof deleteUserConfigAndRestart> => await invoke('deleteUserConfigAndRestart'),
  discordRPDestroy: async (): Promise<boolean> => await invoke('discordRPDestroy'),
  discordRPSetUserConfig: async (userConfig: UserConfigObject): Promise<boolean> => await invoke('discordRPSetUserConfig', userConfig),
  discordRPStart: async (): Promise<boolean> => await invoke('discordRPStart'),
  editPackageData: async (pkgIndex: number, options: EditPackageDataOptions): ReturnType<typeof editPackageData> => await invoke('editPackageData', pkgIndex, options),
  extractMultitrackOrSongAudioFromSong: async (packagePath: string, song: RB3CompatibleDTAFile): ReturnType<typeof extractMultitrackOrSongAudioFromSong> => await invoke('extractMultitrackOrSongAudioFromSong', packagePath, song),
  getDTAFilteringFromPackage: async (selectedIndex: number, type?: DTAFilterTypes, options?: DTAFilterOptions): ReturnType<typeof getDTAFilteringFromPackage> => await invoke('getDTAFilteringFromPackage', selectedIndex, type, options),
  getScoresFromGoCentral: async (songID: number, instrument: ScoreDataInstrumentTypes = 'band'): ReturnType<typeof getScoresFromGoCentral> => await invoke('getScoresFromGoCentral', songID, instrument),
  getSongArtworkDataURL: async (packageDetails: RPCS3SongPackagesObjectExtra, songDetails: RB3CompatibleDTAFile): ReturnType<typeof getSongArtworkDataURL> => await invoke('getSongArtworkDataURL', packageDetails, songDetails),
  installHighMemoryPatch: async (): ReturnType<typeof installHighMemoryPatch> => await invoke('installHighMemoryPatch'),
  installPKGFile: async (selectedPKG: SelectPKGFileReturnObject): ReturnType<typeof installPKGFile> => await invoke('installPKGFile', selectedPKG),
  loadImageForCrop: async (defaultPath?: string): ReturnType<typeof loadImageForCrop> => await invoke('loadImageForCrop', defaultPath),
  openFolderInExplorer: async (folderPath: string): ReturnType<typeof getDTAFilteringFromPackage> => await invoke('openFolderInExplorer', folderPath),
  openUserDataFolder: async (): ReturnType<typeof openUserDataFolder> => await invoke('openUserDataFolder'),
  playRockBand3: async (): ReturnType<typeof playRockBand3> => await invoke('playRockBand3'),
  readUserConfigFile: async (): ReturnType<typeof readUserConfigFile> => await invoke('readUserConfigFile'),
  refreshPackagesData: async (): ReturnType<typeof refreshPackagesData> => await invoke('refreshPackagesData'),
  rpcs3GetInstrumentScores: async (saveData: ParsedRB3SaveData): ReturnType<typeof rpcs3GetInstrumentScores> => await invoke('rpcs3GetInstrumentScores', saveData),
  rpcs3GetPackagesData: async (forceUpdate: boolean = false): ReturnType<typeof rpcs3GetPackagesData> => await invoke('rpcs3GetPackagesData', forceUpdate),
  rpcs3GetRB3Stats: async (): ReturnType<typeof rpcs3GetRB3Stats> => await invoke('rpcs3GetRB3Stats'),
  rpcs3GetSaveDataStats: async (): ReturnType<typeof rpcs3GetSaveDataStats> => await invoke('rpcs3GetSaveDataStats'),
  saveUserConfigFile: async (newConfig?: Partial<UserConfigObject>): ReturnType<typeof saveUserConfigFile> => await invoke('saveUserConfigFile', newConfig),
  selectAndParseDTAFile: async (): ReturnType<typeof selectAndParseDTAFile> => await invoke('selectAndParseDTAFile'),
  selectDevhdd0Dir: async (): ReturnType<typeof selectDevhdd0Dir> => await invoke('selectDevhdd0Dir'),
  selectPackageFiles: async (files: SelectPackageFilesStatsTypes[]): ReturnType<typeof selectPackageFiles> => await invoke('selectPackageFiles', files),
  selectPKGFile: async (): ReturnType<typeof selectPKGFile> => await invoke('selectPKGFile'),
  selectRPCS3Exe: async (): ReturnType<typeof selectRPCS3Exe> => await invoke('selectRPCS3Exe'),
  testBuzyLoad: async (): ReturnType<typeof testBuzyLoad> => await invoke('testBuzyLoad'),
  testError: async (message?: string): ReturnType<typeof testUserConfig> => await invoke('testError', message),
  testUserConfig: async (): ReturnType<typeof testUserConfig> => await invoke('testUserConfig'),
} as const
