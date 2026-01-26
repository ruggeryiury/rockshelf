import { ipcRenderer, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { RendererMessageObject, winClose, winMaximize, winMinimize } from './lib'
import type { Promisable } from 'type-fest'

export const rockshelfAPI = {
  listeners: {
    onMessage(callback: (event: IpcRendererEvent, message: RendererMessageObject) => Promisable<void>): IpcRenderer {
      return ipcRenderer.on('@Message', callback)
    },
  },
  window: {
    async minimize(): Promise<ReturnType<typeof winMinimize>> {
      return await ipcRenderer.invoke('@Window/minimize')
    },
    async maximize(): Promise<ReturnType<typeof winMaximize>> {
      return await ipcRenderer.invoke('@Window/maximize')
    },
    async close(): Promise<ReturnType<typeof winClose>> {
      return await ipcRenderer.invoke('@Window/close')
    },
  },
} as const
