import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { pathLikeToDirPath } from 'node-lib'
import { activateMessagePopUp } from '../electron-lib/activateMessagePopUp'

export const installHighMemotyPatch = async (win: BrowserWindow, __: IpcMainInvokeEvent, devhdd0Path: string): Promise<true> => {
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  const highMemotyDTA = devhdd0.gotoFile('game/BLUS30463/USRDIR/dx_high_memory.dta')
  await highMemotyDTA.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
  activateMessagePopUp(win, { type: 'success', method: 'installHighMemotyPatch', code: 'success', module: 'rbtools' })
  return true
}
