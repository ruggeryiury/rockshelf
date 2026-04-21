import { readUserConfigFile, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { isRPCS3Devhdd0PathValid } from '../lib/rbtools/lib.exports'

/**
 * Installs the High Memory Patch on the Rock Band 3's USRDIR folder.
 */
export const installHighMemoryPatch = useHandler(async (win, _): Promise<boolean> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const usrdir = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path).gotoDir('game/BLUS30463/USRDIR')
  if (!usrdir.exists) await usrdir.mkDir(true)
  const highMemoryDTAFile = usrdir.gotoFile('dx_high_memory.dta')
  await highMemoryDTAFile.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
  sendMessageBox(win, { type: 'success', method: 'installHighMemoryPatch', code: '' })
  return true
})
