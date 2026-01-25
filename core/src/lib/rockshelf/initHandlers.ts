import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { addHandler, winClose, winMaximize, winMinimize } from '../../lib'

export const initHandlers = () => {
  const handlers: [string, (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>][] = [
    // Window
    ['@Window/minimize', winMinimize],
    ['@Window/maximize', winMaximize],
    ['@Window/close', winClose],
  ]
  for (const [channel, cb] of handlers) addHandler(channel, cb)
}
