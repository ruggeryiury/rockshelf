import { app } from 'electron'
import { DirPath, FilePath, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { thisFilePath } from '../lib'

export class FileSystem {
  static readonly dirs = {
    packageBinDirPath: DirPath.of(thisFilePath(import.meta.url).path, '../../bin'),

    userDataDirPath: DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf'),

    rb3UsrDir: (devhdd0Path: DirPathLikeTypes): DirPath => {
      const devhdd0 = pathLikeToDirPath(devhdd0Path)
      return devhdd0.gotoDir('game/BLUS30463/USRDIR')
    },
  } as const

  static readonly files = {
    userConfigFilePath: (): FilePath => this.dirs.userDataDirPath.gotoFile('user_config.json'),
  }
}
