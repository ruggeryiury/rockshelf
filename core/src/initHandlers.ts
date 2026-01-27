import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { addHandler, openUserConfigOnExplorer, readUserConfig, selectDevhdd0Folder, selectRPCS3Exe, winClose, winMaximize, winMinimize } from './lib'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>

export const initHandlers = (): void => {
  const handlers: [string, HandlerFnType][] = [
    // Window
    ['@Window/minimize', winMinimize],
    ['@Window/maximize', winMaximize],
    ['@Window/close', winClose],

    // File System
    ['@FileSystem/userConfig/openUserConfigOnExplorer', openUserConfigOnExplorer],
    ['@FileSystem/userConfig/readUserConfig', readUserConfig],

    // RPCS3
    ['@RPCS3/selectDevhdd0Folder', selectDevhdd0Folder],
    ['@RPCS3/selectRPCS3Exe', selectRPCS3Exe],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
