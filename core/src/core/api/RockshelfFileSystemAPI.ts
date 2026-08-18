import { platform } from 'node:os'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'
import { DirPath, FilePath, pathLikeToDirPath, pathLikeToFilePath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'
import { thisFilePath } from '../../lib/rbtools/lib.exports'
import { setElectronUserDataFolder } from '../../core.exports'
import { temporaryFile } from 'tempy'

const userData = (): DirPath => DirPath.of(app.getPath('userData'))
const documents = (): DirPath => DirPath.of(app.getPath('documents'))

/**
 * A class with static properties that represents specific application files and folders, and static methods that checks, cleans, and creates temporary folders on the application's startup.
 */
export class RockshelfFileSystemAPI {
  // #region Files

  static dxARKFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/gen/patch_ps3_0.ark')
  static dxHDRFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/gen/patch_ps3.hdr')
  static dxRichPresenceFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/discordrp.json')
  static dxVersionFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('game/BLUS30463/USRDIR/dx_version.dta')
  static getDownloadedDXPatchFile = (commitHash: string): FilePath => documents().gotoFile(`DownloadedContent/${commitHash}.zip`)
  static packagesCacheFile = (): FilePath => documents().gotoFile('packages.cache.json')
  static pythonEnvScriptFile = (): FilePath => userData().gotoFile(`Python/${platform() === 'win32' ? 'Scripts' : 'bin'}/python.exe`)
  static rb3SaveFile = (devhdd0Path: DirPathLikeTypes): FilePath => pathLikeToDirPath(devhdd0Path).gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
  static rpcs3UserConfigFile = (rpcs3ExePath: FilePathLikeTypes): FilePath => pathLikeToFilePath(rpcs3ExePath).gotoFile('config/custom_configs/config_BLUS30463.yml')
  static userConfigFile = (): FilePath => documents().gotoFile('user.config.json')
  static tempFile = (ext: string = 'bin'): FilePath => FilePath.of(temporaryFile({ extension: ext }))

  // #region Folders

  static appDownloadableContentDir = (): DirPath => documents().gotoDir('DownloadedContent')
  static tempDir = (): DirPath => FilePath.of(temporaryFile({ extension: 'bin' })).gotoDir('.')
  static appUserDataDir = (): DirPath => userData()
  static appDocumentsDir = (): DirPath => documents()
  static coreModuleRootDir = (): DirPath =>
    is.dev
      ? thisFilePath(import.meta.url).gotoDir('../../')
      : DirPath.of(
          thisFilePath(import.meta.url)
            .gotoDir('../../')
            .path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
        )
  static pythonEnvDir = () => userData().gotoDir('Python')
  static pythonEnvScriptDir = (): FilePath => userData().gotoFile(`Python/${platform() === 'win32' ? 'Scripts' : 'bin'}`)
  static rb1UsrDir = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30050/USRDIR')
  static rb2UsrDir = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30147/USRDIR')
  static rb3UsrDir = (devhdd0Path: DirPathLikeTypes): DirPath => pathLikeToDirPath(devhdd0Path).gotoDir('game/BLUS30463/USRDIR')

  // #region Functions

  /**
   * Initiates the Rockshelf user data folder, removes unused folders from older version of Rockshelf and checks the existence of used folders on Rockshelf's user data folder, and creates them if they don't exists.
   *
   * This function also clears the application temp folder.
   */
  static init = async (app: Electron.App): Promise<void> => {
    await setElectronUserDataFolder(app, 'Rockshelf')

    // Remove unused folders from older versions
    const deprecated: (FilePath | DirPath)[] = [userData().gotoDir('DownloadedPackages'), userData().gotoDir('AppTemp'), userData().gotoDir('DownloadedContent'), userData().gotoFile('package.cache.json'), userData().gotoFile('user_config.json')]
    if (deprecated.length > 0) {
      for (const entry of deprecated) {
        if (entry instanceof FilePath) await entry.delete()
        else await entry.deleteDir()
      }
    }

    // Move old files for new location
    const movedFiles: [FilePath, FilePath][] = []

    if (movedFiles.length > 0) {
      for (const moveOp of movedFiles) {
        const [oldPath, newPath] = moveOp
        if (oldPath.exists && !newPath.exists) {
          await oldPath.copy(newPath)
          await oldPath.delete()
        }
      }
    }

    // Create DLC folder (default Rockshelf path for downloaded contents through RhythmVerse API)
    const dlcFolder = this.appDownloadableContentDir()
    if (!dlcFolder.exists) await dlcFolder.mkDir()
  }
}
