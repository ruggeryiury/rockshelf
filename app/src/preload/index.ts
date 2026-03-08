import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { preloadAPI, rbtoolsAPI } from 'rockshelf-core/preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', preloadAPI)
    contextBridge.exposeInMainWorld('rbtools', rbtoolsAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = preloadAPI
  // @ts-ignore (define in dts)
  window.rbtools = rbtoolsAPI
}
