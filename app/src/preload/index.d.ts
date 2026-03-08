import type { ElectronAPI } from '@electron-toolkit/preload'
import type { rbtoolsAPI, preloadAPI } from 'rockshelf-core/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof preloadAPI
    rbtools: typeof rbtoolsAPI
  }
}
