import { app } from 'electron'
import { DirPath } from 'node-lib'

export interface UserConfig {
  devhdd0Path: string
}

export const getUserDataFolderPath = (): DirPath => {
  return DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf')
}

export const getUserConfigFilePath = () => {
  return getUserDataFolderPath().gotoFile('config.json')
}

export const readUserConfigFilePath = async (): Promise<UserConfig | false> => {
  const configPath = getUserConfigFilePath()
  if (configPath.exists) return await configPath.readJSON<UserConfig>()
  return false
}
