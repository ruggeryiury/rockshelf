import { readUserConfigFile, sendDialog, useHandler } from '../core.exports'
import { rpcs3GetRB3Stats as getStats, type RockBand3Data, isRPCS3Devhdd0PathValid, isRPCS3ExePathValid } from '../lib/rbtools/lib.exports'

/**
 * Retrieves data from Rock Band 3 installation on the RPCS3 emulator.
 */
export const rpcs3GetRB3Stats = useHandler(async (win, __): Promise<false | RockBand3Data> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  try {
    const devhdd0Path = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
    const rpcs3ExePath = isRPCS3ExePathValid(userConfig.rpcs3ExePath)
    return await getStats(devhdd0Path, rpcs3ExePath)
  } catch (err) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }
})
