import { app } from 'electron'
import { DirPath, type FilePath } from 'node-lib'

export class FS {
  static userDataFolder(): DirPath {
    return DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf')
  }
  static userConfigFile(): FilePath {
    return this.userDataFolder().gotoFile('config.json')
  }
}
