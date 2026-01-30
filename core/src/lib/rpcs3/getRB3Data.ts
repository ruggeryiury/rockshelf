import { MyObject, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { useHandler } from '../electron-lib/useHandler'
import { parse as parseYAML } from 'yaml'

export interface RockBand3Data {
  /**
   * Your profile name on the PS3 system.
   */
  userName: string
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
  /**
   * An array with folders where the patches and the song packages are installed and read.
   */
  contents: string[]
}

export const getRB3Data = useHandler(async (win, __, devhdd0Path: string, rpcs3ExePath: string): Promise<RockBand3Data> => {
  const devhdd0DirPath = pathLikeToDirPath(devhdd0Path)
  const rpcs3ExeFilePath = pathLikeToFilePath(rpcs3ExePath)

  const map = new MyObject<RockBand3Data>()
  const games = parseYAML(await rpcs3ExeFilePath.gotoFile('config/games.yml').read('utf8')) as { BLUS30463?: string }

  const userNameFilePath = devhdd0DirPath.gotoFile(`home/00000001/localusername`)

  const saveDataPath = devhdd0DirPath.gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
  const usrdir = devhdd0DirPath.gotoDir('game/BLUS30463/USRDIR')
  const gen = usrdir.gotoDir('gen')
  const hdr = gen.gotoFile('patch_ps3.hdr')
  const ark = gen.gotoFile('patch_ps3_0.ark')

  const contents: string[] = []

  map.setMany({
    userName: await userNameFilePath.read('utf8'),
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
        let hash = (await dxVersionFile.readLines())[4].trim().replace(/"/g, '').split('-')[0]
        if (hash.length === 9) map.set('deluxeVersionHash', hash)
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
})
