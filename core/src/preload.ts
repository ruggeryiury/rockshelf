import { ipcRenderer, type IpcRendererEvent } from 'electron'
import type { checkUserConfig, readUserConfigFilePath, saveUserConfigOnDisk, selectDevHDD0FolderInit, selectRPCS3ExeFileInit, UserConfig } from './core'
import type { getRPCS3InstalledGamesStats, getSaveFileData, installHighMemotyPatch, isDevHDD0PathValid, isRPCS3ExePathValid, MessagePopUpOptions, openUserDataFolder, winClose, winMaximize, winMinimize } from './lib'

type Promiseable<T> = T | Promise<T>

export const rockshelfAPI = {
  listeners: {
    onPopUpMessage: (cb: (ev: IpcRendererEvent, message: MessagePopUpOptions) => Promiseable<void>) => ipcRenderer.on('@PopUp/message', cb),
  },
  topbar: {
    minimize: async () => (await ipcRenderer.invoke('@TopBar/minimize')) as ReturnType<typeof winMinimize>,
    maximize: async () => (await ipcRenderer.invoke('@TopBar/maximize')) as ReturnType<typeof winMaximize>,
    close: async () => (await ipcRenderer.invoke('@TopBar/close')) as ReturnType<typeof winClose>,
    openUserDataFolder: async () => (await ipcRenderer.invoke('@TopBar/openUserDataFolder')) as ReturnType<typeof openUserDataFolder>,
  },
  initFunctions: {
    selectDevHDD0FolderInit: async () => (await ipcRenderer.invoke('@InitFunctions/selectDevHDD0FolderInit')) as ReturnType<typeof selectDevHDD0FolderInit>,
    selectRPCS3ExeFileInit: async (rpcs3ExeLocale: string) => (await ipcRenderer.invoke('@InitFunctions/selectRPCS3ExeFileInit', rpcs3ExeLocale)) as ReturnType<typeof selectRPCS3ExeFileInit>,
  },
  userConfig: {
    checkUserConfig: async () => (await ipcRenderer.invoke('@UserConfig/checkUserConfig')) as ReturnType<typeof checkUserConfig>,
    readUserConfigFilePath: async () => (await ipcRenderer.invoke('@UserConfig/readUserConfigFilePath')) as ReturnType<typeof readUserConfigFilePath>,
    saveUserConfigOnDisk: async (options: Partial<UserConfig>) => (await ipcRenderer.invoke('@UserConfig/saveUserConfigOnDisk', options)) as ReturnType<typeof saveUserConfigOnDisk>,
  },
  rbtools: {
    getRPCS3InstalledGamesStats: async (devhdd0Path: string, rpcs3exePath: string) => (await ipcRenderer.invoke('@RBTools/getRPCS3InstalledGamesStats', devhdd0Path, rpcs3exePath)) as ReturnType<typeof getRPCS3InstalledGamesStats>,
    getSaveFileData: async (devhdd0Path: string) => (await ipcRenderer.invoke('@RBTools/getSaveFileData', devhdd0Path)) as ReturnType<typeof getSaveFileData>,
    installHighMemotyPatch: async (devhdd0Path: string) => (await ipcRenderer.invoke('@RBTools/installHighMemotyPatch', devhdd0Path)) as ReturnType<typeof installHighMemotyPatch>,
    isDevHDD0PathValid: async (devhdd0Path: string) => (await ipcRenderer.invoke('@RBTools/isDevHDD0PathValid', devhdd0Path)) as ReturnType<typeof isDevHDD0PathValid>,
    isRPCS3ExePathValid: async (rpcs3exePath: string) => (await ipcRenderer.invoke('@RBTools/isRPCS3ExePathValid', rpcs3exePath)) as ReturnType<typeof isRPCS3ExePathValid>,
  },
} as const
