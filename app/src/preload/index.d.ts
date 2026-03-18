import type { ElectronAPI } from '@electron-toolkit/preload'
import type { rockshelfAPI } from 'rockshelf-core/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof rockshelfAPI
  }
}
