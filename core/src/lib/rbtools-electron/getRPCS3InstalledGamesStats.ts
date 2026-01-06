import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { MyObject, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { parse as parseYAMLBuffer } from 'yaml'

export type SupportedRBGamesIDs =
  // Rock Band 2
  | 'BLUS30147'
  // Rock Band 3
  | 'BLUS30463'

export interface SupportedGamesStatsBase {
  /**
   * The path where the game is installed.
   */
  path: string
  /**
   * The name of the game.
   */
  name: string
  /**
   * The catalog ID of the game.
   */
  id: string
  /**
   * The path to the game save data file.
   */
  saveDataPath: string
  /**
   * Tells if the game has a save data file.
   */
  hasSaveData: boolean
  /**
   * Tells if the game has any update (official or MiloHax's Deluxe) installed.
   */
  hasUpdate: boolean
  /**
   * Tells if the game has any MiloHax Deluxe patch installed.
   */
  hasDeluxe: boolean
}

export type RockBand3SpecificStats = SupportedGamesStatsBase & {
  /**
   * The type of the update installed.
   */
  updateType: 'milohax_dx' | 'tu5' | 'unknown'
  deluxeVersion: string | null
  /**
   * Tells if the Teleport Glitch Patch is installed.
   */
  hasTeleportGlitchPatch: boolean
  /**
   * Tells if the High Memory Patch is installed.
   */
  hasHighMemoryPatch: boolean
}

export type RockBand2SpecificStats = SupportedGamesStatsBase & {
  /**
   * The type of the update installed.
   */
  updateType: 'milohax_dx' | 'tu2' | 'unknown'
}

export interface RPCS3InstalledGamesStats {
  /**
   * Information about Rock Band 3. If the value is `null`, it means that the user doesn't have Rock Band 3 installed.
   */
  BLUS30463?: RockBand3SpecificStats
  /**
   * Information about Rock Band 2. If the value is `null`, it means that the user doesn't have Rock Band 2 installed.
   */
  BLUS30147?: RockBand2SpecificStats
}

export const getRPCS3InstalledGamesStats = async (win: BrowserWindow, __: IpcMainInvokeEvent, devhdd0Path: string, rpcs3exePath: string): Promise<RPCS3InstalledGamesStats> => {
  const rpcs3exe = pathLikeToFilePath(rpcs3exePath)
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  const map = new MyObject<RPCS3InstalledGamesStats>()
  const games = parseYAMLBuffer(await rpcs3exe.gotoFile('config/games.yml').read('utf8')) as Record<SupportedRBGamesIDs, string>

  if ('BLUS30463' in games) {
    const rb3 = new MyObject<RockBand3SpecificStats>()
    const rb3GamePath = pathLikeToDirPath(games.BLUS30463)
    rb3.set('path', rb3GamePath.path)
    rb3.set('name', 'Rock Band 3')
    rb3.set('id', 'BLUS30463')

    const saveDataPath = devhdd0.gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
    rb3.set('saveDataPath', saveDataPath.path)
    rb3.set('hasSaveData', saveDataPath.exists)

    const gen = devhdd0.gotoDir('game/BLUS30463/USRDIR/gen')
    const hdr = gen.gotoFile('patch_ps3.hdr')
    const ark = gen.gotoFile('patch_ps3_0.ark')
    rb3.set('hasUpdate', gen.exists && hdr.exists && ark.exists)
    rb3.set('hasDeluxe', false)
    rb3.set('updateType', 'unknown')
    rb3.set('deluxeVersion', 'null')
    rb3.set('hasTeleportGlitchPatch', false)
    rb3.set('hasHighMemoryPatch', false)
    if (hdr.exists && ark.exists) {
      const arkStats = await ark.stat()
      const hdrStats = await hdr.stat()

      // Only RB3DX update can be bigger than 500mb
      if (arkStats.size > 0x1f400000) {
        rb3.set('hasDeluxe', true)
        rb3.set('updateType', 'milohax_dx')
        rb3.set('deluxeVersion', 'unknown')
      }

      // Title Update 5?
      else if (hdrStats.size === 0x8d69) rb3.set('updateType', 'tu5')
    }

    if (rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_vanilla.hdr').exists && rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_10.ark').exists) rb3.set('hasTeleportGlitchPatch', true)
    if (gen.gotoFile('../dx_high_memory.dta').exists) rb3.set('hasHighMemoryPatch', true)

    map.set('BLUS30463', rb3.toObject())
  }

  if ('BLUS30147' in games) {
    const rb2 = new MyObject<RockBand2SpecificStats>()
    const rb2GamePath = pathLikeToDirPath(games.BLUS30147)
    rb2.set('path', rb2GamePath.path)
    rb2.set('name', 'Rock Band 2')
    rb2.set('id', 'BLUS30147')

    const saveDataPath = devhdd0.gotoFile('home/00000001/savedata/BLUS30147-AUTOSAVE/RB2.SAV')
    rb2.set('saveDataPath', saveDataPath.path)
    rb2.set('hasSaveData', saveDataPath.exists)

    const gen = devhdd0.gotoDir('game/BLUS30147/USRDIR/gen')
    const hdr = gen.gotoFile('patch_ps3.hdr')
    const ark = gen.gotoFile('patch_ps3_0.ark')
    rb2.set('hasUpdate', gen.exists && hdr.exists && ark.exists)
    rb2.set('hasDeluxe', false)
    rb2.set('updateType', 'unknown')
    if (hdr.exists && ark.exists) {
      const arkStats = await ark.stat()
      const hdrStats = await hdr.stat()

      // Only RB2DX update can be bigger than 300mb
      if (arkStats.size > 0x12c00000) {
        rb2.set('hasDeluxe', true)
        rb2.set('updateType', 'milohax_dx')
      }

      // Title Update 2?
      else if (hdrStats.size === 0x5d85) rb2.set('updateType', 'tu2')
    }

    map.set('BLUS30147', rb2.toObject())
  }

  return map.toObject()
}
