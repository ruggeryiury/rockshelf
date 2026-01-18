import { ipcRenderer, shell, webUtils, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { checkUserConfig, fetchRPCS3Data, readUserConfigFilePath, saveUserConfigOnDisk, selectDevHDD0FolderInit, selectRPCS3ExeFileInit, UserConfig } from './core'
import type { installHighMemoryPatch, isDevHDD0PathValid, isRPCS3ExePathValid, MessagePopUpOptions, openUserDataFolder, winClose, winMaximize, winMinimize } from './lib'
import type { Promisable } from 'type-fest'

export const rockshelfAPI = {
  listeners: {
    onPopUpMessage(cb: (ev: IpcRendererEvent, message: MessagePopUpOptions) => Promisable<void>): IpcRenderer {
      return ipcRenderer.on('@PopUp/message', cb)
    },
  },
  topbar: {
    async minimize(): Promise<ReturnType<typeof winMinimize>> {
      return await ipcRenderer.invoke('@TopBar/minimize')
    },
    async maximize(): Promise<ReturnType<typeof winMaximize>> {
      return await ipcRenderer.invoke('@TopBar/maximize')
    },
    async close(): Promise<ReturnType<typeof winClose>> {
      return await ipcRenderer.invoke('@TopBar/close')
    },
    async openUserDataFolder(): ReturnType<typeof openUserDataFolder> {
      return await ipcRenderer.invoke('@TopBar/openUserDataFolder')
    },
  },
  initFunctions: {
    async selectDevHDD0FolderInit(): ReturnType<typeof selectDevHDD0FolderInit> {
      return await ipcRenderer.invoke('@InitFunctions/selectDevHDD0FolderInit')
    },
    async selectRPCS3ExeFileInit(rpcs3ExeLocale: string): ReturnType<typeof selectRPCS3ExeFileInit> {
      return await ipcRenderer.invoke('@InitFunctions/selectRPCS3ExeFileInit', rpcs3ExeLocale)
    },
    async fetchRPCS3Data(devhdd0FolderPath: string, rpcs3ExeFilePath: string): Promise<ReturnType<typeof fetchRPCS3Data>> {
      return await ipcRenderer.invoke('@InitFunctions/fetchRPCS3Data', devhdd0FolderPath, rpcs3ExeFilePath)
    },
  },
  userConfig: {
    async checkUserConfig(): Promise<ReturnType<typeof checkUserConfig>> {
      return await ipcRenderer.invoke('@UserConfig/checkUserConfig')
    },
    async readUserConfigFilePath(): ReturnType<typeof readUserConfigFilePath> {
      return await ipcRenderer.invoke('@UserConfig/readUserConfigFilePath')
    },
    async saveUserConfigOnDisk(options: Partial<UserConfig>): ReturnType<typeof saveUserConfigOnDisk> {
      return await ipcRenderer.invoke('@UserConfig/saveUserConfigOnDisk', options)
    },
  },
  rbtools: {
    async installHighMemoryPatch(devhdd0Path: string): ReturnType<typeof installHighMemoryPatch> {
      return await ipcRenderer.invoke('@RBTools/installHighMemoryPatch', devhdd0Path)
    },
    async isDevHDD0PathValid(devhdd0Path: string): Promise<ReturnType<typeof isDevHDD0PathValid>> {
      return await ipcRenderer.invoke('@RBTools/isDevHDD0PathValid', devhdd0Path)
    },
    async isRPCS3ExePathValid(rpcs3exePath: string): Promise<ReturnType<typeof isRPCS3ExePathValid>> {
      return await ipcRenderer.invoke('@RBTools/isRPCS3ExePathValid', rpcs3exePath)
    },
  },
  utils: {
    async openExternalLink(url: string) {
      return await shell.openExternal(url)
    },
    fileToPath<T extends File | File[], RT extends T extends File ? string : string[]>(files: T): RT {
      if (Array.isArray(files)) {
        const filesPath: string[] = []

        for (const file of files) {
          const path = webUtils.getPathForFile(file)
          filesPath.push(path)
        }

        return filesPath as RT
      }

      const path = webUtils.getPathForFile(files)
      return path as RT
    },
  },
} as const
