import { checkUserConfig, fetchRPCS3Data, readUserConfigFilePath, saveUserConfigOnDisk, selectDevHDD0FolderInit, selectRPCS3ExeFileInit } from './core'
import { addHandler, initRBToolsChannels, openUserDataFolder, winClose, winMaximize, winMinimize } from './lib'

export function initMainHandlers() {
  // #region TopBar
  addHandler('@TopBar/minimize', winMinimize)
  addHandler('@TopBar/maximize', winMaximize)
  addHandler('@TopBar/close', winClose)
  addHandler('@TopBar/openUserDataFolder', openUserDataFolder)

  // #region Init Functions
  addHandler('@InitFunctions/selectDevHDD0FolderInit', selectDevHDD0FolderInit)
  addHandler('@InitFunctions/selectRPCS3ExeFileInit', selectRPCS3ExeFileInit)
  addHandler('@InitFunctions/fetchRPCS3Data', fetchRPCS3Data)

  // #region User Config
  addHandler('@UserConfig/checkUserConfig', checkUserConfig)
  addHandler('@UserConfig/readUserConfigFilePath', readUserConfigFilePath)
  addHandler('@UserConfig/saveUserConfigOnDisk', saveUserConfigOnDisk)

  initRBToolsChannels()
}

export * from './core'
export * from './lib'
