import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { addHandler, getRB3Data, installHighMemoryPatch, installQuickConfig, openUserData, readUserConfig, saveUserConfig, selectDevhdd0Folder, selectPKGFileToInstall, selectRPCS3Exe, winClose, winMaximize, winMinimize } from './lib'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>

export const initHandlers = (): void => {
  const handlers: [string, HandlerFnType][] = [
    // Window
    ['@Window/close', winClose],
    ['@Window/maximize', winMaximize],
    ['@Window/minimize', winMinimize],

    // File System
    ['@FileSystem/userConfig/openUserData', openUserData],
    ['@FileSystem/userConfig/readUserConfig', readUserConfig],
    ['@FileSystem/userConfig/saveUserConfig', saveUserConfig],

    // RPCS3
    ['@RPCS3/getRB3Data', getRB3Data],
    ['@RPCS3/installHighMemoryPatch', installHighMemoryPatch],
    ['@RPCS3/installQuickConfig', installQuickConfig],
    ['@RPCS3/selectDevhdd0Folder', selectDevhdd0Folder],
    ['@RPCS3/selectPKGFileToInstall', selectPKGFileToInstall],
    ['@RPCS3/selectRPCS3Exe', selectRPCS3Exe],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
