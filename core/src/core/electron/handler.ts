/* eslint-disable */
import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import type { Promisable } from 'type-fest'
import { getBrowserWindowFromEvent } from './getBrowserWindowFromEvent'

type HandlerListenerFuntion = (win: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => any

/**
 * Registers an IPC handler and automatically resolves the BrowserWindow
 * associated with the event.
 *
 * This is a small utility wrapper around `ipcMain.handle`.
 * - - - -
 * @param {string} channel The IPC channel name.
 * @param {HandlerListenerFuntion} listener The handler function to execute when the channel is invoked.
 * @returns {void}
 */
export const addHandler = (channel: string, listener: HandlerListenerFuntion): void => {
  ipcMain.handle(channel, (event, ...args) => listener(getBrowserWindowFromEvent(event), event, ...args))
}

/**
 * Helper used to strongly type IPC handlers.
 *
 * This function exists purely for type inference and does not
 * modify the handler in any way.
 * - - - -
 * @param {T} fn The IPC handler function.
 * @returns {T} The same handler function with preserved types.
 */
export const useHandler = <T extends (window: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>>(fn: T): T => fn
