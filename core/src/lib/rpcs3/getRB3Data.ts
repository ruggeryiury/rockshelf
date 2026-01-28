import { MyObject, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { useHandler } from '../electron-lib/useHandler'
import { parse as parseYAML } from 'yaml'

export interface RockBand3Data {
  user: string
}

export const getRB3Data = useHandler(async (win, __, devhdd0Path: string, rpcs3ExePath: string) => {
  console.warn(devhdd0Path, rpcs3ExePath)
  const devhdd0DirPath = pathLikeToDirPath(devhdd0Path)
  const rpcs3ExeFilePath = pathLikeToFilePath(rpcs3ExePath)

  const map = new MyObject<RockBand3Data>()
  const games = parseYAML(await rpcs3ExeFilePath.gotoFile('config/games.yml').read('utf8')) as { BLUS30463?: string }

  const userNameFilePath = devhdd0DirPath.gotoFile(`home/00000001/localusername`)

  map.set('user', await userNameFilePath.read('utf8'))

  return map.toJSON()
})
