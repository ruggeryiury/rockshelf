import { MyObject, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { useHandler } from '../electron-lib/useHandler'
import { parse as parseYAML } from 'yaml'

export interface RockBand3Data {
  userName: string
  path: string
  gameName: string
  gameID: string
  saveDataPath: string
  hasSaveData: boolean
  hasUpdate: boolean
  hasDeluxe: boolean
  updateType: 'unknown' | 'dx' | 'tu5'
  deluxeVersion: string
  hasTeleportGlitchPatch: boolean
  hasHighMemoryPatch: boolean
  contents: string[]
}

export const getRB3Data = useHandler(async (win, __, devhdd0Path: string, rpcs3ExePath: string) => {
  console.warn(devhdd0Path, rpcs3ExePath)
  const devhdd0DirPath = pathLikeToDirPath(devhdd0Path)
  const rpcs3ExeFilePath = pathLikeToFilePath(rpcs3ExePath)

  const map = new MyObject<RockBand3Data>()
  const games = parseYAML(await rpcs3ExeFilePath.gotoFile('config/games.yml').read('utf8')) as { BLUS30463?: string }

  const userNameFilePath = devhdd0DirPath.gotoFile(`home/00000001/localusername`)

  const saveDataPath = devhdd0DirPath.gotoFile('home/00000001/savedata/BLUS30463-AUTOSAVE/SAVE.DAT')
  const gen = devhdd0DirPath.gotoDir('game/BLUS30463/USRDIR/gen')
  const hdr = gen.gotoFile('patch_ps3.hdr')
  const ark = gen.gotoFile('patch_ps3_0.ark')

  map.setMany({
    userName: await userNameFilePath.read('utf8'),
    path: games.BLUS30463 ? pathLikeToDirPath(games.BLUS30463).path : '',
    gameName: 'Rock Band 3',
    gameID: 'BLUS-30463',
    saveDataPath: saveDataPath.path,
    hasSaveData: saveDataPath.exists,
    hasUpdate: gen.exists && hdr.exists && ark.exists,
    hasDeluxe: false,
    updateType: 'unknown',
    deluxeVersion: '',
    hasTeleportGlitchPatch: false,
    hasHighMemoryPatch: false,
  })

  if (hdr.exists && ark.exists) {
    const arkStats = await ark.stat()
    const hdrStats = await hdr.stat()

    // CHECK: Only RB3DX update can be bigger than 500MB
    if (arkStats.size > 0x1f400000) {
      map.setMany({
        hasDeluxe: true,
        updateType: 'dx',
        deluxeVersion: 'unknown',
      })

      // TODO: Make some way to recognize the update version
    }

    // Title Update 5
    else if (hdrStats.size === 0x8d69) map.set('updateType', 'tu5')
  }

  if (games.BLUS30463) {
    const rb3GamePath = pathLikeToDirPath(games.BLUS30463)
    if (rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_vanilla.hdr').exists && rb3GamePath.gotoFile('PS3_GAME/USRDIR/gen/main_ps3_10.ark').exists) map.set('hasTeleportGlitchPatch', true)
    if (gen.gotoFile('../dx_high_memory.dta').exists) map.set('hasHighMemoryPatch', true)
  }

  return map.toJSON()
})
