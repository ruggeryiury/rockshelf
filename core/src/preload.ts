/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, shell, webUtils, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { Promisable } from 'type-fest'
import type { openUserDataFolder, readUserConfigFile, MessageBoxObject, saveUserConfigFile, UserConfigObject, windowClose, windowMaximize, windowMinimize, BuzyLoadInitObject, BuzyLoadScreenSenderObject, BuzyLoadErrorObject } from './core.exports'
import type { deletePackageThumbnails, deleteUserConfigAndRestart, getDTACatalog, installHighMemoryPatch, installPKGFile, refreshPackagesData, rpcs3GetInstrumentScores, rpcs3GetPackagesData, rpcs3GetRB3Stats, rpcs3GetSaveDataStats, selectDevhdd0Dir, SelectPKGFileReturnObject, selectPKGFileToInstall, selectRPCS3Exe, testUserConfig } from './controllers.exports'
import type { ParsedRB3SaveData } from 'rbtools'
import type { DTACatalogTypes } from './lib.exports'
import type { FatalErrorObject } from './lib/senders/fatalError'

const invoke = ipcRenderer.invoke.bind(ipcRenderer)
const on = ipcRenderer.on.bind(ipcRenderer)

export type OnBuzyLoadCallback = (event: IpcRendererEvent, func: BuzyLoadScreenSenderObject | BuzyLoadInitObject | BuzyLoadErrorObject) => void
export type OnDialogScreenCallback = (event: IpcRendererEvent, code: string) => Promisable<any>
export type OnLocaleRequestCallback = (event: IpcRendererEvent, uuid: string, key: string) => void
export type OnMessageCallback = (event: IpcRendererEvent, message: MessageBoxObject) => Promisable<any>
export type OnRendererConsoleCallback = (event: IpcRendererEvent, value: any) => Promisable<any>
export type OnFatalErrorCallback = (event: IpcRendererEvent, errObject: FatalErrorObject) => Promisable<any>

export const rockshelfAPI = {
  // #region Listeners
  onBuzyLoad(callback: OnBuzyLoadCallback): IpcRenderer {
    return on('sendBuzyLoad', callback)
  },
  onDialog(callback: OnDialogScreenCallback): IpcRenderer {
    return on('sendDialog', callback)
  },
  onRendererConsole(callback: OnRendererConsoleCallback): IpcRenderer {
    return on('sendRendererConsole', callback)
  },
  onFatalError(callback: OnFatalErrorCallback): IpcRenderer {
    return on('sendFatalError', callback)
  },
  /**
   * Listens for small messages from the main process.
   * - - - -
   * @param {OnMessageCallback} callback The callback function to handle the message event.
   * @returns {IpcRenderer}
   */
  onMessage(callback: OnMessageCallback): IpcRenderer {
    return on('sendMessageBox', callback)
  },
  /**
   * Listens for requests to localized values.
   * - - - -
   * @param {(event: IpcRendererEvent, uuid: string, key: string) => Promise<string>} callback The callback function to handle the localized string request.
   */
  onLocaleRequest(callback: OnLocaleRequestCallback): IpcRenderer {
    return on('getLocaleStringFromRenderer', callback)
  },
  /**
   * Sends a localized string to the main process. This function must be called inside the `onLocaleRequest` listener to get the request UUID.
   * - - - -
   * @param {string} uuid A unique
   * @param {string} text The localized string you want to send to the main process.
   */
  sendLocale(uuid: string, text: string): void {
    return ipcRenderer.send(`sendLocale/${uuid}`, text)
  },

  /**
   * Open an external link in the default web browser.
   * - - - -
   * @param {string} url The URL to open.
   * @returns {Promise<void>}
   */
  async openExternalLink(url: string): Promise<void> {
    return await shell.openExternal(url)
  },
  /**
   * Convert a `File` object or an array of `File` objects to their respective file paths.
   * - - - -
   * @param {T} files The File or array of Files to convert.
   * @returns {RT}
   */
  fileToPath<T extends File | File[], RT extends T extends File ? string : string[]>(files: T): RT {
    if (Array.isArray(files)) {
      const filesPath: string[] = []

      for (const file of files) {
        const path = webUtils.getPathForFile(file as File)
        filesPath.push(path)
      }

      return filesPath as RT
    }

    const path = webUtils.getPathForFile(files)
    return path as RT
  },

  /**
   * Close the application window.
   * - - - -
   * @returns {Promise<void>}
   */
  windowClose: async (): Promise<ReturnType<typeof windowClose>> => await invoke('windowClose'),
  /**
   * Minimize the application window.
   * - - - -
   * @returns {Promise<void>}
   */
  windowMinimize: async (): Promise<ReturnType<typeof windowMinimize>> => await invoke('windowMinimize'),
  /**
   * Maximize the application window. Returns true if the window is maximized, false otherwise.
   * - - - -
   * @returns {Promise<boolean>}
   */
  windowMaximize: async (): Promise<ReturnType<typeof windowMaximize>> => await invoke('windowMaximize'),

  deleteUserConfigAndRestart: async (): ReturnType<typeof deleteUserConfigAndRestart> => await invoke('deleteUserConfigAndRestart'),
  getDTACatalog: async (selectedIndex: number, type?: DTACatalogTypes): ReturnType<typeof getDTACatalog> => await invoke('getDTACatalog', selectedIndex, type),
  installHighMemoryPatch: async (): ReturnType<typeof installHighMemoryPatch> => await invoke('installHighMemoryPatch'),
  installPKGFile: async (selectedPKG: SelectPKGFileReturnObject): ReturnType<typeof installPKGFile> => await invoke('installPKGFile', selectedPKG),
  openFolderInExplorer: async (folderPath: string): ReturnType<typeof getDTACatalog> => await invoke('openFolderInExplorer', folderPath),
  openUserDataFolder: async (): ReturnType<typeof openUserDataFolder> => await invoke('openUserDataFolder'),
  readUserConfigFile: async (): ReturnType<typeof readUserConfigFile> => await invoke('readUserConfigFile'),
  refreshPackagesData: async (): ReturnType<typeof refreshPackagesData> => await invoke('refreshPackagesData'),
  rpcs3GetInstrumentScores: async (saveData: ParsedRB3SaveData): ReturnType<typeof rpcs3GetInstrumentScores> => await invoke('rpcs3GetInstrumentScores', saveData),
  rpcs3GetPackagesData: async (forceUpdate: boolean = false): ReturnType<typeof rpcs3GetPackagesData> => await invoke('rpcs3GetPackagesData', forceUpdate),
  rpcs3GetRB3Stats: async (): ReturnType<typeof rpcs3GetRB3Stats> => await invoke('rpcs3GetRB3Stats'),
  rpcs3GetSaveDataStats: async (): ReturnType<typeof rpcs3GetSaveDataStats> => await invoke('rpcs3GetSaveDataStats'),
  saveUserConfigFile: async (newConfig?: Partial<UserConfigObject>): ReturnType<typeof saveUserConfigFile> => await invoke('saveUserConfigFile', newConfig),
  selectDevhdd0Dir: async (): ReturnType<typeof selectDevhdd0Dir> => await invoke('selectDevhdd0Dir'),
  selectPKGFileToInstall: async (): ReturnType<typeof selectPKGFileToInstall> => await invoke('selectPKGFileToInstall'),
  selectRPCS3Exe: async (): ReturnType<typeof selectRPCS3Exe> => await invoke('selectRPCS3Exe'),
  testError: async (message?: string): ReturnType<typeof testUserConfig> => await invoke('testError', message),
  testUserConfig: async (): ReturnType<typeof testUserConfig> => await invoke('testUserConfig'),
  deletePackageThumbnails: async (): ReturnType<typeof deletePackageThumbnails> => await invoke('deletePackageThumbnails'),
} as const
