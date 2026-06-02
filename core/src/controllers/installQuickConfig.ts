import type { FilePathLikeTypes } from 'node-lib'
import { sendMessageBox, useHandler } from '../core.exports'
import { isRPCS3ExePathValid, type QuickConfigType } from '../lib/rbtools/lib.exports'
import { RBTools } from '../lib/rbtools'

export const installQuickConfig = useHandler(async (win, __, rpcs3ExePath: FilePathLikeTypes, configType: QuickConfigType): Promise<boolean> => {
  const rpcs3Exe = isRPCS3ExePathValid(rpcs3ExePath)
  const configYmlFile = RBTools.resFolder.gotoFile(`${configType}.yml`)
  const configFolder = rpcs3Exe.gotoDir('config/custom_configs/')
  const rb3ConfigFile = configFolder.gotoFile('config_BLUS30463.yml')
  if (!configFolder.exists) await configFolder.mkDir(true)
  await configYmlFile.copy(rb3ConfigFile, true)
  sendMessageBox(win, { type: 'success', code: 'installQuickConfig' })
  return true
})
