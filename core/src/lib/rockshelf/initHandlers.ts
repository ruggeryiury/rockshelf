import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { addHandler, winClose, winMaximize, winMinimize } from '../../lib'

export type HandlerFnType = (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>

export const initHandlers = (): void => {
  const handlers: [string, HandlerFnType][] = [
    // Window
    ['@Window/minimize', winMinimize],
    ['@Window/maximize', winMaximize],
    ['@Window/close', winClose],
  ]
  for (const [channel, listeners] of handlers) addHandler(channel, listeners)
}
