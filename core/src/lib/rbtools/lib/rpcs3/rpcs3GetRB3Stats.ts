import { MyObject, pathLikeToDirPath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'
import { parse as parseYAML } from 'yaml'
import { isRPCS3Devhdd0PathValid } from './isRPCS3Devhdd0PathValid'
import { isRPCS3ExePathValid } from './isRPCS3ExePathValid'

export interface RockBand3Data {
  /**
   * Your profile name on the PS3 system. The value is `null` when no username home folder's found on the RPCS3's `dev_hdd0` folder.
   */
  userName: string | null
  /**
   * The path to the Rock Band 3 game files. The value is `null` when the game is not installed and recognized on RPCS3.
   */
  path: string | null
  /**
   * The title of the game (always `"Rock Band 3"`)
   */
  gameName: string
  /**
   * The serial number of the game (always `"BLUS30463"`)
   */
  gameSerial: string
  /**
   * The path where you save game data can be found.
   */
  saveDataPath: string
  /**
   * True if Rock Band 3 is installed and recognized on RPCS3, otherwise false.
   */
  hasGameInstalled: boolean
  /**
   * True if the save game data is found on the `dev_hdd0` folder, otherwise false.
   */
  hasSaveData: boolean
  /**
   * True if it has installed any type of update patches, otherwise false.
   */
  hasUpdate: boolean
  /**
   * True if the installed patch update is from Rock Band 3 Deluxe, otherwise false.
   */
  hasDeluxe: boolean
  /**
   * The type of the update installed on Rock Band 3. Default is `"none"`.
   */
  updateType: 'none' | 'dx' | 'tu5'
  /**
   * The hash of the Rock Band 3 Deluxe develop commit the user has installed.
   */
  deluxeVersionHash: string | null
  /**
   * True if it has the teleport glitch patch installed, otherwise false.
   */
  hasTeleportGlitchPatch: boolean
  /**
   * True if it has the high memory patch installed, otherwise false
   */
  hasHighMemoryPatch: boolean
  // /**
  //  * An array with folders where all the song packages are installed.
  //  */
  // contents: string[]
}

export interface RPCS3GamesYAML {
  /**
   * Rock Band 3 (USA).
   */
  BLUS30463?: string
}

/**
 * Returns an object with stats about the Rock Band 3 game on RPCS3.
 * - - - -
 * @param {DirPathLikeTypes} devhdd0Path The path to the `dev_hdd0` folder of your RPCS3 installation.
 * @param {FilePathLikeTypes} rpcs3ExePath The path to the RPCS3 executable file, where the `config/games.yml` file is located, which is used to check if the game is installed and recognized on RPCS3.
 * @returns {Promise<RockBand3Data>}
 * @throws {Error} If any of the provided paths are invalid, or if the required files for checking the stats are missing.
 */
export const rpcs3GetRB3Stats = async (devhdd0Path: DirPathLikeTypes, rpcs3ExePath: FilePathLikeTypes): Promise<RockBand3Data> => {
  const devhdd0 = isRPCS3Devhdd0PathValid(devhdd0Path)
  const rpcs3Exe = isRPCS3ExePathValid(rpcs3ExePath)

  const map = new MyObject<RockBand3Data>()
  const gamesYml = rpcs3Exe.gotoFile('config/games.yml')
  if (!gamesYml.exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required configuration file "config/games.yml".`)
  const games = parseYAML(await gamesYml.read('utf8')) as RPCS3GamesYAML

  const userNameFilePath = devhdd0.gotoFile(`home/00000001/localusername`)

  const saveDataPath = devhdd0.gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
  const usrdir = devhdd0.gotoDir('game/BLUS30463/USRDIR')
  const gen = usrdir.gotoDir('gen')
  const hdr = gen.gotoFile('patch_ps3.hdr')
  const ark = gen.gotoFile('patch_ps3_0.ark')

  // const contents: string[] = []

  map.setMany({
    userName: userNameFilePath.exists ? await userNameFilePath.read('utf8') : null,
    path: games.BLUS30463 ? pathLikeToDirPath(games.BLUS30463).path : null,
    gameName: 'Rock Band 3',
    gameSerial: 'BLUS30463',
    saveDataPath: saveDataPath.path,
    hasGameInstalled: Boolean(games.BLUS30463),
    hasSaveData: saveDataPath.exists,
    hasUpdate: gen.exists && hdr.exists && ark.exists,
    hasDeluxe: false,
    updateType: 'none',
    deluxeVersionHash: null,
    hasTeleportGlitchPatch: false,
    hasHighMemoryPatch: false,
  })

  if (hdr.exists && ark.exists) {
    const arkStats = await ark.stat()
    const hdrStats = await hdr.stat()

    // CHECK: Only RB3DX update can be bigger than 500MB
    if (arkStats.size > 0x1f400000) {
      map.setMany({
        gameName: 'Rock Band 3 Deluxe',
        hasDeluxe: true,
        updateType: 'dx',
      })

      const dxVersionFile = usrdir.gotoFile('dx_version.dta')
      if (dxVersionFile.exists) {
        const hash = (await dxVersionFile.readLines())[4].trim().replace(/"/g, '').split('-')[0]
        if (hash.length === 7) map.set('deluxeVersionHash', hash)
      }
    }

    // Title Update 5 HDR file has exactly 36201 bytes
    // Title Update 5 ARK File has exactly 3349707 bytes
    else if (hdrStats.size === 0x8d69 && arkStats.size === 0x331ccb) map.set('updateType', 'tu5')
  }

  if (games.BLUS30463) {
    const rb3GamePath = pathLikeToDirPath(games.BLUS30463)
    if (rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_vanilla.hdr').exists && rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_10.ark').exists) map.set('hasTeleportGlitchPatch', true)
    if (gen.gotoFile('../dx_high_memory.dta').exists) map.set('hasHighMemoryPatch', true)
  }

  return map.toJSON()
}
