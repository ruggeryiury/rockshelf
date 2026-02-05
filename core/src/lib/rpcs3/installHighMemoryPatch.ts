import { FileSystem } from '../../core'
import { sendMessage } from '../electron-lib/sendMessage'
import { useHandler } from '../electron-lib/useHandler'

export const installHighMemoryPatch = useHandler(async (win, _, devhdd0Path: string): Promise<boolean> => {
  const usrdir = FileSystem.dirs.rb3UsrDir(devhdd0Path)
  if (!usrdir.exists) await usrdir.mkDir(true)
  const highMemoryDTAFile = usrdir.gotoFile('dx_high_memory.dta')
  await highMemoryDTAFile.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
  sendMessage(win, { type: 'success', method: 'installHighMemoryPatch', code: '', module: 'rpcs3' })
  return true
})
