import { app } from 'electron'
import { DirPath, FilePath } from 'node-lib'
import { thisFilePath } from '../lib'

export class FileSystem {
  static readonly dirs = {
    packageBin: (): DirPath => DirPath.of(thisFilePath(import.meta.url).path, '../../bin'),

    userData: (): DirPath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf'),
  } as const

  static readonly files = {
    userConfig: (): FilePath => this.dirs.userData().gotoFile('UserConfig.json'),
  }
}
