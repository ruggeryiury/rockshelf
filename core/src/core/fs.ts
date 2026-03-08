import { app } from 'electron'
import { DirPath, FilePath } from 'node-lib'

export const getRockshelfUserDataDir = (): DirPath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf')
export const getUserConfigFile = (): FilePath => getRockshelfUserDataDir().gotoFile('user_config.json')
