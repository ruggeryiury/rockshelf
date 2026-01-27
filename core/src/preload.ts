import { ipcRenderer, shell, webUtils, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { openUserConfigOnExplorer, readUserConfig, RendererMessageObject, selectDevhdd0Folder, winClose, winMaximize, winMinimize } from './lib'
import type { Promisable } from 'type-fest'
import type { selectRPCS3Exe } from './lib/rpcs3/rpcs3Exe'

export const rockshelfAPI = {
  listeners: {
    /**
     * Listen for messages from the main process.
     * - - - -
     * @param {(event: IpcRendererEvent, message: RendererMessageObject) => Promisable<void>} callback The callback function to handle the message event.
     * @returns {IpcRenderer}
     */
    onMessage(callback: (event: IpcRendererEvent, message: RendererMessageObject) => Promisable<void>): IpcRenderer {
      return ipcRenderer.on('@Message', callback)
    },
  },
  window: {
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
    /**
     * Close the application window.
     * - - - -
     * @returns {Promise<void>}
     */
    async close(): Promise<ReturnType<typeof winClose>> {
      return await ipcRenderer.invoke('@Window/close')
    },
  },
  fs: {
    userConfig: {
      openUserConfigOnExplorer: async (selected: boolean = false): ReturnType<typeof openUserConfigOnExplorer> => {
        return await ipcRenderer.invoke('@FileSystem/userConfig/openUserConfigOnExplorer', selected)
      },
      readUserConfig: async (): ReturnType<typeof readUserConfig> => {
        return await ipcRenderer.invoke('@FileSystem/userConfig/readUserConfig')
      },
    },
  },
  rpcs3: {
    selectDevhdd0Folder: async (): ReturnType<typeof selectDevhdd0Folder> => {
      return await ipcRenderer.invoke('@RPCS3/selectDevhdd0Folder')
    },
    selectRPCS3Exe: async (lang: string): ReturnType<typeof selectRPCS3Exe> => {
      return await ipcRenderer.invoke('@RPCS3/selectRPCS3Exe', lang)
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
  },
} as const
