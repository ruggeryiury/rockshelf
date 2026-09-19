import { type BrowserWindow, type IpcMainInvokeEvent, ipcMain } from 'electron'
import type { Promisable } from 'type-fest'

import { ErrorHandler } from '../api/ErrorHandler'
import { getBrowserWindowFromEvent } from './getBrowserWindowFromEvent'

type HandlerListenerFuntion = (win: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promisable<any>
const handle = ipcMain.handle.bind(ipcMain)

/**
 * Registers an IPC handler and automatically resolves the `BrowserWindow` associated with the event.
 *
 * This is a small utility wrapper around `ipcMain.handle`, using the [ErrorHandler](../api/ErrorHandler.ts) API to properly catch errors during the invokation process.
 * - - - -
 * @param {string} channel The IPC channel name.
 * @param {HandlerListenerFuntion} listener The handler function to execute when the channel is invoked.
 * @returns {void}
 */
export const addHandler = (channel: string, listener: HandlerListenerFuntion): void => {
	handle(channel, async (event, ...args) => {
		const win = getBrowserWindowFromEvent(event)
		try {
			return await listener(win, event, ...args)
		} catch (err) {
			if (err instanceof Error) ErrorHandler.send(win, err)
			return false
		}
	})
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
