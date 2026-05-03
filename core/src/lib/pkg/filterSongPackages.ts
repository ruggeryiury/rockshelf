import { useDefaultOptions } from 'use-default-options'
import type { RPCS3SongPackagesObjectExtra } from '../../lib.exports'
import { leadingArticleToTrailing } from '../rbtools/utils.exports'

export interface SongPackagesFilterGenericHeaders {
  /**
   * The name of header (in English).
   */
  name: string
  /**
   * A unique string to identity the header.
   */
  code: string
  /**
   * An array with indexes of packages from the original songs array.
   */
  indexes: number[]
}

export type SongPackagesFilterTypes = 'name' | 'officialUnofficial'

export interface SongPackagesFilterGenericObject {
  /**
   * The type of the catalog.
   */
  type: Exclude<SongPackagesFilterTypes, 'artist' | 'difficulty'>
  /**
   * An array with objects representing each header from the specified type.
   */
  headers: SongPackagesFilterGenericHeaders[]
  /**
   * The amount of song packages from the original song packages array.
   */
  packagesCount: number
}

export interface SongPackagesFilterOptions {
  /**
   * Remove unused headers. Default is `true`.
   */
  filterEmptyHeader?: boolean
}

export type RPCS3SongPackagesObjectExtraWithIndex = RPCS3SongPackagesObjectExtra & {
  /**
   * A number to track down the packages's index on the original array.
   */
  index: number
}

/**
 * Inserts an `index` key value on an array of parsed song package data objects.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array with song package data  objects.
 * @returns {RB3CompatibleDTAFileWithIndex[]}
 */
export const insertIndexOnSongPackagesArray = (songs: RPCS3SongPackagesObjectExtra[]): RPCS3SongPackagesObjectExtraWithIndex[] => {
  return songs.map((song, songIndex) => ({ ...song, index: songIndex }))
}

/**
 * Generic song packages sorting function for filtering.
 * - - - -
 * @param {RB3CompatibleDTAFileWithIndex} a Parsed song data A.
 * @param {RB3CompatibleDTAFileWithIndex} b Parsed song data B.
 * @returns {number}
 */
export const useGenericPackagesCatalogSort = (a: RPCS3SongPackagesObjectExtraWithIndex, b: RPCS3SongPackagesObjectExtraWithIndex): number => {
  if (leadingArticleToTrailing(a.packageData.packageName).toLowerCase() > leadingArticleToTrailing(b.packageData.packageName).toLowerCase()) return 1
  else if (leadingArticleToTrailing(a.packageData.packageName).toLowerCase() < leadingArticleToTrailing(b.packageData.packageName).toLowerCase()) return -1
  else return 0
}

export const filterSongPackagesByName = (packages: RPCS3SongPackagesObjectExtra[], options?: SongPackagesFilterOptions): SongPackagesFilterGenericObject => {
  const { filterEmptyHeader } = useDefaultOptions<SongPackagesFilterOptions>({ filterEmptyHeader: true }, options)
  const sortedPackages = insertIndexOnSongPackagesArray(packages).sort(useGenericPackagesCatalogSort)

  const charZCode = 0x7a
  const headers: SongPackagesFilterGenericHeaders[] = [
    {
      name: '123',
      code: 'titleSymbols',
      indexes: [],
    },
  ] as SongPackagesFilterGenericHeaders[]

  for (let i = 0x61; i <= charZCode; i++) {
    const letter = Buffer.from([i]).toString()
    headers.push({
      name: letter.toUpperCase(),
      code: `title${letter.toUpperCase()}`,
      indexes: [],
    })
  }
  for (const pkg of sortedPackages) {
    const nameWOLeadingArticle = leadingArticleToTrailing(pkg.packageData.packageName)
    const nameFirstChar = nameWOLeadingArticle[0].toLowerCase()
    const nameFirstCharCode = Buffer.from(nameFirstChar)[0]
    if (nameFirstCharCode >= 0x61 && nameFirstCharCode <= charZCode) {
      const charIndex = nameFirstCharCode - 0x60
      headers[charIndex].indexes.push(pkg.index)
    } else headers[0].indexes.push(pkg.index)
  }

  return {
    type: 'name',
    headers: filterEmptyHeader ? headers.filter((val) => val.indexes.length > 0) : headers,
    packagesCount: sortedPackages.length,
  }
}

export const filterSongPackagesByOfficialPkg = (packages: RPCS3SongPackagesObjectExtra[], options?: SongPackagesFilterOptions): SongPackagesFilterGenericObject => {
  const { filterEmptyHeader } = useDefaultOptions<SongPackagesFilterOptions>({ filterEmptyHeader: true }, options)
  const sortedPackages = insertIndexOnSongPackagesArray(packages).sort(useGenericPackagesCatalogSort)

  const charZCode = 0x7a
  const headers: SongPackagesFilterGenericHeaders[] = [
    {
      name: 'Official',
      code: 'official',
      indexes: [],
    },
    {
      name: 'Unofficial',
      code: 'unofficial',
      indexes: [],
    },
  ] as SongPackagesFilterGenericHeaders[]

  for (const pkg of sortedPackages) headers[pkg.official ? 0 : 1].indexes.push(pkg.index)

  return {
    type: 'officialUnofficial',
    headers: filterEmptyHeader ? headers.filter((val) => val.indexes.length > 0) : headers,
    packagesCount: sortedPackages.length,
  }
}
