import { app } from 'electron'
import { DirPath, FilePath, pathLikeToDirPath, pathLikeToFilePath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'
import { thisFilePath } from '../lib/rbtools/lib.exports'
import { is } from '@electron-toolkit/utils'

export class RockshelfFileSys {
  // #region Files
  static userConfigFile = (): FilePath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf').gotoFile('user_config.json')
  static packagesCacheFile = (): FilePath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf').gotoFile('package.cache.json')
  static rb3SaveFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
  static dxRichPresenceFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/discordrp.json')
  static rpcs3UserConfigFile = (rpcs3ExePath: FilePathLikeTypes): FilePath => pathLikeToFilePath(rpcs3ExePath).gotoFile('config/custom_configs/config_BLUS30463.yml')
  static dxHDRFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/gen/patch_ps3.hdr')
  static dxARKFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/gen/patch_ps3_0.ark')
  static dxVersionFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/dx_version.dta')
  static getDownloadedDXPatchFile = (commitHash: string): FilePath => DirPath.of(app.getPath('userData')).gotoFile(`../Rockshelf/DownloadedContent/${commitHash}.zip`)

  // #region Folders
  static coreModuleRootDir = (): DirPath =>
    is.dev
      ? thisFilePath(import.meta.url).gotoDir('../')
      : DirPath.of(
          thisFilePath(import.meta.url)
            .gotoDir('../')
            .path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
        )

  static appUserDataDir = (): DirPath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf')
  static appTempDir = (): DirPath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf/AppTemp')
  static dlcDir = (): DirPath => DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf/DownloadedContent')
  static rb1UsrDir = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30050/USRDIR')
  static rb2UsrDir = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30147/USRDIR')
  static rb3UsrDir = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30463/USRDIR')

  // #region Others
  static deprecated: (FilePath | DirPath)[] = [DirPath.of(app.getPath('userData')).gotoDir('../Rockshelf/DownloadedPackages')]
  static deleteDeprecatedEntries = async () => {
    for (const entry of this.deprecated) {
      if (entry instanceof FilePath) await entry.delete()
      else await entry.deleteDir()
    }
  }
  static checkAndCreateAppEntries = async () => {
    const tempFolder = this.appTempDir()
    if (!tempFolder.exists) await tempFolder.mkDir()
    else {
      await tempFolder.deleteDir(true)
      await tempFolder.mkDir()
    }

    const dlcFolder = this.dlcDir()
    if (!dlcFolder.exists) await dlcFolder.mkDir()
  }
}
