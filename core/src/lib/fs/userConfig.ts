import type { ScoreDataInstrumentTypes } from 'rbtools'
import { FileSystem } from '../../core'
import { shell } from 'electron'
import { useHandler } from '../electron-lib/useHandler'
import { sendMessage } from '../electron-lib/sendMessage'

export interface UserConfigObj {
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
 * @returns {Promise<boolean>}
 */
export const openUserData = useHandler(async (win, __): Promise<boolean> => {
  const error = await shell.openPath(FileSystem.dirs.userDataDirPath.path)
  if (error) sendMessage(win, { type: 'error', module: 'generic', code: 'debug', method: 'openUserData' })
  return Boolean(error)
})

/**
 * Reads and parses the user configuration file. Returns `undefined` if the file does not exist.
 * - - - -
 * @returns {Promise<UserConfig | undefined>}
 */
export const readUserConfig = async (): Promise<UserConfigObj | undefined> => {
  const userConfigFile = FileSystem.files.userConfigFilePath()
  if (userConfigFile.exists) return await userConfigFile.readJSON<UserConfigObj>()
}

export const saveUserConfig = useHandler(async (_, __, newConfig: Partial<UserConfigObj>): Promise<string> => {
  const userConfigFilePath = FileSystem.files.userConfigFilePath()
  const oldConfig = await readUserConfig()
  const value: UserConfigObj = {
    devhdd0Path: '',
    rpcs3ExePath: '',
    mostPlayedInstrument: 'band',
    mostPlayedDifficulty: 3,
    ...oldConfig,
    ...newConfig,
  }

  await userConfigFilePath.write(JSON.stringify(value))
  return userConfigFilePath.path
})
