import { FileSystem } from '../../core'
import { sendMessage } from '../electron-lib/sendMessage'
import { useHandlerWithUserConfig } from '../electron-lib/useHandler'

export const installHighMemoryPatch = useHandlerWithUserConfig(async (win, _, { devhdd0Path }): Promise<boolean> => {
  const usrdir = FileSystem.dirs.rb3BLUS30463(devhdd0Path).gotoDir('USRDIR')
  if (!usrdir.exists) await usrdir.mkDir(true)
  const highMemoryDTAFile = usrdir.gotoFile('dx_high_memory.dta')
  await highMemoryDTAFile.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
  sendMessage(win, { type: 'success', method: 'installHighMemoryPatch', code: '', module: 'rpcs3' })
  return true
})
