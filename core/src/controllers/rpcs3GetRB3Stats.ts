import { rpcs3GetRB3Stats as getStats, isRPCS3Devhdd0PathValid, isRPCS3ExePathValid, type RockBand3Data } from 'rbtools/lib'
import { readUserConfigFile, sendMessage, useHandler } from '../core.exports'

export const rpcs3GetRB3Stats = useHandler(async (win, __): Promise<false | RockBand3Data> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendMessage(win, { method: 'getRPCS3Stats', type: 'error', code: 'noUserConfigFile' })
    return false
  }

  const devhdd0Path = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
  const rpcs3ExePath = isRPCS3ExePathValid(userConfig.rpcs3ExePath)
  return await getStats(devhdd0Path, rpcs3ExePath)
})
