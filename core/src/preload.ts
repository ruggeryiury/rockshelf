import { ipcRenderer, shell, webUtils, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { Promisable } from 'type-fest'
import type { installQuickConfig, getRB3Data, openUserData, QuickConfigType, readUserConfig, RendererMessageObject, saveUserConfig, selectDevhdd0Folder, UserConfigObj, winClose, winMaximize, winMinimize, selectRPCS3Exe, installHighMemoryPatch, selectPKGFileToInstall } from './lib'

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
    async close(): Promise<ReturnType<typeof winClose>> {
      return await ipcRenderer.invoke('@Window/close')
    },
    /**
     * Minimize the application window.
     * - - - -
     * @returns {Promise<void>}
     */
    async minimize(): Promise<ReturnType<typeof winMinimize>> {
      return await ipcRenderer.invoke('@Window/minimize')
    },
    /**
     * Maximize the application window. Returns true if the window is maximized, false otherwise.
     * - - - -
     * @returns {Promise<boolean>}
     */
    async maximize(): Promise<ReturnType<typeof winMaximize>> {
      return await ipcRenderer.invoke('@Window/maximize')
    },
  },
  fs: {
    userConfig: {
      openUserData: async (): ReturnType<typeof openUserData> => {
        return await ipcRenderer.invoke('@FileSystem/userConfig/openUserData')
      },
      readUserConfig: async (): ReturnType<typeof readUserConfig> => {
        return await ipcRenderer.invoke('@FileSystem/userConfig/readUserConfig')
      },
      saveUserConfig: async (newConfig: Partial<UserConfigObj>): ReturnType<typeof saveUserConfig> => {
        return await ipcRenderer.invoke('@FileSystem/userConfig/saveUserConfig', newConfig)
      },
    },
  },
  rpcs3: {
    deleteTempPKGFile: async (tempFolderPath: string) => {
      return await ipcRenderer.invoke('@RPCS3/deleteTempPKGFile', tempFolderPath)
    },
    extractPKGFileToTemp: async (pkgFilePath: string) => {
      return await ipcRenderer.invoke('@RPCS3/extractPKGFileToTemp', pkgFilePath)
    },
    getRB3Data: async (devhdd0Path: string, rpcs3ExePath: string): ReturnType<typeof getRB3Data> => {
      return await ipcRenderer.invoke('@RPCS3/getRB3Data', devhdd0Path, rpcs3ExePath)
    },
    installHighMemoryPatch: async (devhdd0Path: string): ReturnType<typeof installHighMemoryPatch> => {
      return await ipcRenderer.invoke('@RPCS3/installHighMemoryPatch', devhdd0Path)
    },
    installQuickConfig: async (rpcs3ExePath: string, configType: QuickConfigType): ReturnType<typeof installQuickConfig> => {
      return await ipcRenderer.invoke('@RPCS3/installQuickConfig', rpcs3ExePath, configType)
    },
    selectDevhdd0Folder: async (): ReturnType<typeof selectDevhdd0Folder> => {
      return await ipcRenderer.invoke('@RPCS3/selectDevhdd0Folder')
    },
    selectPKGFileToInstall: async (): ReturnType<typeof selectPKGFileToInstall> => {
      return await ipcRenderer.invoke('@RPCS3/selectPKGFileToInstall')
    },
    selectRPCS3Exe: async (): ReturnType<typeof selectRPCS3Exe> => {
      return await ipcRenderer.invoke('@RPCS3/selectRPCS3Exe')
    },
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
