import { utimes } from 'node:fs/promises'
import { getPackagesCacheFile, readUserConfigFile, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { genPackImageToAllPackages, rpcs3GetSongPackagesStatsExtra, type RPCS3SongPackagesDataExtra } from '../lib.exports'
import { isRPCS3Devhdd0PathValid } from 'rbtools/lib'

/**
 * Retrieves data from all installed song packages.
 */
export const rpcs3GetPackagesData = useHandler(async (win, _, forceUpdate: boolean = false): Promise<RPCS3SongPackagesDataExtra | false> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)

  const cache = getPackagesCacheFile()

  if (forceUpdate || !cache.exists) {
    const packagesData = await rpcs3GetSongPackagesStatsExtra(devhdd0)
    await cache.write(JSON.stringify(packagesData))
    const now = new Date()
    await utimes(cache.path, now, now)
    if (packagesData.parsingErrors.length > 0) sendDialog(win, 'parsingErrorsOnPackagesDTA')
    return packagesData
  }

  const stat = await cache.stat()
  let forceCacheUpdate = false

  // 7 days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000

  if (stat.mtime.getTime() - new Date().getTime() > oneWeekInMilliseconds) forceCacheUpdate = true

  if (!forceCacheUpdate) {
    try {
      await genPackImageToAllPackages(devhdd0)
      const cacheContents = await cache.readJSON<RPCS3SongPackagesDataExtra>()
      if (typeof cacheContents !== 'object' || (typeof cacheContents !== 'object' && typeof cacheContents === null)) throw new Error(`Rockshelf's cache file returned a ${typeof cacheContents} and it's not valid.`)
      if (cacheContents.parsingErrors.length > 0) sendDialog(win, 'parsingErrorsOnPackagesDTA')
      return cacheContents
    } catch (err) {
      sendDialog(win, 'corruptedPackagesCache')
      return false
    }
  }

  const packagesData = await rpcs3GetSongPackagesStatsExtra(devhdd0)
  await cache.write(JSON.stringify(packagesData))
  const now = new Date()
  await utimes(cache.path, now, now)
  if (packagesData.parsingErrors.length > 0) sendDialog(win, 'parsingErrorsOnPackagesDTA')

  return packagesData
})
