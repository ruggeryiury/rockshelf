import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { addHandler, getInstrumentScoresData, getPackagesData, getRB3Data, getSaveData, installHighMemoryPatch, installPKGFile, installQuickConfig, openUserData, readUserConfig, saveUserConfig, selectDevhdd0Folder, selectPKGFile, selectRPCS3Exe, winClose, winMaximize, winMinimize } from '../lib'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>

export type InitHandlersArray = [string, HandlerFnType][]

export const InitHandlers = (): void => {
  const handlers: InitHandlersArray = [
    // Window
    ['@Window/close', winClose],
    ['@Window/maximize', winMaximize],
    ['@Window/minimize', winMinimize],

    // File System
    ['@FileSystem/userConfig/openUserData', openUserData],
    ['@FileSystem/userConfig/readUserConfig', readUserConfig],
    ['@FileSystem/userConfig/saveUserConfig', saveUserConfig],

    // RPCS3

    ['@RPCS3/getInstrumentScoresData', getInstrumentScoresData],
    ['@RPCS3/getPackagesData', getPackagesData],
    ['@RPCS3/getRB3Data', getRB3Data],
    ['@RPCS3/getSaveData', getSaveData],
    ['@RPCS3/installHighMemoryPatch', installHighMemoryPatch],
    ['@RPCS3/installPKGFile', installPKGFile],
    ['@RPCS3/installQuickConfig', installQuickConfig],
    ['@RPCS3/selectDevhdd0Folder', selectDevhdd0Folder],
    ['@RPCS3/selectPKGFile', selectPKGFile],
    ['@RPCS3/selectRPCS3Exe', selectRPCS3Exe],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
