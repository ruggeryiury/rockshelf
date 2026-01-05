import { ipcRenderer, type IpcRendererEvent } from 'electron'
import type { winMinimize, winMaximize, winClose } from './core'
import type { isDevHDD0PathValid, MainErrorMessageObject } from './lib'
import type { checkUserConfig, selectDevHDD0FolderInit } from './utils'

type Promiseable<T> = T | Promise<T>

export const rockshelfAPI = {
  listeners: {
    onErrorMessage: (cb: (ev: IpcRendererEvent, message: MainErrorMessageObject) => Promiseable<void>) => ipcRenderer.on('@Error/message', cb),
  },
  topbar: {
    minimize: async () => (await ipcRenderer.invoke('@TopBar/minimize')) as ReturnType<typeof winMinimize>,
    maximize: async () => (await ipcRenderer.invoke('@TopBar/maximize')) as ReturnType<typeof winMaximize>,
    close: async () => (await ipcRenderer.invoke('@TopBar/close')) as ReturnType<typeof winClose>,
  },
  init: {
    checkUserConfig: async () => (await ipcRenderer.invoke('@Init/checkUserConfig')) as ReturnType<typeof checkUserConfig>,
    selectDevHDD0FolderInit: async () => (await ipcRenderer.invoke('@Init/selectDevHDD0FolderInit')) as ReturnType<typeof selectDevHDD0FolderInit>,
  },
  rbtools: {
    isDevHDD0PathValid: async (devhdd0Path: string) => (await ipcRenderer.invoke('@RBTools/isDevHDD0PathValid', devhdd0Path)) as ReturnType<typeof isDevHDD0PathValid>,
  },
} as const
