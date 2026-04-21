import { FilePath, type FilePathLikeTypes } from 'node-lib'
import { RBTools } from '../../core.exports'
import { isRPCS3ExePathValid } from './isRPCS3ExePathValid'

export type QuickConfigType = 'recommended' | 'minimum' | 'potato'

/**
 * Install specific Rock Band 3 configurations for RPCS3. Returns the path of the custom Rock Band 3 configuration YAML file.
 * - - - -
 * @param {FilePathLikeTypes} rpcs3ExePath The path to the RPCS3 executable file.
 * @param {QuickConfigType} configType The type of the configuration you want to install.
 * @returns {Promise<FilePath>}
 */
export const installRPCS3QuickConfig = async (rpcs3ExePath: FilePathLikeTypes, configType: QuickConfigType): Promise<FilePath> => {
  const rpcs3Exe = isRPCS3ExePathValid(rpcs3ExePath)
  const configYmlFile = RBTools.resFolder.gotoFile(`${configType}.yml`)
  const configFolder = rpcs3Exe.gotoDir('config/custom_configs/')
  const rb3ConfigFile = configFolder.gotoFile('config_BLUS30463.yml')
  if (!configFolder.exists) await configFolder.mkDir(true)
  await configYmlFile.copy(rb3ConfigFile, true)

  return configYmlFile
}
