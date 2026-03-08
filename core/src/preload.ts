/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ipcRenderer, type IpcRenderer, type IpcRendererEvent } from 'electron'
import type { Promisable } from 'type-fest'
import type { openUserDataFolder, readUserConfigFile, RendererMessageObject, saveUserConfigFile, windowClose, windowMaximize, windowMinimize } from './core.exports'

const invoke = ipcRenderer.invoke.bind(ipcRenderer)
const on = ipcRenderer.on.bind(ipcRenderer)

export type OnMessageCallback = (event: IpcRendererEvent, message: RendererMessageObject) => Promisable<any>
export type OnLocaleRequestCallback = (event: IpcRendererEvent, uuid: string, key: string) => void

export const preloadAPI = {
  /**
   * Listens for messages from the main process.
   * - - - -
   * @param {OnMessageCallback} callback The callback function to handle the message event.
   * @returns {IpcRenderer}
   */
  onMessage(callback: OnMessageCallback): IpcRenderer {
    return on('onMessage', callback)
  },
  /**
   * Listens for requests to localized values.
   * - - - -
   * @param {(event: IpcRendererEvent, uuid: string, key: string) => Promise<string>} callback The callback function to handle the localized string request.
   */
  onLocaleRequest(callback: OnLocaleRequestCallback): IpcRenderer {
    return on('onLocaleRequest', callback)
  },

  /**
   * Close the application window.
   * - - - -
   * @returns {Promise<void>}
   */
  windowClose: async (): Promise<ReturnType<typeof windowClose>> => await invoke('windowClose()'),
  /**
   * Minimize the application window.
   * - - - -
   * @returns {Promise<void>}
   */
  windowMinimize: async (): Promise<ReturnType<typeof windowMinimize>> => await invoke('windowMinimize()'),
  /**
   * Maximize the application window. Returns true if the window is maximized, false otherwise.
   * - - - -
   * @returns {Promise<boolean>}
   */
  windowMaximize: async (): Promise<ReturnType<typeof windowMaximize>> => await invoke('windowMaximize()'),
  openUserDataFolder: async (): ReturnType<typeof openUserDataFolder> => await invoke('openUserDataFolder()'),
  readUserConfigFile: async (): ReturnType<typeof readUserConfigFile> => await invoke('readUserConfigFile()'),
  saveUserConfigFile: async (): ReturnType<typeof saveUserConfigFile> => await invoke('saveUserConfigFile()'),
} as const

export const rbtoolsAPI = {} as const
