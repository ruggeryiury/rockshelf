import { pathLikeToDirPath } from 'node-lib'
import { useHandlerWithUserConfig } from '../electron-lib/useHandler'
import { FileSystem } from '../../core'
import { RB3SaveData, type ParsedRB3SaveData } from 'rbtools'

export const getSaveData = useHandlerWithUserConfig(async (win, _, { devhdd0Path }): Promise<ParsedRB3SaveData | false> => {
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  const saveDataPath = FileSystem.rb3SaveDataFile(devhdd0)
  if (!saveDataPath.exists) return false
  return await RB3SaveData.parseFromFile(saveDataPath)
})
