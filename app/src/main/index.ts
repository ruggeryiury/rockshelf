import { initRockshelfApp } from 'rockshelf-core/main'
import linuxIconPath from '../../resources/icon.png?asset'

initRockshelfApp({ linuxIconPath, mainScriptRootFolder: import.meta.dirname })
