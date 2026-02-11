import { app } from 'electron'
import { DirPath, FilePath, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { thisFilePath } from '../lib'

export class FileSystem {
  static packageBinDir = DirPath.of(thisFilePath(import.meta.url).path, '../../bin')
  static userDataDir = DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf')

  static rb3BLUS30463 = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30463')
  static rb2BLUS30147 = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30147')
  static rbBLUS30050 = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30050')

  static userConfigFile = (): FilePath => FileSystem.userDataDir.gotoFile('user_config.json')
  static rb3SaveDataFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
}
