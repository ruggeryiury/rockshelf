/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, type IpcRendererEvent, type IpcRenderer, webUtils } from 'electron'
import type { Promisable } from 'type-fest'
import type { BuzyLoadScreenSenderObject, BuzyLoadInitObject, BuzyLoadErrorObject, BuzyLoadSubtextObject, DialogScreenPromptsTypes, MessageBoxObject, FatalErrorObject, RhythmverseSongDownloadJSONRepresentation, UserConfigReadObject, UserConfigObject, InitialStateObject, DeluxeInstalledData, RB3SongPackagesData, LightRB3SongPackagesData, DeluxeInstallationOptions, LightRB3SongPackagesDataObject, EditPackageOptions, CreatePackageOptions, RhythmverseDownloadSongOptions, EncDecPackageFunctionTypes } from './core.exports'
import type { DTAFilterByArtistObject, DTAFilterByDifficultyObject, DTAFilterGenericObject, DTAFilterOptions, DTAFilterTypes, QuickConfigType, RB3CompatibleDTAFile, RockBand3Data } from './lib/rbtools/lib.exports'
import type { GoCentralLeaderboardResultObject, ImageCropOptions, InstrumentScoreData, MOGGTracksExtractorOptions, ParsedRB3SaveData, ProcessedRhythmverseObject, RhythmverseFetchingOptions, ScoreDataInstrumentTypes } from './lib/rbtools'
import type { installHighMemoryPatch, LoadImageForCropReturnObject, playRB3, RhythmverseDataFetchingTypes, RockshelfFileSystemAPItemCommand, selectorDevhdd0, selectorDir, selectorPackageFiles, selectorPathToRB3File, SelectorPathToRB3FileExportTypes, selectorRB3File, selectorRPCS3Exe, SelectPackageFilesStatsTypes } from './handlers.exports'
import type { CreateRB3FileOptions, RB3FileExtractionOptions, SongPackagesFilterGenericObject, SongPackagesFilterOptions, SongPackagesFilterTypes } from './lib.exports'
import type { FilePathJSONRepresentation } from 'node-lib'

const invoke = ipcRenderer.invoke.bind(ipcRenderer)
const on = ipcRenderer.on.bind(ipcRenderer)
const send = ipcRenderer.send.bind(ipcRenderer)

export type OnBuzyLoadCallback = (event: IpcRendererEvent, func: BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject | BuzyLoadSubtextObject) => void
export type OnDialogScreenCallback = (event: IpcRendererEvent, code: DialogScreenPromptsTypes) => Promisable<any>
export type OnLocaleRequestCallback = (event: IpcRendererEvent, uuid: string, key: string, messageValues?: Record<string, string | number>) => void
export type OnMessageCallback = (event: IpcRendererEvent, message: MessageBoxObject) => Promisable<any>
export type OnRendererConsoleCallback = (event: IpcRendererEvent, ...value: any[]) => Promisable<any>
export type OnFatalErrorCallback = (event: IpcRendererEvent, errObject: FatalErrorObject) => Promisable<any>
export type OnRhythmverseQueueCallback = (event: IpcRendererEvent, queue: RhythmverseSongDownloadJSONRepresentation[]) => Promisable<any>

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
  onMessage(callback: OnMessageCallback): IpcRenderer {
    return on('sendMessageBox', callback)
  },
  onLocaleRequest(callback: OnLocaleRequestCallback): IpcRenderer {
    return on('getLocaleStringFromRenderer', callback)
  },
  onRhythmverseQueue(callback: OnRhythmverseQueueCallback): IpcRenderer {
    return on('sendRhythmverseQueue', callback)
  },
  /**
   * Sends a localized string to the main process. This function must be called inside the `onLocaleRequest` listener to get the request UUID.
   * - - - -
   * @param {string} uuid A unique ID.
   * @param {string} text The localized string you want to send to the main process.
   */
  sendLocale(uuid: string, text: string): void {
    return ipcRenderer.send(`sendLocale/${uuid}`, text)
  },
  /**
   * Convert a `File` object or an array of `File` objects to their respective file paths.
   * - - - -
   * @param {T} files The File or array of Files to convert.
   * @returns {RT}
   */
  fileToPath<T extends File | File[], RT extends (T extends File ? string : string[])>(files: T): RT {
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

  win: {
    close: async (): Promise<void> => await invoke('win.close'),
    minimize: async (): Promise<void> => await invoke('win.minimize'),
    maximize: async (): Promise<boolean> => await invoke('win.maximize'),
    restart: async (): Promise<void> => await invoke('win.restart'),
  },

  open: {
    consoleWindow: async (): Promise<void> => await invoke('open.consoleWindow'),
    dir: async (dirPath: string): Promise<void> => await invoke('open.dir', dirPath),
    externalURL: async (url: string): Promise<void> => await invoke('open.externalURL', url),
    fsDir: async (command: RockshelfFileSystemAPItemCommand): Promise<void> => await invoke('open.fsDir', command),
    imageToCrop: async (defaultPath?: string): Promise<LoadImageForCropReturnObject | false> => await invoke('open.imageToCrop', defaultPath),
  },

  discord: {
    setUserConfig: async (userConfig: UserConfigObject): Promise<boolean> => await invoke('discord.setUserConfig', userConfig),
    start: async (): Promise<boolean> => await invoke('discord.start'),
    stop: async (): Promise<boolean> => await invoke('discord.stop'),
  },

  userConfig: {
    read: async (): Promise<UserConfigReadObject> => await invoke('UserDataAPI/read'),
    save: async (newConfig?: Partial<UserConfigObject>): Promise<UserConfigObject> => await invoke('UserDataAPI/save', newConfig),
    delete: async (): Promise<void> => await invoke('UserDataAPI/delete'),
  },

  data: {
    createPackage: async (options: CreatePackageOptions): Promise<false | LightRB3SongPackagesData> => await invoke('DataSyncAPI/createPackage', options),
    deletePackage: async (pkgIndex: number): Promise<false | LightRB3SongPackagesData> => await invoke('DataSyncAPI/deletePackage', pkgIndex),
    deleteSongsFromPackage: async (pkgIndex: number, songs: string[]): Promise<false | LightRB3SongPackagesData> => await invoke('DataSyncAPI/deleteSongsFromPackage', pkgIndex, songs),
    editPackage: async (pkgIndex: number, options: EditPackageOptions): Promise<false | LightRB3SongPackagesData> => await invoke('DataSyncAPI/editPackage', pkgIndex, options),
    encDecPackage: async (pkgIndex: number, command: EncDecPackageFunctionTypes): Promise<false | LightRB3SongPackagesData> => await invoke('DataSyncAPI/encDecPackage', pkgIndex, command),
    exportPackage: async (packagePath: string, destPath: string, options?: CreateRB3FileOptions): Promise<void> => await invoke('DataSyncAPI/exportPackage', packagePath, destPath, options),
    exportSong: async (pkgIndex: number, songIndex: number, destPath: string): Promise<void> => await invoke('DataSyncAPI/exportSong', pkgIndex, songIndex, destPath),
    installRB3File: async (rb3FilePath: string, options?: RB3FileExtractionOptions): Promise<false | LightRB3SongPackagesData> => await invoke('DataSyncAPI/installRB3File', rb3FilePath, options),
    mergePackages: async (fromPackageIndex: number, toPackageIndex: number): Promise<false | LightRB3SongPackagesData> => await invoke('DataSyncAPI/mergePackages', fromPackageIndex, toPackageIndex),

    getArtworkDataURLFromSong: async (packageDetails: LightRB3SongPackagesDataObject, songDetails: RB3CompatibleDTAFile): Promise<string | false> => await invoke('DataSyncAPI/getArtworkDataURLFromSong', packageDetails, songDetails),
    getPackageDescription: async (pkgPath: string): Promise<string | false> => await invoke('DataSyncAPI/getPackageDescription', pkgPath),
    getScoresFromGoCentral: async (songID: number, instrument: ScoreDataInstrumentTypes = 'band'): Promise<GoCentralLeaderboardResultObject> => await invoke('DataSyncAPI/getScoresFromGoCentral', songID, instrument),
    getSongsFromPackage: async (pkgIndex: number): Promise<RB3CompatibleDTAFile[] | false> => await invoke('DataSyncAPI/getSongsFromPackage', pkgIndex),
    useFirstSongArtworkAsPkgArtwork: async (pkgIndex: number): Promise<boolean> => await invoke('DataSyncAPI/useFirstSongArtworkAsPkgArtwork', pkgIndex),

    getInitialState: async (): Promise<InitialStateObject> => await invoke('DataSyncAPI/getInitialState'),
    getRockBand3Data: async (): Promise<RockBand3Data> => await invoke('DataSyncAPI/getRockBand3Data'),
    getRockBand3SaveData: async (): Promise<ParsedRB3SaveData | false> => await invoke('DataSyncAPI/getRockBand3SaveData'),
    getInstrumentScoresData: async (saveData: ParsedRB3SaveData | false): Promise<InstrumentScoreData | false> => await invoke('DataSyncAPI/getInstrumentScoresData', saveData),
    getInstalledDeluxeData: async (): Promise<DeluxeInstalledData | false> => await invoke('DataSyncAPI/getInstalledDeluxeData'),
    getSongPackagesData: async (): Promise<RB3SongPackagesData> => await invoke('DataSyncAPI/getSongPackagesData'),
    refreshSongPackageData: async (pkgIndex: number): Promise<RB3SongPackagesData> => await invoke('DataSyncAPI/refreshSongPackageData', pkgIndex),
    getLightSongPackagesData: async (): Promise<LightRB3SongPackagesData> => await invoke('DataSyncAPI/getLightSongPackagesData'),

    downloadAndInstallDeluxe: async (options: DeluxeInstallationOptions): Promise<DeluxeInstalledData | false> => await invoke('DataSyncAPI/downloadAndInstallDeluxe', options),
    installQuickConfig: async (configType: QuickConfigType): Promise<void> => await invoke('DataSyncAPI/installQuickConfig', configType),

    filterSongPackages: async (type: SongPackagesFilterTypes, options?: SongPackagesFilterOptions): Promise<SongPackagesFilterGenericObject> => await invoke('DataSyncAPI/filterSongPackages', type, options),
    filterSongsFromPackage: async (pkgIndex: number, type: DTAFilterTypes = 'title', options?: DTAFilterOptions): Promise<DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject> => await invoke('DataSyncAPI/filterSongsFromPackage', pkgIndex, type, options),
  },

  selector: {
    devhdd0: async (): ReturnType<typeof selectorDevhdd0> => await invoke('selector.devhdd0'),
    rpcs3Exe: async (): ReturnType<typeof selectorRPCS3Exe> => await invoke('selector.rpcs3exe'),
    dir: async (): ReturnType<typeof selectorDir> => await invoke('selector.dir'),
    rb3File: async (): ReturnType<typeof selectorRB3File> => await invoke('selector.rb3File'),
    packageFiles: async (files: SelectPackageFilesStatsTypes[]): ReturnType<typeof selectorPackageFiles> => await invoke('selector.packageFiles', files),
    pathToRB3File: async (exportType: SelectorPathToRB3FileExportTypes = 'package'): ReturnType<typeof selectorPathToRB3File> => await invoke('selector.pathToRB3File', exportType),
  },

  rpcs3: {
    playRB3: async (): ReturnType<typeof playRB3> => await invoke('rpcs3.playRB3'),
    installHighMemoryPatch: async (): ReturnType<typeof installHighMemoryPatch> => await invoke('rpcs3.installHighMemoryPatch'),
  },

  rhythmverse: {
    fetchData: async (searchField: string, type: RhythmverseDataFetchingTypes, options?: RhythmverseFetchingOptions): Promise<ProcessedRhythmverseObject> => await invoke('rhythmverse.fetchData', searchField, type, options),
  },

  img: {
    cropAndSaveToTemp: async (srcFile: string, options?: ImageCropOptions): Promise<FilePathJSONRepresentation> => await invoke('img.cropAndSaveToTemp', srcFile, options),
  },

  audio: {
    extractMOGGTracksFromSong: async (packageDetails: LightRB3SongPackagesDataObject, songDetails: RB3CompatibleDTAFile, options?: MOGGTracksExtractorOptions): Promise<void> => await invoke('audio.extractMOGGTracksFromSong', packageDetails, songDetails, options),
  },

  songDownloadQueue: {
    downloadSong: async (options: RhythmverseDownloadSongOptions) => await invoke('songDownloadQueue.downloadSong', options),
    cleanDownloadQueue: async () => await invoke('songDownloadQueue.downloadSong'),
    cancelDownload: async (hash: string) => await invoke('songDownloadQueue.downloadSong', hash),
  },

  // batchDeleteSongs: async (pkgIndex: number, songs: string[]): ReturnType<typeof batchDeleteSongs> => await invoke('batchDeleteSongs', pkgIndex, songs),
  // changeDecryptedPackageFolderName: async (pkgIndex: number, newPackageFolderName: string): ReturnType<typeof changeDecryptedPackageFolderName> => await invoke('changeDecryptedPackageFolderName', pkgIndex, newPackageFolderName),
  // checkCommitsAhead: async (commitHash: string, options?: ResponseGetBasicOptions): ReturnType<typeof checkCommitsAhead> => await invoke('checkCommitsAhead', commitHash, options),
  // createNewPackage: async (options: CreateNewPackageOptions): ReturnType<typeof createNewPackage> => await invoke('createNewPackage', options),
  // cropImageAndSaveToTemp: async (options: CropImageAndSaveToTempOptions): ReturnType<typeof cropImageAndSaveToTemp> => await invoke('cropImageAndSaveToTemp', options),
  // deletePackage: async (pkgIndex: number): ReturnType<typeof deletePackage> => await invoke('deletePackage', pkgIndex),
  // deleteRockshelfDataFromPackages: async (): ReturnType<typeof deleteRockshelfDataFromPackages> => await invoke('deleteRockshelfDataFromPackages'),
  // deleteUserConfigAndRestart: async (restartOnly: boolean = false): ReturnType<typeof deleteUserConfigAndRestart> => await invoke('deleteUserConfigAndRestart', restartOnly),
  // discordRPDestroy: async (): Promise<boolean> => await invoke('discordRPDestroy'),
  // discordRPSetUserConfig: async (userConfig: UserConfigObject): Promise<boolean> => await invoke('discordRPSetUserConfig', userConfig),
  // discordRPStart: async (): Promise<boolean> => await invoke('discordRPStart'),
  // downloadAndInstallDeluxe: async (options: DeluxeInstallationOptions): ReturnType<typeof downloadAndInstallDeluxe> => await invoke('downloadAndInstallDeluxe', options),
  // editPackageData: async (pkgIndex: number, options: EditPackageDataOptions): ReturnType<typeof editPackageData> => await invoke('editPackageData', pkgIndex, options),
  // encDecPackage: async (func: EncDecPackageFunctionTypes, pkgIndex: number): ReturnType<typeof encDecPackage> => await invoke('encDecPackage', func, pkgIndex),
  // exportPackage: async (packagePath: string, destPath: string, options?: CreateRB3FileOptions): ReturnType<typeof exportPackage> => await invoke('exportPackage', packagePath, destPath, options),
  // extractMIDIFromSong: async (packageDetails: RPCS3SongPackagesObjectExtra, song: RB3CompatibleDTAFile): ReturnType<typeof extractMIDIFromSong> => await invoke('extractMIDIFromSong', packageDetails, song),
  // extractMultitrackOrSongAudioFromSong: async (packageDetails: RPCS3SongPackagesObjectExtra, song: RB3CompatibleDTAFile): ReturnType<typeof extractMultitrackOrSongAudioFromSong> => await invoke('extractMultitrackOrSongAudioFromSong', packageDetails, song),
  // fetchRhythmverseData: async (searchField: string, type: RhythmverseDataFetchingTypes, options?: RhythmverseFetchingOptions): ReturnType<typeof fetchRhythmverseData> => await invoke('fetchRhythmverseData', searchField, type, options),
  // getCommitDataFromCommitHash: async (commitHash: string, options?: ResponseGetBasicOptions): ReturnType<typeof getCommitDataFromCommitHash> => await invoke('getCommitDataFromCommitHash', commitHash, options),
  // getDownloadedContentData: async (): ReturnType<typeof SongDownloadQueueAPI.getDownloadedContentData> => await invoke('getDownloadedContentData'),
  // getInstalledDeluxeData: async (): ReturnType<typeof getInstalledDeluxeData> => await invoke('getInstalledDeluxeData'),
  // getScoresFromGoCentral: async (songID: number, instrument: ScoreDataInstrumentTypes = 'band'): ReturnType<typeof getScoresFromGoCentral> => await invoke('getScoresFromGoCentral', songID, instrument),
  // getSongArtworkDataURL: async (packageDetails: RPCS3SongPackagesObjectExtra, songDetails: RB3CompatibleDTAFile): ReturnType<typeof getSongArtworkDataURL> => await invoke('getSongArtworkDataURL', packageDetails, songDetails),
  // getSongPackageDescriptionFileFromFolder: async (packagePath: string): ReturnType<typeof getSongPackageDescriptionFileFromFolderHandler> => await invoke('getSongPackageDescriptionFileFromFolder', packagePath),
  // installHighMemoryPatch: async (): ReturnType<typeof installHighMemoryPatch> => await invoke('installHighMemoryPatch'),
  // installPKGFile: async (selectedPKG: SelectPKGFileReturnObject): ReturnType<typeof installPKGFile> => await invoke('installPKGFile', selectedPKG),
  // installQuickConfig: async (rpcs3ExePath: string, configType: QuickConfigType): ReturnType<typeof installQuickConfig> => await invoke('installQuickConfig', rpcs3ExePath, configType),
  // installRB3File: async (rb3FilePath: string, options?: RB3FileExtractionOptions): ReturnType<typeof installRB3File> => await invoke('installRB3File', rb3FilePath, options),
  // loadImageForCrop: async (defaultPath?: string): ReturnType<typeof loadImageForCrop> => await invoke('loadImageForCrop', defaultPath),
  // mergePackages: async (selectedPackageIndex: number, mainPackageIndex: number): ReturnType<typeof mergePackages> => await invoke('mergePackages', selectedPackageIndex, mainPackageIndex),
  // openConsoleWindow: async (): ReturnType<typeof openConsoleWindow> => await invoke('openConsoleWindow'),
  // openFolderInExplorer: async (folderPath: string): ReturnType<typeof sortAndFilterSongsFromPackage> => await invoke('openFolderInExplorer', folderPath),
  // openFSFolderInExplorer: async (command: RockshelfFileSystemAPItemCommand): ReturnType<typeof openFSFolderInExplorer> => await invoke('openFSFolderInExplorer', command),
  // openUserDataFolder: async (): ReturnType<typeof UserConfigAPI.openUserDataDir> => await invoke('openUserDataFolder'),
  // playRockBand3: async (): ReturnType<typeof playRockBand3> => await invoke('playRockBand3'),
  // readUserConfigFile: async (): ReturnType<typeof UserConfigAPI.readFile> => await invoke('readUserConfigFile'),
  // refreshPackagesData: async (): ReturnType<typeof refreshPackagesData> => await invoke('refreshPackagesData'),
  // rhythmverseDownloadSong: async (options: RhythmverseDownloadSongOptions, userOptions: UserConfigObject): Promise<void> => await invoke('rhythmverseDownloadSong', options, userOptions),
  // rpcs3GetInstrumentScores: async (saveData: ParsedRB3SaveData): ReturnType<typeof rpcs3GetInstrumentScores> => await invoke('rpcs3GetInstrumentScores', saveData),
  // rpcs3GetPackagesData: async (forceUpdate: boolean = false): ReturnType<typeof rpcs3GetPackagesData> => await invoke('rpcs3GetPackagesData', forceUpdate),
  // rpcs3GetRB3Stats: async (): ReturnType<typeof rpcs3GetRB3Stats> => await invoke('rpcs3GetRB3Stats'),
  // rpcs3GetSaveDataStats: async (): ReturnType<typeof rpcs3GetSaveDataStats> => await invoke('rpcs3GetSaveDataStats'),
  // saveUserConfigFile: async (newConfig?: Partial<UserConfigObject>): ReturnType<typeof UserConfigAPI.saveFile> => await invoke('saveUserConfigFile', newConfig),
  // selectAndParseDTAFile: async (): ReturnType<typeof selectAndParseDTAFile> => await invoke('selectAndParseDTAFile'),
  // selectDevhdd0Dir: async (): ReturnType<typeof selectDevhdd0Dir> => await invoke('selectDevhdd0Dir'),
  // selectDir: async (): ReturnType<typeof selectDir> => await invoke('selectDir'),
  // selectPackageFiles: async (files: SelectPackageFilesStatsTypes[]): ReturnType<typeof selectPackageFiles> => await invoke('selectPackageFiles', files),
  // selectPathToSaveRB3File: async (): ReturnType<typeof selectPathToSaveRB3File> => await invoke('selectPathToSaveRB3File'),
  // selectPKGFile: async (): ReturnType<typeof selectPKGFile> => await invoke('selectPKGFile'),
  // selectRB3File: async (): ReturnType<typeof selectRB3File> => await invoke('selectRB3File'),
  // selectRPCS3Exe: async (): ReturnType<typeof selectRPCS3Exe> => await invoke('selectRPCS3Exe'),
  // sortAndFilterSongPackages: async (type: SongPackagesFilterTypes, options?: SongPackagesFilterOptions): ReturnType<typeof sortAndFilterSongPackages> => await invoke('sortAndFilterSongPackages', type, options),
  // sortAndFilterSongsFromPackage: async (selectedIndex: number, type?: DTAFilterTypes, options?: DTAFilterOptions): ReturnType<typeof sortAndFilterSongsFromPackage> => await invoke('sortAndFilterSongsFromPackage', selectedIndex, type, options),
  // testBuzyLoad: async (): ReturnType<typeof testBuzyLoad> => await invoke('testBuzyLoad'),
  // testError: async (message?: string): ReturnType<typeof UserConfigAPI.validateFile> => await invoke('testError', message),
  // testUserConfig: async (): ReturnType<typeof UserConfigAPI.validateFile> => await invoke('testUserConfig'),
  // useSongArtworkFromUniqueSongPKG: async (pkgIndex: number): ReturnType<typeof useSongArtworkFromUniqueSongPKG> => await invoke('useSongArtworkFromUniqueSongPKG', pkgIndex),
  // verifyPackageEncryptionStatus: async (packageDetails: RPCS3SongPackagesObjectExtra): ReturnType<typeof verifyPackageEncryptionStatus> => await invoke('verifyPackageEncryptionStatus', packageDetails),
} as const
