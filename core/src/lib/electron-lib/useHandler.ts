import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'

/**
 * Identity helper used to strongly type IPC handlers.
 *
 * This function exists purely for type inference and does not
 * modify the handler in any way.
 * - - - -
 * @template {(window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => any} T
 * @param {T} fn The IPC handler function.
 * @returns {T} The same handler function with preserved types.
 */
export const useHandler = <T extends (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: Parameters<T extends (arg0: any, arg1: any, ...rest: infer R) => any ? R : never>) => ReturnType<T>>(fn: T) => fn
