import { getPackagesCacheFile, useHandler } from '../core.exports'
import { filterSongPackagesByName, filterSongPackagesByOfficialPkg, filterSongPackagesByUserCategory, type RPCS3SongPackagesDataExtra, type SongPackagesFilterGenericObject, type SongPackagesFilterOptions, type SongPackagesFilterTypes } from '../lib.exports'

export const sortAndFilterSongPackages = useHandler(async (_, __, type: SongPackagesFilterTypes, options?: SongPackagesFilterOptions): Promise<SongPackagesFilterGenericObject> => {
  const cache = getPackagesCacheFile()
  const cacheContents = await cache.readJSON<RPCS3SongPackagesDataExtra>()

  const packages = cacheContents.packages
  switch (type) {
    case 'name':
    default:
      return filterSongPackagesByName(packages, options)
    case 'officialUnofficial':
      return filterSongPackagesByOfficialPkg(packages, options)
    case 'userCategory':
      return filterSongPackagesByUserCategory(packages, options)
  }
})
