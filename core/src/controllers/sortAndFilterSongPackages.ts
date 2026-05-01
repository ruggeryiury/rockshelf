import { getPackagesCacheFile, useHandler } from '../core.exports'
import type { RPCS3SongPackagesDataExtra } from '../lib.exports'

export const sortAndFilterSongPackages = useHandler(async (win, _) => {
  const cache = getPackagesCacheFile()
  const cacheContents = await cache.readJSON<RPCS3SongPackagesDataExtra>()

  const songs = cacheContents.packages
})
