import { getPackagesCacheFile, readUserConfigFile, sendDialog, useHandler } from '../core.exports'
import { rpcs3GetSongPackagesStatsExtra, type RPCS3SongPackagesDataExtra } from '../lib.exports'
import { utimes } from 'fs/promises'
import { isRPCS3Devhdd0PathValid } from '../lib/rbtools/lib.exports'

/**
 * Forcefully refreshes the song packages cache file.
 */
export const refreshPackagesData = useHandler(async (win, _): Promise<RPCS3SongPackagesDataExtra | false> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)

  const cache = getPackagesCacheFile()
  const packagesData = await rpcs3GetSongPackagesStatsExtra(devhdd0)
  await cache.write(JSON.stringify(packagesData))
  const now = new Date()
  await utimes(cache.path, now, now)
  if (packagesData.parsingErrors.length > 0) sendDialog(win, 'parsingErrorsOnPackagesDTA')
  return packagesData
})
