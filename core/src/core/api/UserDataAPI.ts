import { app, ipcMain } from 'electron'
import { isRPCS3Devhdd0PathValid, isRPCS3ExePathValid, type DTAFilterTypes } from '../../lib/rbtools/lib.exports'
import type { SongPackagesFilterTypes } from '../../lib.exports'
import type { ScoreDataInstrumentTypes } from '../../lib/rbtools'
import { RockshelfFileSystemAPI } from './RockshelfFileSystemAPI'
import { DirPath } from 'node-lib'

const handle = ipcMain.handle.bind(ipcMain)

export interface UserConfigObject {
  /**
   * The path to the `dev_hdd0` folder.
   */
  devhdd0Path: string
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

export type UserConfigReadObject = UserConfigObject | 'firstTime' | 'corrupted'

/**
 * This class settles an API for user data synchronization, reading and editing between the main and renderer processes.
 */
export class UserDataAPI {
  static defaultValues = {
    userConfig: {
      devhdd0Path: '',
      rpcs3ExePath: '',
      mostPlayedInstrument: 'band',
      mostPlayedDifficulty: 3,
      packagesCatalogSortBy: 'name',
      songsCatalogSortBy: 'title',
      rpcs3NoGUI: false,
      downloadedContentDirPath: DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf/DownloadedContent').path,
      downloadedContentFileName: 'hash',
    } as UserConfigObject,
  }

  userConfig?: UserConfigObject
  constructor() {}

  // #region Handlers

  readUserConfig = async (_: Electron.IpcMainInvokeEvent): Promise<UserConfigReadObject> => {
    const userConfigFile = RockshelfFileSystemAPI.userConfigFile()
    if (this.userConfig) {
      if (!userConfigFile.exists) await this.saveUserConfig(_, this.userConfig)
      return this.userConfig
    }

    if (!userConfigFile.exists) return 'firstTime'

    const data = await userConfigFile.readJSON<UserConfigObject>()

    try {
      isRPCS3Devhdd0PathValid(data.devhdd0Path)
      isRPCS3ExePathValid(data.rpcs3ExePath)
    } catch (err) {
      return 'corrupted'
    }

    this.userConfig = data
    return data
  }

  saveUserConfig = async (_: Electron.IpcMainInvokeEvent, newConfig?: Partial<UserConfigObject>): Promise<UserConfigObject> => {
    const userConfigFilePath = RockshelfFileSystemAPI.userConfigFile()

    const newData = {
      ...UserDataAPI.defaultValues.userConfig,
      ...this.userConfig,
      ...newConfig,
    }

    this.userConfig = newData
    await userConfigFilePath.write(JSON.stringify(newData))

    return newData
  }

  deleteUserConfig = async (): Promise<void> => {
    const userConfigFile = RockshelfFileSystemAPI.userConfigFile()
    if (userConfigFile.exists) await userConfigFile.delete()
  }

  // #region Init

  static init(): UserDataAPI {
    const userData = new UserDataAPI()

    handle('UserDataAPI/read', userData.readUserConfig)
    handle('UserDataAPI/save', userData.saveUserConfig)
    handle('UserDataAPI/delete', userData.deleteUserConfig)

    return userData
  }
}
