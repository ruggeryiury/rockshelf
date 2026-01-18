import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { FS } from '../core'
import type { ScoreDataInstrumentTypes } from 'rbtools'

export interface UserConfig {
  devhdd0Path: string
  rpcs3ExePath: string
  mostPlayedInstrument: ScoreDataInstrumentTypes
  mostPlayedDifficulty: 0 | 1 | 2 | 3
}

export const checkUserConfig = (): boolean => {
  const configPath = FS.userConfigFile()
  return configPath.exists
}

export const readUserConfigFilePath = async (): Promise<UserConfig | false> => {
  const configPath = FS.userConfigFile()
  if (configPath.exists) return await configPath.readJSON<UserConfig>()
  return false
}

export const saveUserConfigOnDisk = async (_: BrowserWindow, __: IpcMainInvokeEvent, options: Partial<UserConfig>): Promise<UserConfig> => {
  const configPath = FS.userConfigFile()
  const configDefault: UserConfig = {
    devhdd0Path: '',
    rpcs3ExePath: '',
    mostPlayedInstrument: 'band',
    mostPlayedDifficulty: 3,
  }

  const oldConfig = await readUserConfigFilePath()
  if (!oldConfig) {
    const newConfig: UserConfig = {
      ...configDefault,
      ...options,
    }

    await configPath.write(JSON.stringify(newConfig))
    return newConfig
  }

  const newConfig: UserConfig = {
    ...configDefault,
    ...oldConfig,
    ...options,
  }

  await configPath.write(JSON.stringify(newConfig))
  return newConfig
}
