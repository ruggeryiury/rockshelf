import { BrowserWindow, app } from 'electron'
import { DirPath, FilePath, type FilePathLikeTypes, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { platform } from 'node:os'
import { parse as parseYAML } from 'yaml'

import type { SongPackagesFilterTypes } from '../../lib.exports'
import type { ScoreDataInstrumentTypes } from '../../lib/rbtools'
import type { DTAFilterTypes } from '../../lib/rbtools/lib.exports'
import { addHandler } from '../electron/handler'
import { sendDialog } from '../electron/rendererSenders'
import type { RPCS3GamesYAML, RPCS3VirtualFSYAML } from './DataSyncAPI'
import { RockshelfFileSystemAPI } from './RockshelfFileSystemAPI'

export interface UserConfigObject {
	/**
	 * The path to the RPCS3 executable.
	 */
	rpcs3ExePath: string
	/**
	 * The instrument the player plays the most. Default when first saving the config file is `'band'`.
	 */
	mostPlayedInstrument: ScoreDataInstrumentTypes
	/**
	 * The difficulty the player plays the most. Default when first saving the config file is `3` (Expert).
	 */
	mostPlayedDifficulty: 0 | 1 | 2 | 3
	/**
	 * The sorting option for the song packages listing.
	 */
	packagesCatalogSortBy: SongPackagesFilterTypes
	/**
	 * The sorting option for the songs listing.
	 */
	songsCatalogSortBy: DTAFilterTypes
	/**
	 * If `true`, the RPCS3 instance launched by the application would open without GUI. Default when first saving the config file is `false`.
	 */
	rpcs3NoGUI: boolean
	/**
	 * The folder where Rockshelf will place downloadable content from Rhythmverse.
	 */
	downloadedContentDirPath: string
	/**
	 * The name of the downloadable content files.
	 */
	downloadedContentFileName: 'hash' | 'nameAndArtist'
}

export interface RPCS3VirtualFSObject {
	/**
	 * The path to the RPCS3 executable.
	 */
	rpcs3Exe: FilePath
	/**
	 * The path to the installed Rock Band 3 game.
	 */
	rb3Game: DirPath
	/**
	 * The path to the installed Rock Band 3 game EBOOT file.
	 */
	rb3GameEboot: FilePath
	/**
	 * The path to the `games.yml` file of the RPCS3 emulator.
	 */
	gamesPath: FilePath
	/**
	 * An object with the parsed content of the RPCS3's `games.yml` file.
	 */
	games: RPCS3GamesYAML
	/**
	 * The path to the `vfs.yml` file of the RPCS3 emulator.
	 */
	vfsPath: FilePath
	/**
	 * The path to the RPCS3 emulator files.
	 */
	emulatorDir: DirPath
	/**
	 * The path to the `dev_hdd0` folder used by the RPCS3 emulator.
	 */
	devhdd0: DirPath
}

export type UserConfigReadObject = UserConfigObject | 'firstTime' | 'corrupted'

export interface RPCS3ConfigDirPathValidatorObject extends Omit<RPCS3VirtualFSObject, 'rpcs3Exe'> {}

/**
 * This class settles an API for user data synchronization, reading and editing between the main and renderer processes.
 */
export class UserDataAPI {
	/**
	 * The reference of the user configuration stored in memory.
	 */
	userConfig?: UserConfigObject
	/**
	 * An object that paths from the virtual file system of the applcation.
	 */
	vfs?: RPCS3VirtualFSObject
	constructor() {}

	// #region Validators

	/**
	 * Checks if the user provided RPCS3 executable path is valid.
	 * - - - -
	 * @param {FilePathLikeTypes} rpcs3ExePath The path to the RPCS3 executable to be validated.
	 * @returns {FilePath}
	 */
	static isValidRPCS3ExePath(rpcs3ExePath: FilePathLikeTypes): FilePath {
		const rpcs3Exe = pathLikeToFilePath(rpcs3ExePath)
		if (!rpcs3Exe.exists) throw new Error(`RPCS3 ${platform() === 'win32' ? 'Executable' : 'AppImage executable'} not found.`)

		if (platform() === 'win32') {
			// Windows specific
			const games = rpcs3Exe.gotoFile('config/games.yml')
			if (!games.exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required configuration file "config/games.yml".`)
		} else {
			// Linux specific
			const games = pathLikeToDirPath(app.getPath('userData')).gotoFile('config/games.yml')
			if (!games.exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required configuration file "config/games.yml".`)
		}

		return rpcs3Exe
	}

	/**
	 * Validates the whole RPCS3 virtual file system and returns an object with resolved paths to the main RPCS3 folders and files.
	 * @param {UserConfigObject} data An object with the user configuration values.
	 * @returns {Promise<RPCS3VirtualFSObject>}
	 */
	async validateVirtualFileSystem(data: UserConfigObject): Promise<RPCS3VirtualFSObject> {
		const rpcs3Exe = pathLikeToFilePath(data.rpcs3ExePath)
		if (!rpcs3Exe.exists) throw new Error(`RPCS3 ${platform() === 'win32' ? 'Executable' : 'AppImage executable'} not found.`)

		if (platform() === 'win32') {
			// Windows specific
			const games = rpcs3Exe.gotoFile('config/games.yml')
			if (!games.exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required configuration file "config/games.yml".`)
		} else {
			// Linux specific
			const games = pathLikeToDirPath(app.getPath('userData')).gotoFile('config/games.yml')
			if (!games.exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required configuration file "config/games.yml".`)
		}

		const linuxConfig = pathLikeToDirPath(app.getPath('userData'))
		const configDir = pathLikeToDirPath(platform() === 'win32' ? rpcs3Exe.gotoDir('config') : linuxConfig.gotoDir('rpcs3'))

		const gamesPath = configDir.gotoFile('games.yml')
		if (!gamesPath.exists) throw new Error('RPCS3 Game list YML file not found.')

		const vfsPath = configDir.gotoFile('vfs.yml')
		const games = parseYAML(await gamesPath.read('utf-8')) as RPCS3GamesYAML
		if (!games.BLUS30463) throw new Error('Rock Band 3 is not set as a visible game on the RPCS3 game list.')
		const rb3Game = DirPath.of(games.BLUS30463)
		if (!rb3Game.exists) throw new Error('Rock Band 3 game files not found.')
		const rb3GameEboot = rb3Game.gotoFile('PS3_GAME/USRDIR/EBOOT.BIN')
		if (!rb3GameEboot.exists) throw new Error('Rock Band 3 EBOOT file not found.')
		let devhdd0: DirPath

		if (vfsPath.exists) {
			const vfs = parseYAML(await vfsPath.read('utf-8')) as RPCS3VirtualFSYAML
			const emulatorDir = DirPath.of(vfs['$(EmulatorDir)'])

			devhdd0 = emulatorDir.gotoDir(vfs['/dev_hdd0/'].slice('$(EmulatorDir)'.length))
			if (devhdd0.exists) throw new Error('RPCS3 DEVHDD0 not found.')

			return {
				rpcs3Exe,
				rb3Game,
				rb3GameEboot,
				gamesPath,
				games,
				vfsPath,
				emulatorDir,
				devhdd0,
			}
		}

		const emulatorDir = platform() === 'win32' ? configDir.gotoDir('../') : configDir

		devhdd0 = emulatorDir.gotoDir('dev_hdd0')
		if (!devhdd0.exists) throw new Error('RPCS3 DEVHDD0 not found.')

		return {
			rpcs3Exe,
			rb3Game,
			rb3GameEboot,
			gamesPath,
			games,
			vfsPath,
			emulatorDir,
			devhdd0,
		}
	}

	// #region Handlers

	/**
	 * Reads the user configuration from the file system or application memory (if available) and validates the RPCS3 virtual file system.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @returns {Promise<UserConfigReadObject>}
	 */
	readUserConfig = async (win: BrowserWindow): Promise<UserConfigReadObject> => {
		const userConfigFile = RockshelfFileSystemAPI.userConfigFile()
		if (this.userConfig) {
			if (!userConfigFile.exists) await this.saveUserConfig(win, this.userConfig)
			return this.userConfig
		}

		if (!userConfigFile.exists) return 'firstTime'

		const data = await userConfigFile.readJSON<UserConfigObject>()

		try {
			const vfsData = await this.validateVirtualFileSystem(data)
			this.vfs = vfsData
		} catch (err) {
			return 'corrupted'
		}

		this.userConfig = data
		return data
	}

	/**
	 * Asynchronously saves the user configuration on disk and returns the updated user configuraton object.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {Partial<UserConfigObject> | undefined} newConfig An object with values to replace old/default values from the user configuration.
	 * @returns {Promise<UserConfigObject>}
	 */
	saveUserConfig = async (win: BrowserWindow, newConfig?: Partial<UserConfigObject>): Promise<UserConfigObject> => {
		const userConfigFilePath = RockshelfFileSystemAPI.userConfigFile()

		const newData = {
			rpcs3ExePath: '',
			mostPlayedInstrument: 'band',
			mostPlayedDifficulty: 3,
			packagesCatalogSortBy: 'name',
			songsCatalogSortBy: 'title',
			rpcs3NoGUI: false,
			downloadedContentDirPath: DirPath.of(app.getPath('documents')).gotoDir('DownloadedContent').path,
			downloadedContentFileName: 'hash',
			...this.userConfig,
			...newConfig,
		} satisfies UserConfigObject

		this.userConfig = newData
		if (newConfig?.rpcs3ExePath) {
			try {
				const vfsData = await this.validateVirtualFileSystem(newData)
				this.vfs = vfsData
			} catch (err) {
				sendDialog(win, 'corruptedUserConfig')
				return this.userConfig
			}
		}
		await userConfigFilePath.write(JSON.stringify(newData, null, 2))

		return newData
	}

	/**
	 * Deletes the user configuration file from the disk.
	 */
	deleteUserConfig = async (): Promise<void> => {
		const userConfigFile = RockshelfFileSystemAPI.userConfigFile()
		if (userConfigFile.exists) await userConfigFile.delete()
	}

	// #region Init

	/**
	 * Initializes the `UserDataAPI` class and all its handlers, returning the instantiated class.
	 * - - - -
	 * @returns {UserDataAPI}
	 */
	static init(): UserDataAPI {
		const userData = new UserDataAPI()

		addHandler('UserDataAPI/read', async (win) => await userData.readUserConfig(win))
		addHandler('UserDataAPI/save', async (win, __, newConfig?: Partial<UserConfigObject>) => userData.saveUserConfig(win, newConfig))
		addHandler('UserDataAPI/delete', userData.deleteUserConfig)

		return userData
	}
}
