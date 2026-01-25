import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import { getBrowserWindowByEvent } from '../../lib'

type HandlerCallbackFn = (win: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => any

export const addHandler = (channel: string, cb: HandlerCallbackFn) => {
  ipcMain.handle(channel, (event, ...args) => cb(getBrowserWindowByEvent(event), event, ...args))
}
