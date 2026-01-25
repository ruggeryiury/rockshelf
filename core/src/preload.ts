import { ipcRenderer } from 'electron'
import type { winClose, winMaximize, winMinimize } from './lib'

export const rockshelfAPI = {
  TopBar: {
    async minimize(): Promise<ReturnType<typeof winMinimize>> {
      return await ipcRenderer.invoke('@TopBar/minimize')
    },
    async maximize(): Promise<ReturnType<typeof winMaximize>> {
      return await ipcRenderer.invoke('@TopBar/maximize')
    },
    async close(): Promise<ReturnType<typeof winClose>> {
      return await ipcRenderer.invoke('@TopBar/close')
    },
  },
} as const
