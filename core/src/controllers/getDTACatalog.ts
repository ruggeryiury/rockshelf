import { getPackagesCacheFile, useHandler } from '../core.exports'
import { catalogDTAByGenre, catalogDTAByTitle, type DTACatalogTypes, type RPCS3SongPackagesDataExtra } from '../lib.exports'

export const getDTACatalog = useHandler(async (win, _, packageIndex: number, type: DTACatalogTypes = 'title') => {
  const cache = getPackagesCacheFile()
  const cacheContents = await cache.readJSON<RPCS3SongPackagesDataExtra>()

  if (!(packageIndex in cacheContents.packages)) {
  }

  const songs = cacheContents.packages[packageIndex].songs
  switch (type) {
    case 'title':
    default:
      return catalogDTAByTitle(songs)
    case 'genre':
      return catalogDTAByGenre(songs)
  }
})
