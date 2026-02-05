import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { addHandler, getRB3Data, installHighMemoryPatch, installPKGFile, installQuickConfig, openUserData, readUserConfig, saveUserConfig, selectDevhdd0Folder, selectPKGFile, selectRPCS3Exe, winClose, winMaximize, winMinimize } from '../lib'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>

export const InitHandlers = (): void => {
  const handlers: [string, HandlerFnType][] = [
    // Window
    ['@Window/close', winClose],
    ['@Window/maximize', winMaximize],
    ['@Window/minimize', winMinimize],

    // File System
    ['@FileSystem/userConfig/openUserData', openUserData],
    ['@FileSystem/userConfig/readUserConfig', readUserConfig],
    ['@FileSystem/userConfig/saveUserConfig', saveUserConfig],

    // PKG

    // RPCS3
    ['@RPCS3/getRB3Data', getRB3Data],
    ['@RPCS3/installHighMemoryPatch', installHighMemoryPatch],
    ['@RPCS3/installPKGFile', installPKGFile],
    ['@RPCS3/installQuickConfig', installQuickConfig],
    ['@RPCS3/selectDevhdd0Folder', selectDevhdd0Folder],
    ['@RPCS3/selectRPCS3Exe', selectRPCS3Exe],
    ['@RPCS3/selectPKGFile', selectPKGFile],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
