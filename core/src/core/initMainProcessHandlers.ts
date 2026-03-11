import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { installHighMemoryPatch, rpcs3GetInstrumentScores, rpcs3GetRB3Stats, rpcs3GetSaveDataStats, selectDevhdd0Dir, selectPKGFileToInstall, selectRPCS3Exe } from '../controllers.exports'
import { openUserDataFolder, readUserConfigFile, saveUserConfigFile, windowClose, windowMaximize, windowMinimize, type UserConfigObject } from '../core.exports'
import { addHandler } from './handler'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>
export type InitHandlersArray = [string, HandlerFnType][]

export const initMainProcessHandlers = (): void => {
  const handlers: InitHandlersArray = [
    ['windowClose', windowClose],
    ['windowMaximize', windowMaximize],
    ['windowMinimize', windowMinimize],
    ['openUserDataFolder', openUserDataFolder],
    ['readUserConfigFile', readUserConfigFile],
    ['saveUserConfigFile', (_, __, newConfig: Partial<UserConfigObject>) => saveUserConfigFile(newConfig)],
    ['selectDevhdd0Dir', selectDevhdd0Dir],
    ['selectRPCS3Exe', selectRPCS3Exe],
    ['rpcs3GetRB3Stats', rpcs3GetRB3Stats],
    ['rpcs3GetSaveDataStats', rpcs3GetSaveDataStats],
    ['rpcs3GetInstrumentScores', rpcs3GetInstrumentScores],
    ['selectPKGFileToInstall', selectPKGFileToInstall],
    ['installHighMemoryPatch', installHighMemoryPatch],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
