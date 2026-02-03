import { pathLikeToFilePath } from 'node-lib'
import { FileSystem } from '../../core'
import { useHandler } from '../electron-lib/useHandler'
import { sendMessage } from '../electron-lib/sendMessage'

export type QuickConfigType = 'recommended' | 'minimum' | 'potato'

export const installQuickConfig = useHandler(async (win, _, rpcs3ExePath: string, configType: QuickConfigType): Promise<boolean> => {
  const configYmlFile = FileSystem.dirs.packageBinDirPath.gotoFile(`rpcs3config/${configType}.yml`)
  const configFolder = pathLikeToFilePath(rpcs3ExePath).gotoDir('config/custom_configs/')
  const rb3ConfigFile = configFolder.gotoFile('config_BLUS30463.yml')
  if (!configFolder.exists) await configFolder.mkDir(true)
  await configYmlFile.copy(rb3ConfigFile, true)

  sendMessage(win, { type: 'success', method: 'installQuickConfig', code: 'success', module: 'rpcs3', messageValues: { config: configType } })
  return true
})
