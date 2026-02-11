import { ipcRenderer, shell, webUtils, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { Promisable } from 'type-fest'
import type { installQuickConfig, getRB3Data, openUserData, QuickConfigType, readUserConfig, RendererMessageObject, saveUserConfig, selectDevhdd0Folder, UserConfigObj, winClose, winMaximize, winMinimize, selectRPCS3Exe, installHighMemoryPatch, selectPKGFile, installPKGFile, SelectPKGFileReturnObject, getPackagesData, getSaveData, getInstrumentScoresData } from './lib'
import type { ParsedRB3SaveData } from 'rbtools'

const invoke = ipcRenderer.invoke

export const rockshelfAPI = {
  listeners: {
    /**
     * Listens for messages from the main process.
     * - - - -
     * @param {(event: IpcRendererEvent, message: RendererMessageObject) => Promisable<void>} callback The callback function to handle the message event.
     * @returns {IpcRenderer}
     */
    onMessage(callback: (event: IpcRendererEvent, message: RendererMessageObject) => Promisable<void>): IpcRenderer {
      return ipcRenderer.on('@Message', callback)
    },
    /**
     * Listens for requests to localized values.
     * - - - -
     * @param {(event: IpcRendererEvent, uuid: string, key: string) => Promise<string>} callback The callback function to handle the localized string request.
     */
    onLocaleRequest(callback: (event: IpcRendererEvent, uuid: string, key: string) => Promisable<void>): IpcRenderer {
      return ipcRenderer.on('@LocaleRequest', callback)
    },
  },
  window: {
    /**
     * Close the application window.
     * - - - -
     * @returns {Promise<void>}
     */
    close: async (): Promise<ReturnType<typeof winClose>> => await invoke('@Window/close'),
    /**
     * Minimize the application window.
     * - - - -
     * @returns {Promise<void>}
     */
    minimize: async (): Promise<ReturnType<typeof winMinimize>> => await invoke('@Window/minimize'),
    /**
     * Maximize the application window. Returns true if the window is maximized, false otherwise.
     * - - - -
     * @returns {Promise<boolean>}
     */
    maximize: async (): Promise<ReturnType<typeof winMaximize>> => await invoke('@Window/maximize'),
  },
  fs: {
    userConfig: {
      openUserData: async (): ReturnType<typeof openUserData> => await invoke('@FileSystem/userConfig/openUserData'),
      readUserConfig: async (): ReturnType<typeof readUserConfig> => await invoke('@FileSystem/userConfig/readUserConfig'),
      saveUserConfig: async (newConfig: Partial<UserConfigObj>): ReturnType<typeof saveUserConfig> => await invoke('@FileSystem/userConfig/saveUserConfig', newConfig),
    },
  },
  pkg: {},
  rpcs3: {
    getInstrumentScoresData: async (userConfig: UserConfigObj, saveData: ParsedRB3SaveData): ReturnType<typeof getInstrumentScoresData> => await invoke('@RPCS3/getInstrumentScoresData', userConfig, saveData),
    getPackagesData: async (userConfig: UserConfigObj): ReturnType<typeof getPackagesData> => await invoke('@RPCS3/getPackagesData', userConfig),
    getRB3Data: async (userConfig: UserConfigObj): ReturnType<typeof getRB3Data> => await invoke('@RPCS3/getRB3Data', userConfig),
    getSaveData: async (userConfig: UserConfigObj): ReturnType<typeof getSaveData> => await invoke('@RPCS3/getSaveData', userConfig),
    installHighMemoryPatch: async (userConfig: UserConfigObj): ReturnType<typeof installHighMemoryPatch> => await invoke('@RPCS3/installHighMemoryPatch', userConfig),
    installPKGFile: async (userConfig: UserConfigObj, selectedPKG: SelectPKGFileReturnObject): ReturnType<typeof installPKGFile> => await invoke('@RPCS3/installPKGFile', userConfig, selectedPKG),
    installQuickConfig: async (userConfig: UserConfigObj, configType: QuickConfigType): ReturnType<typeof installQuickConfig> => await invoke('@RPCS3/installQuickConfig', userConfig, configType),
    selectDevhdd0Folder: async (): ReturnType<typeof selectDevhdd0Folder> => await invoke('@RPCS3/selectDevhdd0Folder'),
    selectPKGFile: async (): ReturnType<typeof selectPKGFile> => await invoke('@RPCS3/selectPKGFile'),
    selectRPCS3Exe: async (): ReturnType<typeof selectRPCS3Exe> => await invoke('@RPCS3/selectRPCS3Exe'),
  },
  utils: {
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
          const path = webUtils.getPathForFile(file)
          filesPath.push(path)
        }

        return filesPath as RT
      }

      const path = webUtils.getPathForFile(files)
      return path as RT
    },
    /**
     * Sends a localized string to the main process. This function must be called inside the `onLocaleRequest` listener to get the request UUID.
     * - - - -
     * @param {string} uuid A unique
     * @param {string} val The localized string you want to send to the main process.
     */
    sendLocale(uuid: string, val: string): void {
      return ipcRenderer.send(`@LocaleRequest/${uuid}`, val)
    },
  },
} as const
