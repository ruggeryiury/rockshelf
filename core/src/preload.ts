import { ipcRenderer } from 'electron'
import type { winClose, winMaximize, winMinimize } from './lib/win/topbarFuncs'

export const rockshelfAPI = {
  topbar: {
    minimize: async () => (await ipcRenderer.invoke('@TopBar/minimize')) as ReturnType<typeof winMinimize>,
    maximize: async () => (await ipcRenderer.invoke('@TopBar/maximize')) as ReturnType<typeof winMaximize>,
    close: async () => (await ipcRenderer.invoke('@TopBar/close')) as ReturnType<typeof winClose>,
  },
} as const
