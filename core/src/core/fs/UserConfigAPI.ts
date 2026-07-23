import { BrowserWindow, shell } from 'electron'
import type { SongPackagesFilterTypes } from '../../lib.exports'
import type { ScoreDataInstrumentTypes } from '../../lib/rbtools'
import { isRPCS3Devhdd0PathValid, isRPCS3ExePathValid, type DTAFilterTypes } from '../../lib/rbtools/lib.exports'
import { RockshelfFileSystemAPI } from './RockshelfFileSystemAPI'
import { sendMessageBox, sendDialog } from '../electron/rendererSenders'

// #region Types

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

// #region UserConfigAPI

export class UserConfigAPI {
  /**
   * Reads and parses the user configuration file. Returns `false` ifthe user configuration file doesn't exist.
   * - - - -
   * @returns {Promise<UserConfigObject | false>}
   */
  static async readFile(): Promise<UserConfigObject | false> {
    const userConfigFile = RockshelfFileSystemAPI.userConfigFile()
    if (userConfigFile.exists) return await userConfigFile.readJSON<UserConfigObject>()
    return false
  }

  static async saveFile(newConfig?: Partial<UserConfigObject>) {
    const userConfigFilePath = RockshelfFileSystemAPI.userConfigFile()
    const oldConfig = await this.readFile()
    const defaultValues: UserConfigObject = {
      devhdd0Path: '',
      rpcs3ExePath: '',
      mostPlayedInstrument: 'band',
      mostPlayedDifficulty: 3,
      packagesCatalogSortBy: 'name',
      songsCatalogSortBy: 'title',
      rpcs3NoGUI: false,
      downloadedContentDirPath: RockshelfFileSystemAPI.appDownloadableContentDir().path,
      downloadedContentFileName: 'hash',
    }

    const value = {
      ...defaultValues,
      ...oldConfig,
      ...newConfig,
    }

    await userConfigFilePath.write(JSON.stringify(value))
    return userConfigFilePath.path
  }

  static async deleteFile(): Promise<void> {
    const userConfigFile = RockshelfFileSystemAPI.userConfigFile()
    if (userConfigFile.exists) await userConfigFile.delete()
  }

  static async deletePackagesCacheFile() {
    const packagesCacheFile = RockshelfFileSystemAPI.packagesCacheFile()
    if (packagesCacheFile.exists) await packagesCacheFile.delete()
  }

  static async openUserDataDir(win: BrowserWindow) {
    const rockshelfUserDataDir = RockshelfFileSystemAPI.appUserDataDir()
    const error = await shell.openPath(rockshelfUserDataDir.path)
    if (error) {
      sendMessageBox(win, { type: 'error', code: 'openUserDataFolder' })
      return false
    }
    return true
  }

  static async validateFile(win: BrowserWindow) {
    const userConfig = await this.readFile()
    if (!userConfig) {
      sendDialog(win, 'corruptedUserConfig')
      return false
    }
    try {
      isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
      isRPCS3ExePathValid(userConfig.rpcs3ExePath)
    } catch (err) {
      sendDialog(win, 'corruptedUserConfig')
      return false
    }
    return true
  }
}
