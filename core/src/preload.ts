import { type IpcRenderer, type IpcRendererEvent, ipcRenderer, webUtils } from 'electron'
import type { FilePathJSONRepresentation } from 'node-lib'
import type { Promisable } from 'type-fest'

import type { BuzyLoadErrorObject, BuzyLoadInitObject, BuzyLoadScreenSenderObject, BuzyLoadSubtextObject, CreatePackageOptions, DatabaseSearchFnResults, DeluxeInstallationOptions, DeluxeInstalledData, DialogScreenPromptsTypes, EditPackageOptions, EncDecPackageFunctionTypes, ErrorHandlerObject, InitialStateObject, LightRB3SongPackagesData, LightRB3SongPackagesDataObject, MessageBoxObject, QuickConfigType, RB3SongPackagesData, RhythmverseDownloadSongOptions, RhythmverseSongDownloadJSONRepresentation, RockBand3Data, UserConfigObject, UserConfigReadObject } from './core.exports'
import type { LoadImageForCropReturnObject, RhythmverseDataFetchingTypes, RockshelfFileSystemAPItemCommand, SelectPackageFilesStatsTypes, SelectorPathToRB3FileExportTypes, selectorDir, selectorPackageFiles, selectorPathToRB3File, selectorRB3File, selectorRPCS3Exe } from './handlers.exports'
import type { CreateRB3FileOptions, RB3FileExtractionOptions, SongPackagesFilterGenericObject, SongPackagesFilterOptions, SongPackagesFilterTypes } from './lib.exports'
import type { GoCentralLeaderboardResultObject, ImageCropOptions, InstrumentScoreData, MOGGTracksExtractorOptions, ParsedRB3SaveData, ProcessedRhythmverseObject, RhythmverseFetchingOptions, ScoreDataInstrumentTypes } from './lib/rbtools'
import type { DTAFilterByArtistObject, DTAFilterByDifficultyObject, DTAFilterGenericObject, DTAFilterOptions, DTAFilterTypes, RB3CompatibleDTAFile } from './lib/rbtools/lib.exports'

const invoke = ipcRenderer.invoke.bind(ipcRenderer)
const on = ipcRenderer.on.bind(ipcRenderer)
const send = ipcRenderer.send.bind(ipcRenderer)

export type OnBuzyLoadCallback = (event: IpcRendererEvent, func: BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject | BuzyLoadSubtextObject) => void
export type OnDialogScreenCallback = (event: IpcRendererEvent, code: DialogScreenPromptsTypes) => Promisable<any>
export type OnLocaleRequestCallback = (event: IpcRendererEvent, uuid: string, key: string, messageValues?: Record<string, string | number>) => void
export type OnMessageCallback = (event: IpcRendererEvent, message: MessageBoxObject) => Promisable<any>
export type OnRendererConsoleCallback = (event: IpcRendererEvent, ...value: any[]) => Promisable<any>
export type OnErrorHandlerCallback = (event: IpcRendererEvent, error: ErrorHandlerObject) => Promisable<any>
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
	onError(callback: OnErrorHandlerCallback): IpcRenderer {
		return on('sendError', callback)
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
		installHighMemoryPatch: async (): Promise<void> => await invoke('DataSyncAPI/installHighMemoryPatch'),
		playRB3: async (): Promise<void> => await invoke('DataSyncAPI/playRB3'),

		deleteAllThumbnails: async (): Promise<void> => await invoke('DataSyncAPI/deleteAllThumbnails'),

		filterSongPackages: async (type: SongPackagesFilterTypes, options?: SongPackagesFilterOptions): Promise<SongPackagesFilterGenericObject> => await invoke('DataSyncAPI/filterSongPackages', type, options),
		filterSongsFromPackage: async (pkgIndex: number, type: DTAFilterTypes = 'title', options?: DTAFilterOptions): Promise<DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject> => await invoke('DataSyncAPI/filterSongsFromPackage', pkgIndex, type, options),

		search: async (searchField: string): Promise<DatabaseSearchFnResults> => await invoke('DataSyncAPI/search', searchField),
	},

	selector: {
		rpcs3Exe: async (): ReturnType<typeof selectorRPCS3Exe> => await invoke('selector.rpcs3exe'),
		dir: async (): ReturnType<typeof selectorDir> => await invoke('selector.dir'),
		rb3File: async (): ReturnType<typeof selectorRB3File> => await invoke('selector.rb3File'),
		packageFiles: async (files: SelectPackageFilesStatsTypes[]): ReturnType<typeof selectorPackageFiles> => await invoke('selector.packageFiles', files),
		pathToRB3File: async (exportType: SelectorPathToRB3FileExportTypes = 'package'): ReturnType<typeof selectorPathToRB3File> => await invoke('selector.pathToRB3File', exportType),
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
} as const
