import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { windowClose, windowMaximize, windowMinimize } from './windowFunctions'
import { openUserDataFolder, readUserConfigFile, saveUserConfigFile, type UserConfigObject } from './userConfigData'
import { addHandler } from './handler'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>
export type InitHandlersArray = [string, HandlerFnType][]

export const initMainProcessHandlers = (): void => {
  const handlers: InitHandlersArray = [
    // Window
    ['windowClose', windowClose],
    ['windowMaximize', windowMaximize],
    ['windowMinimize', windowMinimize],
    // // File System
    ['openUserDataFolder', openUserDataFolder],
    ['readUserConfigFile', readUserConfigFile],
    ['saveUserConfigFile', (_, __, newConfig: Partial<UserConfigObject>) => saveUserConfigFile(newConfig)],
    // // RPCS3
    // ['@RPCS3/getInstrumentScoresData', getInstrumentScoresData],
    // ['@RPCS3/getPackagesData', getPackagesData],
    // ['@RPCS3/getRB3Data', getRB3Data],
    // ['@RPCS3/getSaveData', getSaveData],
    // ['@RPCS3/installHighMemoryPatch', installHighMemoryPatch],
    // ['@RPCS3/installPKGFile', installPKGFile],
    // ['@RPCS3/installQuickConfig', installQuickConfig],
    // ['@RPCS3/selectDevhdd0Folder', selectDevhdd0Folder],
    // ['@RPCS3/selectPKGFile', selectPKGFile],
    // ['@RPCS3/selectRPCS3Exe', selectRPCS3Exe],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
