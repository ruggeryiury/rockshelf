import { app } from 'electron'
import { DirPath, FilePath } from 'node-lib'
import { thisFilePath } from '../lib'

export class FileSystem {
  static readonly dirs = {
    packageBinDirPath: (): DirPath => DirPath.of(thisFilePath(import.meta.url).path, '../../bin'),

    userDataDirPath: (): DirPath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf'),
  } as const

  static readonly files = {
    userConfigFilePath: (): FilePath => this.dirs.userDataDirPath().gotoFile('user_config.json'),
  }
}
