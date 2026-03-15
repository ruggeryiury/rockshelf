import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { rockshelfAPI } from 'rockshelf-core/preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', rockshelfAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = rockshelfAPI
}
