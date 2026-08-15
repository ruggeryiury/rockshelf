import linuxIconPath from '../../resources/icon.png?asset'
import { Rockshelf } from 'rockshelf-core'

Rockshelf.init({
  linuxIconPath,
  mainScriptRootFolder: import.meta.dirname,
  argv: process.argv.filter((val) => val !== '.'),
})
