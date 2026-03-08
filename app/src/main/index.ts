import linuxIconPath from '../../resources/icon.png?asset'
import { initRockshelfMainProcess } from 'rockshelf-core'

initRockshelfMainProcess({
  linuxIconPath,
  mainScriptRootFolder: import.meta.dirname,
})
