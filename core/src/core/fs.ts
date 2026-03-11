import { app } from 'electron'
import { DirPath, FilePath, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'

export const getRockshelfUserDataDir = (): DirPath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf')
export const getUserConfigFile = (): FilePath => getRockshelfUserDataDir().gotoFile('user_config.json')
export const getRB3SaveDataFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
