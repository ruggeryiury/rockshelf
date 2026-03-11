import { RB3SaveData, type ParsedRB3SaveData } from 'rbtools'
import { getRB3SaveDataFile, readUserConfigFile, sendMessage, useHandler } from '../core.exports'
import { isRPCS3Devhdd0PathValid } from 'rbtools/lib'

export const rpcs3GetSaveDataStats = useHandler(async (win, __): Promise<false | ParsedRB3SaveData> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendMessage(win, { method: 'rpcs3GetSaveDataStats', type: 'error', code: 'noUserConfigFile' })
    return false
  }

  const devhdd0Path = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
  const rb3SaveDataPath = getRB3SaveDataFile(devhdd0Path)
  return await RB3SaveData.parseFromFile(rb3SaveDataPath)
})
