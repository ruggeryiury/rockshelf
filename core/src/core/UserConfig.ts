import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { FS } from '../core'

export interface UserConfig {
  devhdd0Path: string
  rpcs3ExePath: string
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

export const saveUserConfigOnDisk = async (_: BrowserWindow, __: IpcMainInvokeEvent, options: Partial<UserConfig>): Promise<true> => {
  const configPath = FS.userConfigFile()
  const configDefault: UserConfig = {
    devhdd0Path: '',
    rpcs3ExePath: '',
  }

  const oldConfig = await readUserConfigFilePath()
  if (!oldConfig) {
    const newConfig: UserConfig = {
      ...configDefault,
      ...options,
    }

    await configPath.write(JSON.stringify(newConfig))
    return true
  }

  const newConfig: UserConfig = {
    ...configDefault,
    ...oldConfig,
    ...options,
  }

  await configPath.write(JSON.stringify(newConfig))
  return true
}
