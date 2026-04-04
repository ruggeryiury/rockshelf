import type { ScoreDataInstrumentTypes } from 'rbtools'
import { BrowserWindow, shell } from 'electron'
import { getPackagesCacheFile, getRockshelfUserDataDir, getUserConfigFile } from './fs'
import { sendMessageBox } from './rendererSenders'

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
}

/**
 * Opens the user configuration file in the system's file explorer.
 * - - - -
 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
 * @returns {Promise<boolean>}
 */
export const openUserDataFolder = async (win: BrowserWindow): Promise<boolean> => {
  const rockshelfUserDataDir = getRockshelfUserDataDir()
  const error = await shell.openPath(rockshelfUserDataDir.path)
  if (error) {
    sendMessageBox(win, { type: 'error', method: 'openUserDataFolder', code: 'openUserDataError' })
    return false
  }
  return true
}

/**
 * Reads and parses the user configuration file. Returns `undefined` if the file does not exist.
 * - - - -
 * @returns {Promise<UserConfig | undefined>}
 */
export const readUserConfigFile = async (): Promise<UserConfigObject | undefined> => {
  const userConfigFile = getUserConfigFile()
  if (userConfigFile.exists) return await userConfigFile.readJSON<UserConfigObject>()
}

export const saveUserConfigFile = async (newConfig?: Partial<UserConfigObject>): Promise<string> => {
  const userConfigFilePath = getUserConfigFile()
  const oldConfig = await readUserConfigFile()
  const defaultValues: UserConfigObject = {
    devhdd0Path: '',
    rpcs3ExePath: '',
    mostPlayedInstrument: 'band',
    mostPlayedDifficulty: 3,
  }

  const value: UserConfigObject = {
    ...defaultValues,
    ...oldConfig,
    ...newConfig,
  }

  await userConfigFilePath.write(JSON.stringify(value))
  return userConfigFilePath.path
}

export const deleteUserConfigFile = async (): Promise<void> => {
  const userConfigFile = getUserConfigFile()
  if (userConfigFile.exists) await userConfigFile.delete()
}

export const deletePackagesCacheFile = async (): Promise<void> => {
  const packagesCacheFile = getPackagesCacheFile()
  if (packagesCacheFile.exists) await packagesCacheFile.delete()
}
