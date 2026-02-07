import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import type { UserConfigObj } from '../fs/userConfig'

/**
 * Identity helper used to strongly type IPC handlers.
 *
 * This function exists purely for type inference and does not
 * modify the handler in any way.
 * - - - -
 * @param {T} fn The IPC handler function.
 * @returns {T} The same handler function with preserved types.
 */
export const useHandler = <T extends (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>>(fn: T): T => fn

/**
 * Identity helper used to strongly type IPC handlers.
 *
 * This function exists purely for type inference and does not
 * modify the handler in any way.
 * - - - -
 * @param {T} fn The IPC handler function.
 * @returns {T} The same handler function with preserved types.
 */
export const useHandlerWithUserConfig = <T extends (window: BrowserWindow, event: IpcMainInvokeEvent, userConfig: UserConfigObj, ...args: any[]) => Promisable<any>>(fn: T): T => fn
