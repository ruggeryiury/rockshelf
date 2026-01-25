import { BrowserWindow, type IpcMainEvent, type IpcMainInvokeEvent } from 'electron'

export const getBrowserWindowByEvent = (event: IpcMainEvent | IpcMainInvokeEvent) => {
  const win = BrowserWindow.fromId(event.sender.id)
  if (win) return win
  else throw new Error('Error when getting browser window object from emmited event')
}
