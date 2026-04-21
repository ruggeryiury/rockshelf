import { getPackagesCacheFile, sendDialog, useHandler } from '../core.exports'
import { type RPCS3SongPackagesDataExtra } from '../lib.exports'
import { filterDTAByArtist, filterDTAByDecade, filterDTAByGenre, filterDTAByInstrumentDifficulty, filterDTAByTitle, filterDTAByYearReleased, type DTAFilterByArtistObject, type DTAFilterByDifficultyObject, type DTAFilterGenericObject, type DTAFilterOptions, type DTAFilterTypes } from '../lib/rbtools/lib.exports'

export const getDTAFilteringFromPackage = useHandler(async (win, _, packageIndex: number, type: DTAFilterTypes = 'title', options?: DTAFilterOptions): Promise<false | DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject> => {
  const cache = getPackagesCacheFile()
  const cacheContents = await cache.readJSON<RPCS3SongPackagesDataExtra>()

  if (!(packageIndex in cacheContents.packages)) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }

  const songs = cacheContents.packages[packageIndex].songs
  switch (type) {
    case 'title':
    default:
      return filterDTAByTitle(songs, options)
    case 'artist':
      return filterDTAByArtist(songs, options)
    case 'genre':
      return filterDTAByGenre(songs, options)
    case 'decade':
      return filterDTAByDecade(songs, options)
    case 'yearReleased':
      return filterDTAByYearReleased(songs, options)
    case 'difficulty':
      return filterDTAByInstrumentDifficulty(songs, options)
  }
})
