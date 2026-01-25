import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'

export const useHandler = <T extends (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: Parameters<T extends (arg0: any, arg1: any, ...rest: infer R) => any ? R : never>) => ReturnType<T>>(fn: T) => fn
