import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { deleteUserConfigAndRestart, installHighMemoryPatch, installPKGFile, rpcs3GetInstrumentScores, rpcs3GetRB3Stats, rpcs3GetSaveDataStats, selectDevhdd0Dir, selectPKGFileToInstall, selectRPCS3Exe, testUserConfig } from '../controllers.exports'
import { openUserDataFolder, readUserConfigFile, saveUserConfigFile, windowClose, windowMaximize, windowMinimize, type UserConfigObject } from '../core.exports'
import { addHandler } from './handler'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>
export type InitHandlersArray = [string, HandlerFnType][]

export const initMainProcessHandlers = (): void => {
  const handlers: InitHandlersArray = [
    ['deleteUserConfigAndRestart', deleteUserConfigAndRestart],
    ['installHighMemoryPatch', installHighMemoryPatch],
    ['installPKGFile', installPKGFile],
    ['openUserDataFolder', openUserDataFolder],
    ['readUserConfigFile', readUserConfigFile],
    ['rpcs3GetInstrumentScores', rpcs3GetInstrumentScores],
    ['rpcs3GetRB3Stats', rpcs3GetRB3Stats],
    ['rpcs3GetSaveDataStats', rpcs3GetSaveDataStats],
    ['saveUserConfigFile', (_, __, newConfig: Partial<UserConfigObject>) => saveUserConfigFile(newConfig)],
    ['selectDevhdd0Dir', selectDevhdd0Dir],
    ['selectPKGFileToInstall', selectPKGFileToInstall],
    ['selectRPCS3Exe', selectRPCS3Exe],
    ['testUserConfig', testUserConfig],
    ['windowClose', windowClose],
    ['windowMaximize', windowMaximize],
    ['windowMinimize', windowMinimize],
    [
      'testError',
      (_, __, message?: string) => {
        throw new Error(message || '')
      },
    ],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
