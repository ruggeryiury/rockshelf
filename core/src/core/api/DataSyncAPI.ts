import axios from 'axios'
import { BrowserWindow } from 'electron'
import { DirPath, FilePath, MyObject, createHashFromBuffer, getReadableBytesSize, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { exec } from 'node:child_process'
import type { ReadStream } from 'node:fs'
import { platform } from 'node:os'
import { temporaryDirectory, temporaryFile } from 'tempy'
import unzipper from 'unzipper'

import { type CreateRB3FileOptions, type EditPackageDataOptions, type ParsedRSPackImageObject, type RB3FileExtractionOptions, type RSPackImagePackageCategoryNumbers, type RSPackImageSourceValues, type SongPackagesFilterGenericObject, type SongPackagesFilterOptions, type SongPackagesFilterTypes, createRB3FileFromRPCS3PackageFolder, createRSPackImage, editRSPackImage, extractPackagesForRPCS3, extractRB3FileToRPCS3, filterSongPackagesByName, filterSongPackagesByOfficialPkg, filterSongPackagesByUserCategory, genRPCS3SongPackageManifest, isJPEGRockshelfPackImage, isValidFolderName, parseRSPackImageFile, rsPackImage } from '../../lib.exports'
import { DTAParser, EDATFile, GoCentralAPI, type GoCentralLeaderboardResultObject, type InstrumentScoreData, MIDIFile, MOGGFile, type ParsedRB3SaveData, RB3SaveData, RBTools, type ScoreDataInstrumentTypes, TextureFile } from '../../lib/rbtools'
import { type DTAFilterByArtistObject, type DTAFilterByDifficultyObject, type DTAFilterGenericObject, type DTAFilterOptions, type DTAFilterTypes, type OfficialSongPackageStats, type RB3CompatibleDTAFile, type RPCS3ExtractionOptions, filterDTAByArtist, filterDTAByDecade, filterDTAByGenre, filterDTAByInstrumentDifficulty, filterDTABySongRating, filterDTAByTitle, filterDTAByYearReleased, getOfficialSongPackageStatsFromHash, isRB3FolderNameFreeOnRPCS3, officialPackages } from '../../lib/rbtools/lib.exports'
import { addHandler } from '../electron/handler'
import { sendBuzyLoad, sendDialog, sendMessageBox } from '../electron/rendererSenders'
import { RockshelfFileSystemAPI } from './RockshelfFileSystemAPI'
import { type DeluxeInstalledData, RockshelfGitHubAPI } from './RockshelfGitHubAPI'
import { RockshelfProtocolAPI } from './RockshelfProtocolAPI'
import type { UserDataAPI } from './UserDataAPI'

// #region Types

export interface RB3SongPackagesDataObject {
	/**
	 * The folder name of the song package.
	 */
	name: string
	/**
	 * The path to the song package folder name.
	 */
	path: string
	/**
	 * The source of the package thumbnail file
	 */
	thumbnailSrc: string
	/**
	 * The game where the song package is installed.
	 */
	packageType: 'rb3' | 'rb1'
	/**
	 * The path to the song package DTA file.
	 */
	dtaFilePath: string
	/**
	 * The size of the song package.
	 */
	packageSize: number
	/**
	 * The amount of songs available on the song package.
	 */
	songsCount: number
	/**
	 * A 16-bytes hash used to decrypt the song package's EDAT files.
	 */
	devklic: string
	/**
	 * A SHA256 hash of the song package contents.
	 */
	contentsHash: string
	/**
	 * An array with parsed songs objects of the song package.
	 */
	songs: RB3CompatibleDTAFile[]
	/**
	 * An object with values that will be used exclusively on Rockshelf.
	 */
	packageData: ParsedRSPackImageObject
	/**
	 * An object with known properties of the official song package where the installed song package belongs to. The value might be `undefined` if the song package contents hash does not match any official song package contents hash.
	 */
	official?: OfficialSongPackageStats
}

export interface LightRB3SongPackagesDataObject extends Omit<RB3SongPackagesDataObject, 'songs'> {}

export interface RB3SongPackagesData {
	/**
	 * An object with the amount of songs installed for specific categories.
	 */
	songsCount: {
		/**
		 * The amount of songs from Rock Band 3 (always 83).
		 */
		rb3: 83
		/**
		 * The amount of songs from packages installed on the Rock Band 1 DLC folder.
		 */
		rb1Pkgs: number
		/**
		 * The amount of songs from packages installed on the Rock Band 3 DLC folder.
		 */
		rb3Pkgs: number
		/**
		 * The amount of songs installed by all packages.
		 */
		all: number
		/**
		 * The amount of songs installed by all packages plus the on-disc songs from Rock Band 3.
		 */
		allPlusRB3: number
	}
	/**
	 * An object with the amount of song packaghes installed for specific categories.
	 */
	packagesCount: {
		/**
		 * The amount of song packages installed on the Rock Band 1 DLC folder.
		 */
		rb1Pkgs: number
		/**
		 * The amount of song packages installed on the Rock Band 3 DLC folder.
		 */
		rb3Pkgs: number
		/**
		 * The amount of song packages installed.
		 */
		all: number
		/**
		 * The amount of song packages installed plus one.
		 */
		allPlusRB3: number
	}
	/**
	 * The amount of stars that can be earned from all songs.
	 */
	starsCount: number
	/**
	 * The size in bytes of all song packages combined.
	 */
	allPackagesSize: number
	/**
	 * An array with objects that represents an installed song package and its properties.
	 */
	packages: RB3SongPackagesDataObject[]
	/**
	 * An array with paths to packages where the DTA parsing process went wrong
	 */
	parsingErrors: string[]
}

export interface LightRB3SongPackagesData extends Omit<RB3SongPackagesData, 'packages'> {
	/**
	 * An array with objects that represents an installed song package and its properties.
	 */
	packages: LightRB3SongPackagesDataObject[]
}

export interface RockBand3Data {
	/**
	 * Your profile name on the PS3 system. The value is `null` when no username home folder's found on the RPCS3's `dev_hdd0` folder.
	 */
	userName: string | null
	/**
	 * The path to the Rock Band 3 game files. The value is `null` when the game is not installed and recognized on RPCS3.
	 */
	path: string | null
	/**
	 * The title of the game (always `"Rock Band 3"`)
	 */
	gameName: string
	/**
	 * The serial number of the game (always `"BLUS30463"`)
	 */
	gameSerial: string
	/**
	 * The path where you save game data can be found.
	 */
	saveDataPath: string
	/**
	 * True if Rock Band 3 is installed and recognized on RPCS3, otherwise false.
	 */
	hasGameInstalled: boolean
	/**
	 * True if the save game data is found on the `dev_hdd0` folder, otherwise false.
	 */
	hasSaveData: boolean
	/**
	 * True if it has installed any type of update patches, otherwise false.
	 */
	hasUpdate: boolean
	/**
	 * True if the installed patch update is from Rock Band 3 Deluxe, otherwise false.
	 */
	hasDeluxe: boolean
	/**
	 * The type of the update installed on Rock Band 3. Default is `"none"`.
	 */
	updateType: 'none' | 'dx' | 'tu5'
	/**
	 * The hash of the Rock Band 3 Deluxe develop commit the user has installed.
	 */
	deluxeVersionHash: string | null
	/**
	 * True if it has the teleport glitch patch installed, otherwise false.
	 */
	hasTeleportGlitchPatch: boolean
	/**
	 * True if it has the high memory patch installed, otherwise false
	 */
	hasHighMemoryPatch: boolean
	// /**
	//  * An array with folders where all the song packages are installed.
	//  */
	// contents: string[]
}

export interface RPCS3GamesYAML {
	/**
	 * Rock Band 3 (USA).
	 */
	BLUS30463?: string
}

export interface RPCS3VirtualFSYAML {
	'$(EmulatorDir)': string
	'/dev_hdd0/': string
	'/dev_hdd1/': string
	'/dev_flash/': string
	'/dev_flash2/': string
	'/dev_flash3/': string
	'/bdvd/': string
	'/games/': string
	'/app_home/': string
}

export interface InitialStateObject {
	rb3Stats: RockBand3Data
	saveData: ParsedRB3SaveData | false
	instrumentScores: InstrumentScoreData | false
	installedDeluxeData: false | DeluxeInstalledData
	packages: LightRB3SongPackagesData
}

export interface DeluxeInstallationOptions {
	/**
	 * The short SHA1 of the latest Deluxe version that will be installed.
	 */
	latestVersionHash: string
	/**
	 * The type of the Deluxe distribution you want to install
	 */
	type: 'standard' | 'customCharacters'
}

export interface CreatePackageOptions {
	/**
	 * An array with file path to song package files that will be installed on the song package.
	 */
	packages: string[]
	/**
	 * The display name of the song package.
	 */
	packageName: string
	/**
	 * The name of the song package folder.
	 */
	packageFolderName: string
	/**
	 * Forces the song package encryption/decryption of the song files.
	 */
	forceEncryption: NonNullable<RPCS3ExtractionOptions['forceEncryption']>
	/**
	 * The name of the temporary PNG file that will be embedded as the package thumbnail file.
	 */
	thumbnail: string | null
	/**
	 * An array with internal songnames that will be selected to be installed.
	 */
	selectedSongs?: string[]
	/**
	 * The user category for the new song package.
	 */
	category?: RSPackImagePackageCategoryNumbers
}

export type EditPackageOptions = EditPackageDataOptions & {
	/**
	 * The new folder name for the song package.
	 */
	packageFolderName?: string
}

export interface DatabaseSearchFnResults {
	/**
	 * The amount of packages where matched cases were found.
	 */
	pkgCount: number
	/**
	 * The amount of songs where the matched cases were found.
	 */
	songsCount: number
	headers: {
		/**
		 * The index of the package.
		 */
		pkgIndex: number
		songs: {
			/**
			 * The index of the song.
			 */
			songIndex: number
			/**
			 * An object with parsed metadata of the song.
			 */
			songData: RB3CompatibleDTAFile
			/**
			 * The fields where the matched cases were found on.
			 */
			operator: 'name' | 'artist' | 'both'
		}[]
	}[]
}

export type EncDecPackageFunctionTypes = 'encryptAll' | 'decryptAll'
export type QuickConfigType = 'minimum' | 'recommended' | 'potato'

/**
 * This class settles an API for song package data synchronization, reading and editing between the main and renderer processes.
 */
export class DataSyncAPI {
	/**
	 * A property that directly references an instantiated `UserDataAPI` class used on the application to sync user data reading, saving and editing.
	 */
	userData: UserDataAPI
	/**
	 * An object that acts as a memory storage for the user's song package data cache.
	 */
	packagesData?: RB3SongPackagesData

	constructor(userData: UserDataAPI) {
		this.userData = userData
	}

	// #region Class Methods

	/**
	 * Asynchronously saves the user song package data stored in memory into the song package cache file.
	 */
	async savePackagesDataCache(): Promise<void> {
		if (this.packagesData) {
			const packagesCacheFile = RockshelfFileSystemAPI.packagesCacheFile()
			await packagesCacheFile.write(JSON.stringify(this.packagesData))
		}
	}

	/**
	 * Synchronously saves the user song package data stored in memory into the song package cache file.
	 */
	savePackagesDataCacheSync(): void {
		if (this.packagesData) {
			const packagesCacheFile = RockshelfFileSystemAPI.packagesCacheFile()
			packagesCacheFile.writeSync(JSON.stringify(this.packagesData))
		}
	}

	/**
	 * Returns the user's song package cache data object, that might be read through the song package cache file, or simply returns the song package cache stored in memory.
	 * - - - -
	 * @param {boolean} [reloadCache] `OPTIONAL` Forces the process to remake the song package cache file, even if the cache is found stored in memory. Default is `false`.
	 * @returns {Promise<RB3SongPackagesData>}
	 */
	async readPackagesDataCache(reloadCache: boolean = false): Promise<RB3SongPackagesData> {
		const packagesCacheFile = RockshelfFileSystemAPI.packagesCacheFile()
		if (this.packagesData) {
			if (reloadCache) await this.getSongPackagesData()
			if (!packagesCacheFile.exists) await this.savePackagesDataCache()
			return this.packagesData
		}
		if (!packagesCacheFile.exists) {
			await this.getSongPackagesData()
			await this.savePackagesDataCache()
			return this.packagesData!
		} else {
			if (reloadCache) {
				await this.getSongPackagesData()
				return this.packagesData!
			} else {
				this.packagesData = await packagesCacheFile.readJSON<RB3SongPackagesData>()
				return this.packagesData
			}
		}
	}

	/**
	 * Creates a `LightRB3SongPackagesData` object from a `RB3SongPackagesData` (song package cache data object stored in memory) object.
	 *
	 * This API reduces the application's loading time by send a lighter song package data object, returning the actual intense song data for each package through another process.
	 * - - - -
	 * @param {RB3SongPackagesData} data The song package cache data object stored in memory.
	 * @returns {LightRB3SongPackagesData}
	 */
	createLightSongPackagesCache(data: RB3SongPackagesData): LightRB3SongPackagesData {
		return {
			...data,
			packages: data.packages.map((val) => {
				return { ...val, songs: undefined } as LightRB3SongPackagesDataObject
			}),
		}
	}

	// #region Package Methods

	/**
	 * Creates a new song package on the Rock Band 3 DLC folder and returns an updated song package data object for the renderer.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {CreatePackageOptions} options An object with values that settles the package creation process.
	 * @returns {Promise<false | LightRB3SongPackagesData>}
	 */
	async createPackage(win: BrowserWindow, options: CreatePackageOptions): Promise<false | LightRB3SongPackagesData> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		if (!this.packagesData) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}

		const devhdd0 = this.userData.vfs.devhdd0
		const { packageFolderName, forceEncryption, packages, thumbnail, packageName, selectedSongs, category } = options

		sendBuzyLoad(win, { code: 'init', title: 'creatingNewPackage', steps: ['validatingPackageFolderName', 'extractingPackageFiles', 'processingPackageFiles', 'exportingNewDTAFile', 'movingFilesToNewPackageFolder', 'creatingPackageImage', 'updatingInstalledPackagesData'], onCompleted: ['resetCreateNewPackageScreenState'] })

		const packageFolder = RockshelfFileSystemAPI.rb3UsrDir(devhdd0).gotoDir(packageFolderName)
		const folderNameTestResults = isValidFolderName(packageFolderName)

		if (typeof folderNameTestResults === 'string') {
			sendBuzyLoad(win, {
				code: 'throwError',
				key: `errorCreateNewPackage${folderNameTestResults.charAt(0).toUpperCase()}${folderNameTestResults.slice(1)}`,
				messageValues: { packageFolderName },
			})
			return false
		}

		if (packageFolderName.length > 42) {
			sendBuzyLoad(win, {
				code: 'throwError',
				key: 'errorCreateNewPackageFolderNameTooBig',
				messageValues: { packageFolderName },
			})
			return false
		}

		const isPackageFolderNameAvailable = await isRB3FolderNameFreeOnRPCS3(devhdd0, packageFolderName)

		if (!isPackageFolderNameAvailable) {
			let errorType: 'restrictedFolderName' | 'folderNameInUse'
			if (officialPackages.map((pack) => pack.folderName).includes(packageFolderName)) errorType = 'restrictedFolderName'
			else errorType = 'folderNameInUse'

			sendBuzyLoad(win, {
				code: 'throwError',
				key: errorType === 'folderNameInUse' ? 'errorCreateNewPackageFolderNameInUse' : 'errorCreateNewPackageRestrictedFolderName',
				messageValues: { packageFolderName },
			})
			return false
		}

		sendBuzyLoad(win, { code: 'incrementStep' })

		try {
			const results = await extractPackagesForRPCS3(win, packages, devhdd0, packageFolderName, { forceEncryption, songs: selectedSongs })
			if (!results) throw new Error()

			sendBuzyLoad(win, { code: 'incrementStep' })
			let packageSource: RSPackImageSourceValues
			if (packages.length === 1) {
				const packagePath = pathLikeToFilePath(packages[0])
				if (packagePath.ext === '.pkg') packageSource = 'pkg'
				else if (packagePath.ext === '.rb3') packageSource = 'rb3'
				else packageSource = 'stfs'
			} else packageSource = 'merged'

			const packageArtworkData = await createRSPackImage(thumbnail !== null ? RockshelfProtocolAPI.tempProtocolToPath(thumbnail) : RockshelfProtocolAPI.rbiconsToPath('rbicons://custom').gotoFile('custom.jpg'), packageFolder.gotoFile('folder.jpg'), { packageName, type: 'rockshelf', source: packageSource, encryptionStatus: forceEncryption === 'enabled' ? 'encrypted' : 'decrypted', category: rsPackImage.packageCategory[category ?? 0] })
			sendBuzyLoad(win, { code: 'incrementStep' })

			const devklic = EDATFile.genDevKLicHash(packageFolder.name)
			const { manifest, packageSize } = await genRPCS3SongPackageManifest(packageFolder)
			const contentsHash = createHashFromBuffer(Buffer.from(manifest))

			this.packagesData.packages.push({
				name: packageFolder.name,
				path: packageFolder.path,
				thumbnailSrc: `rb3packimg://${encodeURIComponent(packageFolder.name)}`,
				packageType: 'rb3',
				dtaFilePath: packageFolder.gotoFile('songs/songs.dta').path,
				packageSize,
				songsCount: results.songs.length,
				devklic,
				contentsHash,
				songs: [...results.songs],
				packageData: packageArtworkData.header,
			})
			this.packagesData.allPackagesSize += packageSize
			this.packagesData.packagesCount.all++
			this.packagesData.packagesCount.allPlusRB3++
			this.packagesData.packagesCount.rb3Pkgs++
			this.packagesData.songsCount.all += results.songs.length
			this.packagesData.songsCount.allPlusRB3 += results.songs.length
			this.packagesData.songsCount.rb3Pkgs += results.songs.length
			this.packagesData.starsCount = (this.packagesData.starsCount / 5 + results.songs.length) * 5

			sendBuzyLoad(win, { code: 'callSuccess' })

			return this.createLightSongPackagesCache(await this.readPackagesDataCache())
		} catch (err) {
			if (packageFolder.exists) await packageFolder.deleteDir(true)
			throw err
		}
	}

	/**
	 * Deletes a song package and all its files and returns an updated song package data object for the renderer.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {number} pkgIndex The song package index (relative to the song package cache) to be deleted.
	 * @returns {Promise<false | LightRB3SongPackagesData>}
	 */
	async deletePackage(win: BrowserWindow, pkgIndex: number): Promise<false | LightRB3SongPackagesData> {
		if (!this.packagesData || !this.packagesData.packages[pkgIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}
		const { path, packageSize, packageType, songsCount, packageData } = this.packagesData.packages[pkgIndex]
		const pkgPath = DirPath.of(path)

		if (!pkgPath.exists) {
			sendMessageBox(win, { type: 'error', code: 'deletePackagePackageNotFound' })
			return false
		}

		sendMessageBox(win, { type: 'loading', code: 'deletePackageDeleting', messageValues: { pkgName: packageData.packageName, pkgPath: pkgPath.path } })
		await pkgPath.deleteDir(true)

		this.packagesData.packages.splice(pkgIndex, 1)
		this.packagesData.allPackagesSize -= packageSize
		this.packagesData.packagesCount.all--
		this.packagesData.packagesCount.allPlusRB3--
		this.packagesData.songsCount.all -= songsCount
		this.packagesData.songsCount.allPlusRB3 -= songsCount

		if (packageType === 'rb1') {
			this.packagesData.packagesCount.rb1Pkgs--
			this.packagesData.songsCount.rb1Pkgs -= songsCount
		} else {
			this.packagesData.packagesCount.rb3Pkgs--
			this.packagesData.songsCount.rb3Pkgs -= songsCount
		}

		return this.createLightSongPackagesCache(await this.readPackagesDataCache())
	}

	/**
	 * Edits a song package data and returns an updated song package data object for the renderer.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {number} pkgIndex The song package index (relative to the song package cache) to be edited.
	 * @param {EditPackageOptions} options An object with values that changes the song package data.
	 * @returns {Promise<false | LightRB3SongPackagesData>}
	 */
	async editPackage(win: BrowserWindow, pkgIndex: number, options: EditPackageOptions): Promise<false | LightRB3SongPackagesData> {
		if (!this.packagesData || !this.packagesData.packages[pkgIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}
		const { path } = this.packagesData.packages[pkgIndex]
		const pkgPath = DirPath.of(path)

		if (!pkgPath.exists) {
			sendMessageBox(win, { type: 'error', code: 'editPackageDataPackageNotFound' })
			return false
		}

		const thumbnail = pkgPath.gotoFile('folder.jpg')
		await editRSPackImage(thumbnail, options)

		if (options.packageName) this.packagesData.packages[pkgIndex].packageData.packageName = options.packageName
		if (options.encryptionStatus) this.packagesData.packages[pkgIndex].packageData.encryptionStatus = options.encryptionStatus
		if (options.category) this.packagesData.packages[pkgIndex].packageData.category = options.category

		if (options.packageFolderName) {
			const oldPKGPath = DirPath.of(path)
			const folderNameTestResults = isValidFolderName(options.packageFolderName)
			if (typeof folderNameTestResults === 'string') {
				sendMessageBox(win, { type: 'error', code: `createNewPackage${folderNameTestResults.charAt(0).toUpperCase()}${folderNameTestResults.slice(1)}`, messageValues: { packageFolderName: options.packageFolderName } })
				return false
			}
			if (options.packageFolderName.length > 42) {
				sendMessageBox(win, { type: 'error', code: `createNewPackageFolderNameTooBig`, messageValues: { packageFolderName: options.packageFolderName } })
				return false
			}
			const isPackageFolderNameAvailable = await isRB3FolderNameFreeOnRPCS3(oldPKGPath.gotoDir('../../../../'), options.packageFolderName)

			if (!isPackageFolderNameAvailable) {
				let errorType: 'restrictedFolderName' | 'folderNameInUse'
				if (officialPackages.map((pack) => pack.folderName).includes(options.packageFolderName)) errorType = 'restrictedFolderName'
				else errorType = 'folderNameInUse'
				sendMessageBox(win, { type: 'error', code: `createNewPackage${errorType === 'folderNameInUse' ? 'FolderNameInUse' : 'RestrictedFolderName'}`, messageValues: { packageFolderName: options.packageFolderName } })
				return false
			}

			let newPKGPath: DirPath

			try {
				newPKGPath = await oldPKGPath.renameDir(oldPKGPath.changeDirName(options.packageFolderName))
			} catch (err) {
				if (err instanceof Error && err.message.includes('EPERM: operation not permitted')) sendMessageBox(win, { type: 'error', code: 'changeFolderNamePermissionDenied', timeout: 5000 })
				return false
			}

			this.packagesData.packages[pkgIndex].path = newPKGPath.path
			this.packagesData.packages[pkgIndex].name = newPKGPath.name
			this.packagesData.packages[pkgIndex].devklic = EDATFile.genDevKLicHash(newPKGPath.name)
			this.packagesData.packages[pkgIndex].dtaFilePath = newPKGPath.gotoFile('songs/songs.dta').path
			this.packagesData.packages[pkgIndex].thumbnailSrc = `rb3packimg://${encodeURIComponent(newPKGPath.name)}`
		}

		return this.createLightSongPackagesCache(await this.readPackagesDataCache())
	}

	/**
	 * Encrypts/Decrypts all song files from a specific song package and returns an updated song package data object for the renderer.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {number} pkgIndex The song package index (relative to the song package cache) to be edited.
	 * @param {EncDecPackageFunctionTypes} command The encryption/decryption command you want to be done.
	 * @returns {Promise<false | LightRB3SongPackagesData>}
	 */
	async encDecPackage(win: BrowserWindow, pkgIndex: number, command: EncDecPackageFunctionTypes): Promise<false | LightRB3SongPackagesData> {
		if (!this.packagesData || !this.packagesData.packages[pkgIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}
		const { path } = this.packagesData.packages[pkgIndex]
		const packagePath = DirPath.of(path)

		if (this.packagesData.packages[pkgIndex].packageData.encryptionStatus === 'encrypted' && command === 'encryptAll') {
			sendMessageBox(win, { type: 'info', code: 'encDecPackageIsAlreadyEncrypted', messageValues: { path: packagePath.path, name: this.packagesData.packages[pkgIndex].packageData.packageName } })
			return false
		} else if (this.packagesData.packages[pkgIndex].packageData.encryptionStatus === 'decrypted' && command === 'decryptAll') {
			sendMessageBox(win, { type: 'info', code: 'encDecPackageIsAlreadyDecrypted', messageValues: { path: packagePath.path, name: this.packagesData.packages[pkgIndex].packageData.packageName } })
			return false
		}

		if (!packagePath.exists) {
			sendMessageBox(win, { type: 'error', code: 'editPackageDataPackageNotFound' })
			return false
		}

		const files = (await packagePath.gotoDir('songs').readDir(true)).toReversed().filter((entry) => entry instanceof FilePath && (entry.ext === '.mogg' || entry.fullname.endsWith('.mid.edat'))) as FilePath[]

		if (command === 'encryptAll') sendBuzyLoad(win, { code: 'init', title: 'encryptingPackageFiles', steps: ['encryptingPackageFiles'] })
		else sendBuzyLoad(win, { code: 'init', title: 'decryptingPackageFiles', steps: ['decryptingPackageFiles'] })

		let count = 0
		for (const file of files) {
			if (file.ext === '.mogg') {
				const mogg = new MOGGFile(file)
				sendBuzyLoad(win, { code: 'subtext', key: `${command === 'encryptAll' ? 'encrypting' : 'decrypting'}MOGGTextWithCount`, messageValues: { name: mogg.path.fullname, count: count.toString(), total: files.length.toString() } })
				const isMOGGEncrypted = await mogg.isEncrypted()
				if ((isMOGGEncrypted && command === 'encryptAll') || (!isMOGGEncrypted && command === 'decryptAll')) {
					count++
					continue
				}

				const tempMOGG = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

				if (command === 'encryptAll') await mogg.encrypt(tempMOGG)
				else await mogg.decrypt(tempMOGG)

				await tempMOGG.copy(mogg.path, true)
				await tempMOGG.delete()
				count++
			} else {
				const edat = new EDATFile(file)
				sendBuzyLoad(win, { code: 'subtext', key: `${command === 'encryptAll' ? 'encrypting' : 'decrypting'}MIDITextWithCount`, messageValues: { name: edat.path.fullname, count: count.toString(), total: files.length.toString() } })
				const isEDATEncrypted = await edat.isEncrypted()
				if ((isEDATEncrypted && command === 'encryptAll') || (!isEDATEncrypted && command === 'decryptAll')) {
					count++
					continue
				}

				const tempEDAT = pathLikeToFilePath(temporaryFile({ name: edat.path.fullname }))
				const tempRoot = pathLikeToDirPath(tempEDAT.root)

				if (!tempRoot.exists) await tempRoot.mkDir(true)
				if (command === 'encryptAll') {
					const midi = new MIDIFile(file)
					const newEdat = await midi.encrypt({ packFolderName: this.packagesData.packages[pkgIndex].name, destPath: tempEDAT })
					await newEdat.path.copy(edat.path, true)
					await tempRoot.deleteDir(true)
				} else {
					const newMIDI = await edat.decrypt({ devKLicHash: this.packagesData.packages[pkgIndex].devklic, destPath: tempEDAT })
					await newMIDI.path.copy(edat.path, true)
					await tempRoot.deleteDir(true)
				}
				count++
			}
		}

		if (command === 'encryptAll') sendMessageBox(win, { type: 'success', code: 'encryptingPackageFiles' })
		else sendMessageBox(win, { type: 'success', code: 'decryptingPackageFiles' })

		const thumbnail = packagePath.gotoFile('folder.jpg')
		await editRSPackImage(thumbnail, { encryptionStatus: command === 'decryptAll' ? 'decrypted' : 'encrypted' })

		this.packagesData.packages[pkgIndex].packageData.encryptionStatus = command === 'decryptAll' ? 'decrypted' : 'encrypted'
		sendBuzyLoad(win, { code: 'callSuccess' })

		return this.createLightSongPackagesCache(await this.readPackagesDataCache())
	}

	/**
	 * Creates a Rock Band 3 Song Package file from an installed song package.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {string} packagePath The path to the song package to be exported.
	 * @param {string} destPath The destination path of the new Rock Band 3 Song Package file.
	 * @param {CreateRB3FileOptions | undefined} [options] `OPTIONAL` An object with values that tweaks the song package file creation process.
	 * @returns {Promise<void>}
	 */
	async exportPackage(win: BrowserWindow, packagePath: string, destPath: string, options?: CreateRB3FileOptions): Promise<void> {
		return await createRB3FileFromRPCS3PackageFolder(win, packagePath, destPath, options)
	}

	/**
	 * Merges one song package into another and returns an updated song package data object for the renderer.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {number} fromPackageIndex The song package index (relative to the song package cache) that will be merged and deleted.
	 * @param {number} toPackageIndex The song package index (relative to the song package cache) that will receive the merged song package.
	 * @returns {Promise<false | LightRB3SongPackagesData>}
	 */
	async mergePackages(win: BrowserWindow, fromPackageIndex: number, toPackageIndex: number): Promise<false | LightRB3SongPackagesData> {
		if (!this.packagesData || !this.packagesData.packages[fromPackageIndex] || !this.packagesData.packages[toPackageIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}

		const fromPackage = this.packagesData.packages[fromPackageIndex]
		const fromPackagePath = pathLikeToDirPath(fromPackage.path)
		const toPackage = this.packagesData.packages[toPackageIndex]
		const toPackagePath = pathLikeToDirPath(toPackage.path)

		if (fromPackage.packageData.encryptionStatus !== 'decrypted' || fromPackage.packageData.encryptionStatus !== 'decrypted') {
			sendMessageBox(win, { type: 'error', code: 'mergePackagesOnlyDecrypted' })
			return false
		}

		for (const songnames of fromPackage.songs.map((song) => song.songname)) {
			const genDir = toPackagePath.gotoDir(`songs/${songnames}/gen`)
			if (!genDir.exists) await genDir.mkDir(true)
		}

		const { packageFiles } = await genRPCS3SongPackageManifest(fromPackagePath)
		for (const file of packageFiles) {
			const oldFilePath = pathLikeToFilePath(file)
			const relativePath = oldFilePath.path.slice(pathLikeToFilePath(fromPackage.dtaFilePath).gotoDir('').path.length + 1)
			const newFilePath = toPackagePath.gotoFile(`songs/${relativePath}`)

			await oldFilePath.copy(newFilePath, true)
			await oldFilePath.delete()
		}

		const newMainDTA = new DTAParser([...toPackage.songs, ...fromPackage.songs])
		newMainDTA.sort('ID')
		await newMainDTA.export(toPackage.dtaFilePath)

		const { manifest, packageSize } = await genRPCS3SongPackageManifest(toPackage.path)
		const contentsHash = createHashFromBuffer(Buffer.from(manifest))
		const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)
		const packageUpdatedData = {
			name: toPackage.name,
			path: toPackage.path,
			thumbnailSrc: toPackage.thumbnailSrc,
			packageType: toPackage.packageType,
			dtaFilePath: toPackage.dtaFilePath,
			packageSize,
			songsCount: toPackage.songs.length + fromPackage.songs.length,
			devklic: toPackage.devklic,
			contentsHash,
			songs: newMainDTA.songs,
			packageData: toPackage.packageData,
			official,
		} as RB3SongPackagesDataObject

		this.packagesData.packagesCount.all--
		this.packagesData.packagesCount.allPlusRB3--
		this.packagesData.allPackagesSize = this.packagesData.allPackagesSize - toPackage.packageSize - fromPackage.packageSize + packageUpdatedData.packageSize

		if (packageUpdatedData.packageType === 'rb1') this.packagesData.packagesCount.rb1Pkgs--
		else this.packagesData.packagesCount.rb3Pkgs--

		this.packagesData.packages[toPackageIndex] = packageUpdatedData
		this.packagesData.packages.splice(fromPackageIndex, 1)
		if (fromPackagePath.exists) await fromPackagePath.deleteDir(true)

		return this.createLightSongPackagesCache(await this.readPackagesDataCache())
	}

	/**
	 * Installs a Rock Band 3 Song Package file and returns an updated song package data object for the renderer.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {string} rb3FilePath The path of the Rock Band 3 Song Package file to be installed.
	 * @param {RB3FileExtractionOptions | undefined} [options] `OPTIONAL` An object with values the tweaks the song package installation process.
	 * @returns {Promise<false | LightRB3SongPackagesData>}
	 */
	async installRB3File(win: BrowserWindow, rb3FilePath: string, options?: RB3FileExtractionOptions): Promise<false | LightRB3SongPackagesData> {
		if (!this.packagesData) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}
		const packageData = await extractRB3FileToRPCS3(win, rb3FilePath, options)
		if (packageData) {
			this.packagesData.packages.push(packageData)
			this.packagesData.allPackagesSize += packageData.packageSize
			this.packagesData.packagesCount.all++
			this.packagesData.packagesCount.allPlusRB3++
			this.packagesData.packagesCount.rb3Pkgs++
			this.packagesData.songsCount.all += packageData.songsCount
			this.packagesData.songsCount.allPlusRB3 += packageData.songsCount
			this.packagesData.songsCount.rb3Pkgs += packageData.songsCount
			this.packagesData.starsCount = (this.packagesData.starsCount / 5 + packageData.songsCount) * 5
		}

		return this.createLightSongPackagesCache(await this.readPackagesDataCache())
	}

	/**
	 * Deletes selected songs from a song package and returns an updated song package data object for the renderer.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {number} pkgIndex The song package index (relative to the song package cache) which the song will be deleted.
	 * @param {string[]} songs An array with internal songnames to be deleted from the song package.
	 * @returns {Promise<false | LightRB3SongPackagesData>}
	 */
	async deleteSongsFromPackage(win: BrowserWindow, pkgIndex: number, songs: string[]): Promise<false | LightRB3SongPackagesData> {
		if (!this.packagesData?.packages[pkgIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}
		const pkgPath = DirPath.of(this.packagesData.packages[pkgIndex].path)

		if (!pkgPath.exists) {
			sendMessageBox(win, { type: 'error', code: 'editPackageDataPackageNotFound' })
			return false
		}

		const dtaPath = pathLikeToFilePath(this.packagesData.packages[pkgIndex].dtaFilePath)
		const oldDTASize = (await dtaPath.stat()).size
		const parser = await DTAParser.fromFile(dtaPath)

		const firstSelectedSong = this.packagesData.packages[pkgIndex].songs.find((val) => val.songname === songs[0])
		if (songs.length === 1) {
			if (!firstSelectedSong) {
				sendMessageBox(win, { type: 'error', code: 'batchDeleteSongs' })
				return false
			}
			sendMessageBox(win, { type: 'loading', code: 'batchDeleteSongsIndividual', messageValues: { name: firstSelectedSong.name } })
		} else sendMessageBox(win, { type: 'loading', code: 'batchDeleteSongs', messageValues: { songsCount: songs.length } })

		let songsDeleted = 0
		for (const song of songs) {
			const songFolder = pkgPath.gotoDir(`songs/${song}`)
			if (songFolder.exists) await songFolder.deleteDir(true)

			songsDeleted++
		}

		parser.removeSongs(songs, 'songname')

		parser.sort('ID')
		parser.patchInvalidValues()
		parser.patchCores()
		parser.patchSongsEncodings()
		parser.patchIDs()
		await parser.export(dtaPath)

		this.packagesData.songsCount.all -= songsDeleted
		this.packagesData.songsCount.allPlusRB3 -= songsDeleted
		if (this.packagesData.packages[pkgIndex].packageType === 'rb1') this.packagesData.songsCount.rb1Pkgs -= songsDeleted
		else this.packagesData.songsCount.rb3Pkgs -= songsDeleted

		const { manifest, packageSize } = await genRPCS3SongPackageManifest(pkgPath)
		this.packagesData.allPackagesSize = this.packagesData.allPackagesSize - this.packagesData.packages[pkgIndex].packageSize + packageSize
		const contentsHash = createHashFromBuffer(Buffer.from(manifest))
		const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)

		const pkgData = {
			name: this.packagesData.packages[pkgIndex].name,
			path: this.packagesData.packages[pkgIndex].path,
			thumbnailSrc: this.packagesData.packages[pkgIndex].thumbnailSrc,
			packageType: this.packagesData.packages[pkgIndex].packageType,
			dtaFilePath: this.packagesData.packages[pkgIndex].dtaFilePath,
			packageSize,
			songsCount: parser.songs.length,
			devklic: this.packagesData.packages[pkgIndex].devklic,
			contentsHash,
			songs: parser.songs,
			packageData: this.packagesData.packages[pkgIndex].packageData,
			official,
		} as RB3SongPackagesDataObject

		this.packagesData.packages[pkgIndex] = pkgData

		if (songs.length === 1) {
			if (!firstSelectedSong) {
				sendMessageBox(win, { type: 'error', code: 'batchDeleteSongs' })
				return false
			}
			sendMessageBox(win, { type: 'success', code: 'batchDeleteSongsIndividual', messageValues: { name: firstSelectedSong.name } })
		} else sendMessageBox(win, { type: 'success', code: 'batchDeleteSongs', messageValues: { songsCount: songs.length } })

		return this.createLightSongPackagesCache(await this.readPackagesDataCache())
	}

	/**
	 * Exports a single song from a song package as a Rock Band 3 Song Package file.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {number} pkgIndex The song package index (relative to the song package cache) which the song will be exported.
	 * @param {number} songIndex The song index (relative to its position on the song package songs array of the song package cache) to be exported.
	 * @param {string} destPath The destination file path of the exported song's package file.
	 * @returns {Promise<void>}
	 */
	async exportSong(win: BrowserWindow, pkgIndex: number, songIndex: number, destPath: string): Promise<void> {
		if (!this.packagesData?.packages[pkgIndex]?.songs[songIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return
		}

		const pkg = this.packagesData.packages[pkgIndex]
		if (pkg.packageData.encryptionStatus !== 'decrypted') {
			sendMessageBox(win, { type: 'error', code: 'cantExportSongFromEncryptedPKG' })
			return
		}
		const song = this.packagesData.packages[pkgIndex].songs[songIndex]

		const temp = pathLikeToDirPath(temporaryDirectory())
		const tempThumbnail = pathLikeToFilePath(temporaryFile({ extension: 'jpg' }))
		const dest = pathLikeToFilePath(destPath)
		try {
			const tempSongs = temp.gotoDir('songs')
			if (!tempSongs.exists) await tempSongs.mkDir()
			const pkgPath = pathLikeToDirPath(pkg.path)
			const pkgSongs = pkgPath.gotoDir('songs')
			const songname = song.songname
			const tempSongname = tempSongs.gotoDir(songname)
			if (!tempSongname.exists) await tempSongname.mkDir()
			const tempGenFolder = tempSongname.gotoDir('gen')
			if (!tempGenFolder.exists) await tempGenFolder.mkDir()

			const songDataFolder = pkgSongs.gotoDir(songname)
			const songMOGG = songDataFolder.gotoFile(`${songname}.mogg`)
			const songMIDI = songDataFolder.gotoFile(`${songname}.mid.edat`)
			const songArtwork = songDataFolder.gotoFile(`gen/${songname}_keep.png_ps3`)
			const songMILO = songDataFolder.gotoFile(`gen/${songname}.milo_ps3`)
			const songPAN = songDataFolder.gotoFile(`${songname}.pan`)
			const songUSR = songDataFolder.gotoFile(`${songname}.usr`)
			const songVNN = songDataFolder.gotoFile(`${songname}.vnn`)
			const songVOC = songDataFolder.gotoFile(`${songname}.voc`)
			const songXVOCAB = songDataFolder.gotoFile(`${songname}.xvocab`)
			const songWEIGHTS = songDataFolder.gotoFile(`gen/${songname}_weights.bin`)

			if (songMOGG.exists) await songMOGG.copy(tempSongname.gotoFile(`${songname}.mogg`))
			if (songMIDI.exists) await songMIDI.copy(tempSongname.gotoFile(`${songname}.mid.edat`))
			if (songArtwork.exists) await songArtwork.copy(tempSongname.gotoFile(`gen/${songname}_keep.png_ps3`))
			if (songMILO.exists) await songMILO.copy(tempSongname.gotoFile(`gen/${songname}.milo_ps3`))
			if (songPAN.exists) await songPAN.copy(tempSongname.gotoFile(`${songname}.pan`))
			if (songUSR.exists) await songUSR.copy(tempSongname.gotoFile(`${songname}.usr`))
			if (songVNN.exists) await songVNN.copy(tempSongname.gotoFile(`${songname}.vnn`))
			if (songVOC.exists) await songVOC.copy(tempSongname.gotoFile(`${songname}.voc`))
			if (songXVOCAB.exists) await songXVOCAB.copy(tempSongname.gotoFile(`${songname}.xvocab`))
			if (songWEIGHTS.exists) await songWEIGHTS.copy(tempSongname.gotoFile(`gen/${songname}_weights.bin`))

			const thumbnailDest = temp.gotoFile('folder.jpg')
			const packThumbnail = pkgPath.gotoFile('folder.jpg')
			if (songArtwork.exists) {
				const tex = new TextureFile(songArtwork)
				await tex.convertToImage(tempThumbnail, 'jpg', { height: 256, width: 256, quality: 100 })
				await createRSPackImage(tempThumbnail, thumbnailDest, { category: 'singles', encryptionStatus: 'decrypted', source: 'rb3', type: 'rockshelf', packageName: song.name })
			} else {
				const parsedPKGThumbnail = await isJPEGRockshelfPackImage(packThumbnail)
				if (parsedPKGThumbnail) {
					const packImageBuf = await packThumbnail.readOffset(0, parsedPKGThumbnail.imageFileSize - parsedPKGThumbnail.footerSizeLength)
					await createRSPackImage(packImageBuf, thumbnailDest, { category: 'singles', encryptionStatus: 'decrypted', source: 'rb3', type: 'rockshelf', packageName: song.name })
				} else {
					await createRSPackImage(RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/custom.jpg`), thumbnailDest, { category: 'singles', encryptionStatus: 'decrypted', source: 'rb3', type: 'rockshelf', packageName: song.name })
				}
			}

			const parser = new DTAParser(song)
			await parser.export(tempSongs.gotoFile('songs.dta'))

			await createRB3FileFromRPCS3PackageFolder(win, temp, dest, { useBuzyLoad: false, creatorName: song.author || undefined, overwritePackageFolderName: songname })

			if (tempThumbnail.exists) await tempThumbnail.delete()
			await temp.deleteDir(true)
		} catch (err) {
			if (tempThumbnail.exists) await tempThumbnail.delete()
			if (temp.exists) await temp.deleteDir(true)
			if (dest.exists) await dest.delete()
			throw err
		}
	}

	/**
	 * Retrieves all songs' data from a specific song package.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {number} pkgIndex The song package index (relative to the song package cache) that you want to retrieve the songs' data from.
	 * @returns {RB3CompatibleDTAFile[] | false}
	 */
	getSongsFromPackage(win: BrowserWindow, pkgIndex: number): RB3CompatibleDTAFile[] | false {
		if (!this.packagesData || !this.packagesData.packages[pkgIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}

		return this.packagesData.packages[pkgIndex].songs
	}

	/**
	 * Reads a song package description file and returns the file contents encoded as Base64. Returns `false` if the song package doesn't have a song package description file on it.
	 * - - - -
	 * @param {string} pkgPath The path to the song package that the description file will be read.
	 * @returns {Promise<string | false>}
	 */
	async getPackageDescription(pkgPath: string): Promise<string | false> {
		const packageDir = pathLikeToDirPath(pkgPath)
		const descriptionFile = packageDir.gotoFile('package.md')

		if (descriptionFile.exists) return await descriptionFile.read('base64')
		return false
	}

	/**
	 * Reads the song artwork for a specific song in a song package and returns its contents encoded as Base64.
	 * - - - -
	 * @param {LightRB3SongPackagesDataObject} packageDetails The song's song package details.
	 * @param {RB3CompatibleDTAFile} songDetails The song details.
	 * @returns {Promise<string | false>}
	 */
	async getArtworkDataURLFromSong(packageDetails: LightRB3SongPackagesDataObject, songDetails: RB3CompatibleDTAFile): Promise<string | false> {
		const artworkPath = new TextureFile(DirPath.of(packageDetails.path).gotoFile(`songs/${songDetails.songname}/gen/${songDetails.songname}_keep.png_ps3`))
		if (!artworkPath.path.exists) return false
		return await artworkPath.toDataURL()
	}

	/**
	 * Gets the album artwork of the first song from a song package and uses it as the song package thumbnail.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {pkgIndex} pkgIndex The song package index (relative to the song package cache) that you want to get the song artwork from.
	 * @returns {Promise<boolean>}
	 */
	async useFirstSongArtworkAsPkgArtwork(win: BrowserWindow, pkgIndex: number): Promise<boolean> {
		if (!this.packagesData?.packages[pkgIndex].songs[0]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}

		const firstSong = this.packagesData.packages[pkgIndex].songs[0]
		const pkgPath = DirPath.of(this.packagesData.packages[pkgIndex].path)

		if (!pkgPath.exists) {
			sendMessageBox(win, { type: 'error', code: 'deletePackagePackageNotFound' })
			return false
		}

		const thumbnail = pkgPath.gotoFile('folder.jpg')
		await editRSPackImage(thumbnail, { imgPath: pkgPath.gotoFile(`songs/${firstSong.songname}/gen/${firstSong.songname}_keep.png_ps3`).path })

		return true
	}

	// #region Getters

	async getScoresFromGoCentral(win: BrowserWindow, songID: number, instrument: ScoreDataInstrumentTypes = 'band'): Promise<GoCentralLeaderboardResultObject> {
		return await GoCentralAPI.getScores(win, songID, instrument)
	}

	async getRockBand3Data(): Promise<RockBand3Data> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		const devhdd0 = this.userData.vfs.devhdd0

		const map = new MyObject<RockBand3Data>()
		const games = this.userData.vfs.games

		const userNameFilePath = devhdd0.gotoFile(`home/00000001/localusername`)

		const saveDataPath = devhdd0.gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
		const usrdir = devhdd0.gotoDir('game/BLUS30463/USRDIR')
		const gen = usrdir.gotoDir('gen')
		const hdr = gen.gotoFile('patch_ps3.hdr')
		const ark = gen.gotoFile('patch_ps3_0.ark')

		// const contents: string[] = []

		map.setMany({
			userName: userNameFilePath.exists ? await userNameFilePath.read('utf8') : null,
			path: games.BLUS30463 ? pathLikeToDirPath(games.BLUS30463).path : null,
			gameName: 'Rock Band 3',
			gameSerial: 'BLUS30463',
			saveDataPath: saveDataPath.path,
			hasGameInstalled: Boolean(games.BLUS30463),
			hasSaveData: saveDataPath.exists,
			hasUpdate: gen.exists && hdr.exists && ark.exists,
			hasDeluxe: false,
			updateType: 'none',
			deluxeVersionHash: null,
			hasTeleportGlitchPatch: false,
			hasHighMemoryPatch: false,
		})

		if (hdr.exists && ark.exists) {
			const arkStats = await ark.stat()
			const hdrStats = await hdr.stat()

			// CHECK: Only RB3DX update can be bigger than 500MB
			if (arkStats.size > 0x1f400000) {
				map.setMany({
					gameName: 'Rock Band 3 Deluxe',
					hasDeluxe: true,
					updateType: 'dx',
				})

				const dxVersionFile = usrdir.gotoFile('dx_version.dta')
				if (dxVersionFile.exists) {
					const hash = (await dxVersionFile.readLines())[4].trim().replace(/"/g, '').split('-')[0]
					if (hash.length === 7) map.set('deluxeVersionHash', hash)
				}
			}

			// Title Update 5 HDR file has exactly 36201 bytes
			// Title Update 5 ARK File has exactly 3349707 bytes
			else if (hdrStats.size === 0x8d69 && arkStats.size === 0x331ccb) map.set('updateType', 'tu5')
		}

		if (games.BLUS30463) {
			const rb3GamePath = pathLikeToDirPath(games.BLUS30463)
			if (rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_vanilla.hdr').exists && rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_10.ark').exists) map.set('hasTeleportGlitchPatch', true)
			if (gen.gotoFile('../dx_high_memory.dta').exists) map.set('hasHighMemoryPatch', true)
		}

		return map.toJSON()
	}

	async getRockBand3SaveData(): Promise<ParsedRB3SaveData | false> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		const devhdd0 = this.userData.vfs.devhdd0
		const rb3SaveDataPath = RockshelfFileSystemAPI.rb3SaveFile(devhdd0)
		if (rb3SaveDataPath.exists) {
			const saveData = await RB3SaveData.parseFromFile(rb3SaveDataPath)
			return saveData
		} else return false
	}

	getInstrumentScoresData(saveData: ParsedRB3SaveData | false): InstrumentScoreData | false {
		if (saveData === false) return false
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		const instrumentScores = RB3SaveData.getInstrumentScoreData(saveData, this.userData.userConfig.mostPlayedInstrument, this.userData.userConfig.mostPlayedDifficulty)
		return instrumentScores
	}

	async getInstalledDeluxeData(): Promise<DeluxeInstalledData | false> {
		return await RockshelfGitHubAPI.getInstalledDeluxeData()
	}

	/**
	 * Reads all song package folders and parses their data.
	 * - - - -
	 * @returns {Promise<RB3SongPackagesData>}
	 */
	async getSongPackagesData(): Promise<RB3SongPackagesData> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		const devhdd0 = this.userData.vfs.devhdd0
		const packages: RB3SongPackagesDataObject[] = []
		const parsingErrors: string[] = []
		const songsCountObj: RB3SongPackagesData['songsCount'] = {
			all: 0,
			allPlusRB3: 83,
			rb1Pkgs: 0,
			rb3: 83,
			rb3Pkgs: 0,
		}
		const packagesCountObj: RB3SongPackagesData['packagesCount'] = {
			all: 0,
			allPlusRB3: 1,
			rb1Pkgs: 0,
			rb3Pkgs: 0,
		}
		let allPackagesSize: number = 0

		const rb3UsrDir = RockshelfFileSystemAPI.rb3UsrDir(devhdd0)
		if (rb3UsrDir.exists) {
			const allRB3PackagesFolder = (await rb3UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'custom_textures') as DirPath[]
			if (allRB3PackagesFolder.length > 0) {
				for (const packagePath of allRB3PackagesFolder) {
					const dtaFilePath = packagePath.gotoFile('songs/songs.dta')
					if (!dtaFilePath.exists) continue

					let parsedData: DTAParser
					try {
						parsedData = await DTAParser.fromFile(dtaFilePath)
					} catch (err) {
						parsingErrors.push(`BLUS30463/USRDIR/${packagePath.name}`)
						continue
					}

					await parsedData.applyDXUpdatesOnSongs(true)
					parsedData.sort('ID')

					const songsCount = parsedData.songs.length
					if (songsCount === 0) continue

					const devklic = EDATFile.genDevKLicHash(packagePath.name)
					const { manifest, packageSize } = await genRPCS3SongPackageManifest(packagePath)
					const contentsHash = createHashFromBuffer(Buffer.from(manifest))
					const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)

					if (official?.isDuplicatedForRB3) continue
					else if (official) {
						for (const song of parsedData.songs) {
							song.multitrack = 'full'
							song.author = song.author ?? 'Harmonix'
						}
					}

					packagesCountObj.rb3Pkgs++
					packagesCountObj.all++
					packagesCountObj.allPlusRB3++

					songsCountObj.rb3Pkgs += parsedData.songs.length
					songsCountObj.all += parsedData.songs.length
					songsCountObj.allPlusRB3 += parsedData.songs.length

					allPackagesSize += packageSize

					const thumbnailSrc = packagePath.gotoFile('folder.jpg')
					let packageData: ParsedRSPackImageObject

					if (!thumbnailSrc.exists) {
						if (parsedData.songs.length === 1 && !official) {
							const onlySong = parsedData.songs[0]
							const texture = new TextureFile(packagePath.gotoFile(`songs/${onlySong.songname}/gen/${onlySong.songname}_keep.png_ps3`))
							if (texture.path.exists) {
								const temp = await texture.convertToImage(temporaryFile({ extension: '.jpg' }), 'jpg')
								const { header } = await createRSPackImage(temp.path, thumbnailSrc, { source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: `${onlySong.name} - ${onlySong.artist}`, category: 'other' })
								packageData = header
								await temp.path.delete()
							} else {
								const newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

								const { header } = await createRSPackImage(newPackageImage, thumbnailSrc, { source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: packagePath.name, category: 'other' })
								packageData = header
							}
						} else {
							let newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
							if (!newPackageImage.exists) newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

							const { header } = await createRSPackImage(newPackageImage, thumbnailSrc, { source: official ? 'pkg' : 'merged', type: official ? 'rockshelf' : 'other', encryptionStatus: official ? 'encrypted' : 'unknown', packageName: official?.name || packagePath.name, category: official ? 'official' : 'other' })
							packageData = header
						}
					} else {
						packageData = await parseRSPackImageFile(thumbnailSrc)
					}

					packages.push({
						name: packagePath.name,
						path: packagePath.path,
						thumbnailSrc: `rb3packimg://${encodeURIComponent(packagePath.name)}`,
						packageType: 'rb3',
						dtaFilePath: dtaFilePath.path,
						packageSize,
						songsCount,
						devklic,
						contentsHash,
						songs: [...parsedData.songs],
						packageData,
						official,
					})
				}
			}
		}

		const rb1UsrDir = RockshelfFileSystemAPI.rb1UsrDir(devhdd0)
		if (rb1UsrDir.exists) {
			const allRB1PackagesFolder = (await rb1UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'CCF0099') as DirPath[]
			if (allRB1PackagesFolder.length > 0) {
				for (const packagePath of allRB1PackagesFolder) {
					const dtaFilePath = packagePath.gotoFile('songs/songs.dta')
					if (!dtaFilePath.exists) continue

					let parsedData: DTAParser
					try {
						parsedData = await DTAParser.fromFile(dtaFilePath)
					} catch (err) {
						parsingErrors.push(`BLUS30050/USRDIR/${packagePath.name}`)
						continue
					}

					await parsedData.applyDXUpdatesOnSongs(true)
					parsedData.sort('ID')

					const songsCount = parsedData.songs.length
					if (songsCount === 0) continue

					const devklic = EDATFile.genDevKLicHash(packagePath.name)
					const { manifest, packageSize } = await genRPCS3SongPackageManifest(packagePath)
					const contentsHash = createHashFromBuffer(Buffer.from(manifest))
					const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)

					// Comment the next line if you want to see the extracted RPCS3 of unknown RB1 packages
					if (!official) continue
					else if (official?.isDuplicatedForRB3) continue
					else if (official) {
						for (const song of parsedData.songs) {
							song.multitrack = 'full'
							song.author = song.author ?? 'Harmonix'
						}
					}

					packagesCountObj.rb1Pkgs++
					packagesCountObj.all++
					packagesCountObj.allPlusRB3++

					songsCountObj.rb1Pkgs += parsedData.songs.length
					songsCountObj.all += parsedData.songs.length
					songsCountObj.allPlusRB3 += parsedData.songs.length

					allPackagesSize += packageSize

					const thumbnailSrc = packagePath.gotoFile('folder.jpg')
					let packageData: ParsedRSPackImageObject

					if (!thumbnailSrc.exists) {
						if (parsedData.songs.length === 1 && !official) {
							const onlySong = parsedData.songs[0]
							const texture = new TextureFile(packagePath.gotoFile(`songs/${onlySong.songname}/gen/${onlySong.songname}_keep.png_ps3`))
							if (texture.path.exists) {
								const temp = await texture.convertToImage(temporaryFile({ extension: '.jpg' }), 'jpg')
								const { header } = await createRSPackImage(temp.path, thumbnailSrc, { source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: `${onlySong.name} - ${onlySong.artist}`, category: 'other' })
								packageData = header
								await temp.path.delete()
							} else {
								const newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

								const { header } = await createRSPackImage(newPackageImage, thumbnailSrc, { source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: packagePath.name, category: 'other' })
								packageData = header
							}
						} else {
							let newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
							if (!newPackageImage.exists) newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

							const { header } = await createRSPackImage(newPackageImage, thumbnailSrc, { source: official ? 'pkg' : 'merged', type: official ? 'rockshelf' : 'other', encryptionStatus: official ? 'encrypted' : 'unknown', packageName: official?.name || packagePath.name, category: official ? 'official' : 'other' })
							packageData = header
						}
					} else {
						packageData = await parseRSPackImageFile(thumbnailSrc)
					}

					packages.push({
						name: packagePath.name,
						path: packagePath.path,
						thumbnailSrc: `rb1packimg://${encodeURIComponent(packagePath.name)}`,
						packageType: 'rb1',
						dtaFilePath: dtaFilePath.path,
						packageSize,
						songsCount,
						devklic,
						contentsHash,
						songs: [...parsedData.songs],
						packageData,
						official,
					})
				}
			}
		}

		const packagesObj = {
			allPackagesSize,
			packages,
			packagesCount: packagesCountObj,
			parsingErrors,
			songsCount: songsCountObj,
			starsCount: songsCountObj.allPlusRB3 * 5,
		}

		this.packagesData = packagesObj

		return packagesObj
	}

	/**
	 * Refreshes all the information from a specific song package. This method is way faster than refreshing the whole song package library. Returns `false` if the in-memory song package data is corrupted.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param pkgIndex The index of the song package you want its data to be refreshed.
	 * @returns {Promise<LightRB3SongPackagesData | false>}
	 */
	async refreshSongPackageData(win: BrowserWindow, pkgIndex: number): Promise<LightRB3SongPackagesData | false> {
		if (!this.packagesData || !this.packagesData.packages[pkgIndex]) {
			sendDialog(win, 'corruptedPackagesCache')
			return false
		}
		const packagePath = pathLikeToDirPath(this.packagesData.packages[pkgIndex].path)
		const dtaFilePath = pathLikeToFilePath(this.packagesData.packages[pkgIndex].dtaFilePath)
		if (!dtaFilePath.exists) return false

		const parsedData = await DTAParser.fromFile(dtaFilePath)

		await parsedData.applyDXUpdatesOnSongs(true)
		parsedData.sort('ID')

		const songsCount = parsedData.songs.length
		if (songsCount === 0) return false

		const devklic = EDATFile.genDevKLicHash(packagePath.name)
		const { manifest, packageSize } = await genRPCS3SongPackageManifest(packagePath)
		const contentsHash = createHashFromBuffer(Buffer.from(manifest))
		const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)

		if (official?.isDuplicatedForRB3) return false
		else if (official) {
			for (const song of parsedData.songs) {
				song.multitrack = 'full'
				song.author = song.author ?? 'Harmonix'
			}
		}

		const thumbnailSrc = packagePath.gotoFile('folder.jpg')
		let packageData: ParsedRSPackImageObject

		if (!thumbnailSrc.exists) {
			if (parsedData.songs.length === 1 && !official) {
				const onlySong = parsedData.songs[0]
				const texture = new TextureFile(packagePath.gotoFile(`songs/${onlySong.songname}/gen/${onlySong.songname}_keep.png_ps3`))
				if (texture.path.exists) {
					const temp = await texture.convertToImage(temporaryFile({ extension: '.jpg' }), 'jpg')
					const { header } = await createRSPackImage(temp.path, thumbnailSrc, { source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: `${onlySong.name} - ${onlySong.artist}`, category: 'other' })
					packageData = header
					await temp.path.delete()
				} else {
					const newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

					const { header } = await createRSPackImage(newPackageImage, thumbnailSrc, { source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: packagePath.name, category: 'other' })
					packageData = header
				}
			} else {
				let newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
				if (!newPackageImage.exists) newPackageImage = RockshelfFileSystemAPI.coreModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

				const { header } = await createRSPackImage(newPackageImage, thumbnailSrc, { source: official ? 'pkg' : 'merged', type: official ? 'rockshelf' : 'other', encryptionStatus: official ? 'encrypted' : 'unknown', packageName: official?.name || packagePath.name, category: official ? 'official' : 'other' })
				packageData = header
			}
		} else {
			packageData = await parseRSPackImageFile(thumbnailSrc)
		}

		this.packagesData.packages[pkgIndex] = {
			name: packagePath.name,
			path: packagePath.path,
			thumbnailSrc: `rb${this.packagesData.packages[pkgIndex].packageType === 'rb1' ? '1' : '3'}packimg://${encodeURIComponent(packagePath.name)}`,
			packageType: this.packagesData.packages[pkgIndex].packageType,
			dtaFilePath: dtaFilePath.path,
			packageSize,
			songsCount,
			devklic,
			contentsHash,
			songs: parsedData.songs,
			packageData,
			official,
		}

		return this.createLightSongPackagesCache(await this.readPackagesDataCache())
	}

	/**
	 * Returns an object with all necessary parsed data for Rockshelf to properly display all available information about the game, installed pactches and song packages.
	 *
	 * This function is called once when Rockshelf initializes the rendering process.
	 * - - - -
	 * @returns {Promise<InitialStateObject>}
	 */
	async getInitialState(): Promise<InitialStateObject> {
		const rb3Stats = await this.getRockBand3Data()
		const saveData = await this.getRockBand3SaveData()
		const instrumentScores = this.getInstrumentScoresData(saveData)
		const installedDeluxeData = await this.getInstalledDeluxeData()
		const packages = this.createLightSongPackagesCache(await this.readPackagesDataCache())
		return {
			rb3Stats,
			saveData,
			instrumentScores,
			installedDeluxeData,
			packages,
		}
	}

	// #region Filter Methods

	/**
	 * Returns an object with arrays of filtered headers related to a specific filtering type.
	 *
	 * This function filters song packages.
	 * - - - -
	 * @param {SongPackagesFilterTypes | undefined} [type] `OPTIONAL` The filter type.
	 * @param {SongPackagesFilterOptions | undefined} [options] `OPTIONAL` An object with options that tweaks the filtering process.
	 * @returns {Promise<SongPackagesFilterGenericObject>}
	 */
	async filterSongPackages(type: SongPackagesFilterTypes, options?: SongPackagesFilterOptions): Promise<SongPackagesFilterGenericObject> {
		const packagesData = await this.readPackagesDataCache()

		switch (type) {
			case 'name':
			default:
				return filterSongPackagesByName(packagesData.packages, options)
			case 'officialUnofficial':
				return filterSongPackagesByOfficialPkg(packagesData.packages, options)
			case 'userCategory':
				return filterSongPackagesByUserCategory(packagesData.packages, options)
		}
	}

	/**
	 * Returns an object with arrays of filtered headers related to a specific filtering type.
	 *
	 * This function filters song from a specific song package.
	 * - - - -
	 * @param {number} pkgIndex The index of the song package you want to filter its songs to.
	 * @param {DTAFilterTypes | undefined} [type] `OPTIONAL` The filter type.
	 * @param {DTAFilterOptions | undefined} [options] `OPTIONAL` An object with options that tweaks the filtering process.
	 * @returns {Promise<DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject>}
	 */
	async filterSongsFromPackage(pkgIndex: number, type: DTAFilterTypes = 'title', options?: DTAFilterOptions): Promise<DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject> {
		const packagesData = await this.readPackagesDataCache()
		const songs = packagesData.packages[pkgIndex].songs
		switch (type) {
			case 'title':
			default:
				return filterDTAByTitle(songs, options)
			case 'artist':
				return filterDTAByArtist(songs, options)
			case 'genre':
				return filterDTAByGenre(songs, options)
			case 'decade':
				return filterDTAByDecade(songs, options)
			case 'yearReleased':
				return filterDTAByYearReleased(songs, options)
			case 'difficulty':
				return filterDTAByInstrumentDifficulty(songs, options)
			case 'songRating':
				return filterDTABySongRating(songs, options)
		}
	}

	// #region Install Methods

	/**
	 * Downloads Rock Band 3 Deluxe from GitHub servers and installs it, returning a `DeluxeInstalledData` object with updated information of the installed Rock Band 3 Deluxe version.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {DeluxeInstallationOptions} options An object with values that settles the downloading the installing process.
	 * @returns {Promise<false | DeluxeInstalledData>}
	 */
	async downloadAndInstallDeluxe(win: BrowserWindow, options: DeluxeInstallationOptions): Promise<false | DeluxeInstalledData> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		if (options.latestVersionHash.length !== 7) throw new Error('The provided commit hash is invalid.')
		const downloadLink = options.type === 'standard' ? 'https://nightly.link/hmxmilohax/rock-band-3-deluxe/workflows/build/develop/RB3DX-Rockshelf.zip' : 'https://nightly.link/hmxmilohax/rock-band-3-deluxe/workflows/build/develop/RB3DX-Rockshelf-CustomCharacters.zip'

		const devhdd0 = this.userData.vfs.devhdd0
		const dxVersionFile = RockshelfFileSystemAPI.dxVersionFile(devhdd0)

		const deluxeZipFile = RockshelfFileSystemAPI.getDownloadedDXPatchFile(options.latestVersionHash)
		if (!deluxeZipFile.exists) {
			sendMessageBox(win, { type: 'loading', code: 'fetchingDataFromDeluxeServers' })

			let downloadedBytes = 0,
				totalBytes = 0

			const response = await axios.get<ReadStream>(downloadLink, { responseType: 'stream' })
			totalBytes = Number(response.headers['content-length'])

			const deluxeWriter = await deluxeZipFile.createWriteStream()

			const interval = setInterval(() => {
				sendMessageBox(win, { type: 'progressBar', code: 'downloadingDeluxeText', progress: { count: getReadableBytesSize(downloadedBytes), total: getReadableBytesSize(totalBytes), percentage: `${((downloadedBytes / totalBytes) * 100).toFixed().toString()}%` } })
			}, 1000)

			await new Promise((resolve, reject) => {
				response.data.on('data', (chunk) => {
					deluxeWriter.write(chunk)
					downloadedBytes += chunk.length
				})

				response.data.on('end', () => {
					clearInterval(interval)
					sendMessageBox(win, { type: 'progressBar', code: 'downloadingDeluxeText', progress: { count: getReadableBytesSize(totalBytes), total: getReadableBytesSize(totalBytes), percentage: `100%` } })
					resolve(true)
				})

				response.data.on('error', (err: Error) => reject(err))
			})

			deluxeWriter.close()
		}

		const zip = await unzipper.Open.file(deluxeZipFile.path)

		let extractedFiles = 0
		const totalFiles = zip.files.length
		sendMessageBox(win, { type: 'progressBar', code: 'unzippingDeluxePatchText', progress: { count: extractedFiles, total: totalFiles } })
		for (const entry of zip.files) {
			const dest = RockshelfFileSystemAPI.rb3UsrDir(devhdd0).gotoFile(`../${entry.path}`)
			const destRootFolder = dest.gotoDir('')
			if (!destRootFolder.exists) await destRootFolder.mkDir()
			await new Promise((resolve, reject) => {
				entry
					.stream()
					.pipe(dest.createWriteStreamSync())
					.on('close', () => resolve(true))
					.on('error', (err) => reject(err))
			})
			extractedFiles++
			sendMessageBox(win, { type: 'progressBar', code: 'unzippingDeluxePatchText', progress: { count: extractedFiles, total: totalFiles } })
		}

		await dxVersionFile.write(`(version\r\n   "r0000+${options.latestVersionHash}"\r\n)\r\n(commit\r\n   "${options.latestVersionHash}"\r\n)\r\n`, 'utf-8', true)

		sendMessageBox(win, { type: 'success', code: 'deluxeInstall' })

		await deluxeZipFile.delete()

		return await RockshelfGitHubAPI.getInstalledDeluxeData()
	}

	/**
	 * Installs quick configuration files on RPCS3.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 * @param {QuickConfigType} configType The type of the configuration you want to install.
	 */
	async installQuickConfig(win: BrowserWindow, configType: QuickConfigType): Promise<void> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		const configYmlFile = RBTools.resFolder.gotoFile(`${configType}.yml`)
		const configFolder = platform() === 'win32' ? this.userData.vfs.emulatorDir.gotoDir('config/custom_configs') : this.userData.vfs.emulatorDir.gotoDir('custom_configs')
		const rb3ConfigFile = configFolder.gotoFile('config_BLUS30463.yml')
		if (!configFolder.exists) await configFolder.mkDir(true)
		await configYmlFile.copy(rb3ConfigFile, true)
		sendMessageBox(win, { type: 'success', code: 'installQuickConfig' })
	}

	/**
	 * Installs the High Memory Patch on RPCS3.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` object from the event emitter.
	 */
	async installHighMemoryPatch(win: BrowserWindow): Promise<void> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		const usrdir = RockshelfFileSystemAPI.rb3UsrDir(this.userData.vfs.devhdd0)
		if (!usrdir.exists) await usrdir.mkDir(true)
		const highMemoryDTAFile = usrdir.gotoFile('dx_high_memory.dta')
		await highMemoryDTAFile.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
		sendMessageBox(win, { type: 'success', code: 'installHighMemoryPatch' })
	}

	/**
	 * Executes Rock Band 3 on the emulator.
	 * - - - -
	 * @returns {Promise<void>}
	 */
	async playRB3(): Promise<void> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')
		const rpcs3ExePath = this.userData.vfs.rpcs3Exe
		const rpcs3UserConfigFile = RockshelfFileSystemAPI.rb3ConfigFile(this.userData.vfs.emulatorDir)
		const rb3GameEboot = this.userData.vfs.rb3GameEboot
		const command = `${rpcs3ExePath.name} ${this.userData.userConfig.rpcs3NoGUI ? '--no-gui' : ''} --config "${rpcs3UserConfigFile.path}" "${rb3GameEboot.path}"`

		await new Promise<boolean>((resolve, reject) => {
			const x = exec(command, { cwd: rpcs3ExePath.root, windowsHide: true })
			x.on('error', (err) => reject(err))

			setTimeout(() => {
				resolve(x.kill())
			}, 1000)
		})
	}

	// #region Cleaners

	/**
	 * Deletes all Rockshelf Pack Images from all installed song packages, allowing Rockshelf to perform a fresh creation of all image files.
	 */
	async deleteAllThumbnails(): Promise<void> {
		if (!this.userData.userConfig || !this.userData.vfs) throw new Error('User config data is not loaded into memory.')

		const devhdd0 = this.userData.vfs.devhdd0
		const rb3UsrDir = RockshelfFileSystemAPI.rb3UsrDir(devhdd0)
		if (rb3UsrDir.exists) {
			const allRB3PackagesFolder = (await rb3UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'custom_textures') as DirPath[]

			if (allRB3PackagesFolder.length > 0) {
				for (const dir of allRB3PackagesFolder) {
					const jpegFile = dir.gotoFile('folder.jpg')
					if (jpegFile.exists) await jpegFile.delete()
				}
			}
		}

		const rb1UsrDir = RockshelfFileSystemAPI.rb1UsrDir(devhdd0)
		if (rb1UsrDir.exists) {
			const allRB1PackagesFolder = (await rb1UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'CCF0099') as DirPath[]

			if (allRB1PackagesFolder.length > 0) {
				for (const dir of allRB1PackagesFolder) {
					const jpegFile = dir.gotoFile('folder.jpg')
					if (jpegFile.exists) await jpegFile.delete()
				}
			}
		}
	}

	// #region Patches

	// #region Search

	search(searchField: string): DatabaseSearchFnResults {
		if (!this.packagesData) throw new Error('Song packages data is not loaded into memory.')
		searchField = searchField.toLowerCase().trim()

		const headers: DatabaseSearchFnResults['headers'] = []
		const addedSongs = new Set()
		let pkgCount = 0

		let pkgIndex = 0
		for (const pkg of this.packagesData.packages) {
			let songIndex = 0
			for (const song of pkg.songs) {
				songIndex++
				if (addedSongs.has(song.songname)) continue

				let operator: 'name' | 'artist' | 'both' | null = null
				const songName = song.name.toLowerCase()
				const songArtist = song.artist.toLowerCase()

				if (songName.includes(searchField)) {
					if (operator === 'artist') operator = 'both'
					else operator = 'name'
				}

				if (songArtist.includes(searchField)) {
					if (operator === 'name') operator = 'both'
					else operator = 'artist'
				}

				if (!operator) continue

				pkgCount++
				const entryIndex = headers.findIndex((val) => pkgIndex === val.pkgIndex)

				if (entryIndex !== -1) {
					headers[entryIndex].songs.push({
						songIndex: songIndex - 1,
						songData: song,
						operator,
					})
				} else {
					headers.push({
						pkgIndex,
						songs: [
							{
								songIndex: songIndex - 1,
								songData: song,
								operator,
							},
						],
					})
				}
			}
			pkgIndex++
		}

		return {
			pkgCount,
			songsCount: addedSongs.size,
			headers,
		}
	}

	// #region Init

	/**
	 * Initializes the `DataSyncAPI` and all its handlers.
	 * - - - -
	 * @param {UserDataAPI} userData An instantiated `UserDataAPI` class.
	 * @returns {DataSyncAPI}
	 */
	static init(userData: UserDataAPI): DataSyncAPI {
		const pkgData = new DataSyncAPI(userData)

		addHandler('DataSyncAPI/createPackage', async (win, _, options: CreatePackageOptions) => await pkgData.createPackage(win, options))
		addHandler('DataSyncAPI/deletePackage', async (win, _, pkgIndex: number) => await pkgData.deletePackage(win, pkgIndex))
		addHandler('DataSyncAPI/deleteSongsFromPackage', async (win, _, pkgIndex: number, songs: string[]) => await pkgData.deleteSongsFromPackage(win, pkgIndex, songs))
		addHandler('DataSyncAPI/editPackage', async (win, _, pkgIndex: number, options: EditPackageDataOptions) => await pkgData.editPackage(win, pkgIndex, options))
		addHandler('DataSyncAPI/encDecPackage', async (win, _, pkgIndex: number, command: EncDecPackageFunctionTypes) => await pkgData.encDecPackage(win, pkgIndex, command))
		addHandler('DataSyncAPI/exportPackage', async (win, _, packagePath: string, destPath: string, options?: CreateRB3FileOptions) => await pkgData.exportPackage(win, packagePath, destPath, options))
		addHandler('DataSyncAPI/exportSong', async (win, _, pkgIndex: number, songIndex: number, destPath: string) => await pkgData.exportSong(win, pkgIndex, songIndex, destPath))
		addHandler('DataSyncAPI/installRB3File', async (win, _, rb3FilePath: string, options?: RB3FileExtractionOptions) => await pkgData.installRB3File(win, rb3FilePath, options))
		addHandler('DataSyncAPI/mergePackages', async (win, _, fromPackageIndex: number, toPackageIndex: number) => await pkgData.mergePackages(win, fromPackageIndex, toPackageIndex))

		addHandler('DataSyncAPI/getArtworkDataURLFromSong', async (_, __, packageDetails: LightRB3SongPackagesDataObject, songDetails: RB3CompatibleDTAFile) => await pkgData.getArtworkDataURLFromSong(packageDetails, songDetails))
		addHandler('DataSyncAPI/getPackageDescription', async (_, __, pkgPath: string) => await pkgData.getPackageDescription(pkgPath))
		addHandler('DataSyncAPI/getScoresFromGoCentral', async (win, __, songID: number, instrument: ScoreDataInstrumentTypes = 'band') => await pkgData.getScoresFromGoCentral(win, songID, instrument))
		addHandler('DataSyncAPI/getSongsFromPackage', (win, __, pkgIndex: number) => pkgData.getSongsFromPackage(win, pkgIndex))
		addHandler('DataSyncAPI/useFirstSongArtworkAsPkgArtwork', async (win, __, pkgIndex: number) => await pkgData.useFirstSongArtworkAsPkgArtwork(win, pkgIndex))

		addHandler('DataSyncAPI/getInitialState', async () => await pkgData.getInitialState())
		addHandler('DataSyncAPI/getInstalledDeluxeData', async () => await pkgData.getInstalledDeluxeData())
		addHandler('DataSyncAPI/getInstrumentScoresData', (_, __, saveData: ParsedRB3SaveData | false) => pkgData.getInstrumentScoresData(saveData))
		addHandler('DataSyncAPI/getLightSongPackagesData', async () => pkgData.createLightSongPackagesCache(await pkgData.getSongPackagesData()))
		addHandler('DataSyncAPI/getRockBand3Data', async () => await pkgData.getRockBand3Data())
		addHandler('DataSyncAPI/getRockBand3SaveData', async () => await pkgData.getRockBand3SaveData())
		addHandler('DataSyncAPI/getSongPackagesData', async () => await pkgData.getSongPackagesData())
		addHandler('DataSyncAPI/refreshSongPackageData', async (win, __, pkgIndex: number) => await pkgData.refreshSongPackageData(win, pkgIndex))

		addHandler('DataSyncAPI/downloadAndInstallDeluxe', async (win, __, options: DeluxeInstallationOptions) => await pkgData.downloadAndInstallDeluxe(win, options))
		addHandler('DataSyncAPI/installQuickConfig', async (win, __, configType: QuickConfigType) => await pkgData.installQuickConfig(win, configType))
		addHandler('DataSyncAPI/installHighMemoryPatch', async (win, __) => await pkgData.installHighMemoryPatch(win))
		addHandler('DataSyncAPI/playRB3', async (_) => await pkgData.playRB3())

		addHandler('DataSyncAPI/deleteAllThumbnails', async () => await pkgData.deleteAllThumbnails())

		addHandler('DataSyncAPI/filterSongPackages', async (_, __, type: SongPackagesFilterTypes, options?: SongPackagesFilterOptions) => await pkgData.filterSongPackages(type, options))
		addHandler('DataSyncAPI/filterSongsFromPackage', async (_, __, pkgIndex: number, type: DTAFilterTypes = 'title', options?: DTAFilterOptions) => await pkgData.filterSongsFromPackage(pkgIndex, type, options))

		addHandler('DataSyncAPI/search', (_, __, searchField: string) => pkgData.search(searchField))
		return pkgData
	}
}
