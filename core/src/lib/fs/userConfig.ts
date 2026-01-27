import type { ScoreDataInstrumentTypes } from 'rbtools'
import { FileSystem } from '../../core'
import { shell } from 'electron'
import { useHandler } from '../electron-lib/useHandler'

export interface UserConfigObj {
  /**
   * The preferred language of the user.
   */
  lang: string
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
 * @param {boolean} selected If `true`, opens the file directly; otherwise, opens the parent directory.
 * @returns {Promise<void>}
 */
export const openUserConfigOnExplorer = useHandler(async (_, __, selected: boolean = false): Promise<void> => {
  if (!selected) {
    await shell.openPath(FileSystem.files.userConfig().path)
    return
  }

  shell.showItemInFolder(FileSystem.files.userConfig().path)
})

/**
 * Reads and parses the user configuration file. Returns `undefined` if the file does not exist.
 * - - - -
 * @returns {Promise<UserConfig | undefined>}
 */
export const readUserConfig = async (): Promise<UserConfigObj | undefined> => {
  const userConfigFile = FileSystem.files.userConfig()
  if (userConfigFile.exists) return await userConfigFile.readJSON<UserConfigObj>()
}
