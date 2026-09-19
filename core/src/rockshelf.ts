import { optimizer } from '@electron-toolkit/utils'
import chalk from 'chalk'
import { BrowserWindow, type IpcMainInvokeEvent, app } from 'electron'
import type { Promisable } from 'type-fest'

import { CLIAPI, type CreateWindowOptions, RichPresenceAPI, RockshelfFileSystemAPI, RockshelfProtocolAPI, RockshelfPythonServiceAPI, SongDownloadQueueAPI, addHandler, createWindow, windowClose, windowMaximize, windowMinimize, windowRestart } from './core.exports'
import { extractMOGGTracksFromSong, imgCropAndSaveToTemp, openConsoleWindow, openDir, openExternalURL, openImageToCrop, openRockshelfFSDir, rhythmverseFetchData, selectorDir, selectorPackageFiles, selectorPathToRB3File, selectorRB3File, selectorRPCS3Exe } from './handlers.exports'
import { dataSync, temps } from './init'
import type { ImageCropOptions } from './lib/rbtools'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>
export type InitHandlersArray = [string, HandlerFnType][]

/**
 * A Rock Band 3 Deluxe song package manager for RPCS3 users.
 */
export class Rockshelf {
	static readonly handlers: InitHandlersArray = [
		['win.close', windowClose],
		['win.maximize', windowMaximize],
		['win.minimize', windowMinimize],
		['win.restart', windowRestart],

		['open.consoleWindow', openConsoleWindow],
		['open.dir', openDir],
		['open.externalURL', openExternalURL],
		['open.fsDir', openRockshelfFSDir],
		['open.imageToCrop', openImageToCrop],

		['selector.rpcs3exe', selectorRPCS3Exe],
		['selector.dir', selectorDir],
		['selector.rb3File', selectorRB3File],
		['selector.packageFiles', selectorPackageFiles],
		['selector.pathToRB3File', selectorPathToRB3File],

		['rhythmverse.fetchData', rhythmverseFetchData],

		['img.cropAndSaveToTemp', (_, __, srcFile: string, options?: ImageCropOptions) => imgCropAndSaveToTemp(srcFile, options)],

		['audio.extractMOGGTracksFromSong', extractMOGGTracksFromSong],
	]

	/**
	 * Initiates all application handlers that's not tied to an API in specific.
	 * - - - -
	 * @returns {void}
	 */
	static initHandlers(): void {
		for (const [channel, listeners] of Rockshelf.handlers) addHandler(channel, listeners)
	}

	/**
	 * Initializes Rockshelf.
	 * - - - -
	 * @param {CreateWindowOptions} options Required arguments to start the application.
	 * @returns {Promise<void>}
	 */
	static async init(options: CreateWindowOptions): Promise<void> {
		chalk.level = 3
		RockshelfProtocolAPI.initProtocolPrivileges()
		await RockshelfFileSystemAPI.init(app)
		RockshelfProtocolAPI.init()

		await app.whenReady()
		await RockshelfPythonServiceAPI.init()
		if (options.argv.length > 1) return void CLIAPI.init(options.argv)

		app.on('window-all-closed', () => {
			dataSync.savePackagesDataCacheSync()
			temps.cleanTempFilesSync()
			if (process.platform !== 'darwin') {
				app.quit()
			}
		})

		app.on('browser-window-created', (event, window) => {
			optimizer.watchWindowShortcuts(window)
		})

		void RichPresenceAPI.init()
		SongDownloadQueueAPI.init()
		Rockshelf.initHandlers()
		createWindow(options)

		app.on('activate', function (event, hasVisibleWindows) {
			if (BrowserWindow.getAllWindows().length === 0) createWindow(options)
		})
	}
}
