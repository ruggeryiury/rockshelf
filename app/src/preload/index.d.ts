import { ElectronAPI } from '@electron-toolkit/preload'
import { rockshelfAPI } from 'rockshelf-core/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: typeof rockshelfAPI
  }
}
