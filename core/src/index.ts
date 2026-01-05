import { winMinimize, winMaximize, winClose } from './core'
import { addHandler, initRBToolsChannels } from './lib'
import { checkUserConfig, selectDevHDD0FolderInit } from './utils'

export function initMainHandlers() {
  // #region TopBar
  addHandler('@TopBar/minimize', winMinimize)
  addHandler('@TopBar/maximize', winMaximize)
  addHandler('@TopBar/close', winClose)

  // #region Init
  addHandler('@Init/checkUserConfig', checkUserConfig)
  addHandler('@Init/selectDevHDD0FolderInit', selectDevHDD0FolderInit)

  initRBToolsChannels()
}

export * from './core'
export * from './lib'
export * from './utils'
