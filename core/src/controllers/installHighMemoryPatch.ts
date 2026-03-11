import { isRPCS3Devhdd0PathValid } from 'rbtools/lib'
import { readUserConfigFile, sendMessage, useHandler } from '../core.exports'

export const installHighMemoryPatch = useHandler(async (win, _): Promise<boolean> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendMessage(win, { method: 'rpcs3GetSaveDataStats', type: 'error', code: 'noUserConfigFile' })
    return false
  }

  const usrdir = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path).gotoDir('game/BLUS30463/USRDIR')
  if (!usrdir.exists) await usrdir.mkDir(true)
  const highMemoryDTAFile = usrdir.gotoFile('dx_high_memory.dta')
  await highMemoryDTAFile.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
  sendMessage(win, { type: 'success', method: 'installHighMemoryPatch', code: '' })
  return true
})
