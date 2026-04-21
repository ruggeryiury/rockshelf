import { useDefaultOptions } from 'use-default-options'
import type { ScoreDataInstrumentTypes } from '../../core.exports'
import { leadingArticleToTrailing, formatStringFromDTA } from '../../utils.exports'
import { dta, rankCalculator, type RB3CompatibleDTAFile } from '../../lib.exports'

export interface DTAFilterGenericHeaders {
  /**
   * The name of header (in English).
   */
  name: string
  /**
   * A unique string to identity the header.
   */
  code: string
  /**
   * An array with indexes of songs from the original songs array.
   */
  songsIndexes: number[]
}

export type DTAFilterTypes = 'title' | 'artist' | 'genre' | 'decade' | 'yearReleased' | 'difficulty'

export interface DTAFilterGenericObject {
  /**
   * The type of the catalog.
   */
  type: Exclude<DTAFilterTypes, 'artist' | 'difficulty'>
  /**
   * An array with objects representing each header from the specified type.
   */
  headers: DTAFilterGenericHeaders[]
  /**
   * The amount of songs from the original songs array.
   */
  songsCount: number
}

export interface DTAFilterByDifficultyObject extends Omit<DTAFilterGenericObject, 'type'> {
  /**
   * The type of the catalog.
   */
  type: 'difficulty'
  /**
   * The selected instrument that the catalog based its ranking from.
   */
  instrument: ScoreDataInstrumentTypes
}

export interface DTAFilterArtistHeaders extends DTAFilterGenericHeaders {
  /**
   * An array with objects representing each album from the artist that meets the amount of songs necessary to make it worthy of its own sub-header.
   */
  albums: DTAFilterGenericHeaders[]
  /**
   * The amount of songs from the artist.
   */
  songsCount: number
}

export interface DTAFilterByArtistObject extends Omit<DTAFilterGenericObject, 'type' | 'headers'> {
  /**
   * The type of the catalog.
   */
  type: 'artist'
  /**
   * An array with objects representing each header from the specified type.
   */
  headers: DTAFilterArtistHeaders[]
}

export interface DTAFilterOptions {
  /**
   * Remove unused headers. Default is `true`.
   */
  filterEmptyHeader?: boolean
  /**
   * The selected instrument to gather difficulty data from when requesting sorting by instrument difficulty.
   */
  instrument: ScoreDataInstrumentTypes
}

export type RB3CompatibleDTAFileWithIndex = RB3CompatibleDTAFile & {
  /**
   * A number to track down the song's index on the original array.
   */
  index: number
}

/**
 * Inserts an `index` key value on an array of parsed song data objects.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array with parsed song data objects.
 * @returns {RB3CompatibleDTAFileWithIndex[]}
 */
export const insertIndexOnSongsArray = (songs: RB3CompatibleDTAFile[]): RB3CompatibleDTAFileWithIndex[] => {
  return songs.map((song, songIndex) => ({ ...song, index: songIndex }))
}

/**
 * Generic songs sorting function for filtering.
 * - - - -
 * @param {RB3CompatibleDTAFileWithIndex} a Parsed song data A.
 * @param {RB3CompatibleDTAFileWithIndex} b Parsed song data B.
 * @returns {number}
 */
export const useGenericCatalogSort = (a: RB3CompatibleDTAFileWithIndex, b: RB3CompatibleDTAFileWithIndex): number => {
  if (leadingArticleToTrailing(a.name).toLowerCase() > leadingArticleToTrailing(b.name).toLowerCase()) return 1
  else if (leadingArticleToTrailing(a.name).toLowerCase() < leadingArticleToTrailing(b.name).toLowerCase()) return -1
  else if (leadingArticleToTrailing(a.artist).toLowerCase() > leadingArticleToTrailing(b.artist).toLowerCase()) return 1
  else if (leadingArticleToTrailing(a.artist).toLowerCase() < leadingArticleToTrailing(b.artist).toLowerCase()) return -1
  else return 0
}

/**
 * Filters and catalogs an array of parsed songs data by song title into a header-based sorting object used in-game.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array of parsed songs data to be filtered and cataloged.
 * @param {DTAFilterOptions | undefined} options `OPTIONAL` An object with parameters that tweaks the filtering functionality.
 * @returns {DTAFilterGenericObject}
 */
export const filterDTAByTitle = (songs: RB3CompatibleDTAFile[], options?: DTAFilterOptions): DTAFilterGenericObject => {
  const { filterEmptyHeader } = useDefaultOptions<DTAFilterOptions>({ filterEmptyHeader: true, instrument: 'band' }, options)
  const sortedSongs = insertIndexOnSongsArray(songs).sort(useGenericCatalogSort)

  const charZCode = 0x7a
  const headers: DTAFilterGenericHeaders[] = [
    {
      name: '123',
      code: 'titleSymbols',
      songsIndexes: [],
    },
  ] as DTAFilterGenericHeaders[]

  for (let i = 0x61; i <= charZCode; i++) {
    const letter = Buffer.from([i]).toString()
    headers.push({
      name: letter.toUpperCase(),
      code: `title${letter.toUpperCase()}`,
      songsIndexes: [],
    })
  }

  for (const song of sortedSongs) {
    const nameWOLeadingArticle = leadingArticleToTrailing(song.name)
    const nameFirstChar = nameWOLeadingArticle[0].toLowerCase()
    const nameFirstCharCode = Buffer.from(nameFirstChar)[0]
    if (nameFirstCharCode >= 0x61 && nameFirstCharCode <= charZCode) {
      const charIndex = nameFirstCharCode - 0x60
      headers[charIndex].songsIndexes.push(song.index)
    } else headers[0].songsIndexes.push(song.index)
  }

  return {
    type: 'title',
    headers: filterEmptyHeader ? headers.filter((val) => val.songsIndexes.length > 0) : headers,
    songsCount: sortedSongs.length,
  }
}

/**
 * Filters and catalogs an array of parsed songs data by music genre into a header-based sorting object used in-game.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array of parsed songs data to be filtered and cataloged.
 * @param {DTAFilterOptions | undefined} options `OPTIONAL` An object with parameters that tweaks the filtering functionality.
 * @returns {DTAFilterGenericObject}
 */
export const filterDTAByGenre = (songs: RB3CompatibleDTAFile[], options?: DTAFilterOptions): DTAFilterGenericObject => {
  const { filterEmptyHeader } = useDefaultOptions<DTAFilterOptions>({ filterEmptyHeader: true, instrument: 'band' }, options)
  const sortedSongs = insertIndexOnSongsArray(songs).sort(useGenericCatalogSort)

  const headers: DTAFilterGenericHeaders[] = [] as DTAFilterGenericHeaders[]

  const allGenres = { ...dta.genre, ...dta.genreDX }

  for (const key of Object.keys(allGenres).toSorted() as (keyof typeof allGenres)[]) {
    headers.push({ name: allGenres[key], code: key, songsIndexes: [] })
  }

  for (const song of sortedSongs) {
    const genre = song.customsource?.genre || song.genre

    const i = headers.findIndex((val) => val.code.toLowerCase() === genre.toLowerCase())
    if (i > -1 && i in headers) headers[i].songsIndexes.push(song.index)
  }

  return {
    type: 'genre',
    headers: filterEmptyHeader ? headers.filter((val) => val.songsIndexes.length > 0) : headers,
    songsCount: sortedSongs.length,
  }
}

/**
 * Filters and catalogs an array of parsed songs data by song decade into a header-based sorting object used in-game.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array of parsed songs data to be filtered and cataloged.
 * @param {DTAFilterOptions | undefined} options `OPTIONAL` An object with parameters that tweaks the filtering functionality.
 * @returns {DTAFilterGenericObject}
 */
export const filterDTAByDecade = (songs: RB3CompatibleDTAFile[], options?: DTAFilterOptions): DTAFilterGenericObject => {
  const { filterEmptyHeader } = useDefaultOptions<DTAFilterOptions>({ filterEmptyHeader: true, instrument: 'band' }, options)
  const sortedSongs = insertIndexOnSongsArray(songs).sort(useGenericCatalogSort)

  const headers: DTAFilterGenericHeaders[] = []

  for (let i = 0; i < 10; i++) {
    headers.push({
      code: `the19${i.toString()}0s`,
      name: `The ${i.toString()}0s`,
      songsIndexes: [],
    })
  }

  for (let i = 0; i < 10; i++) {
    headers.push({
      code: `the20${i.toString()}0s`,
      name: `The 20${i.toString()}0s`,
      songsIndexes: [],
    })
  }

  for (const song of sortedSongs) {
    let i = 0
    const firstTwoNumbers = Number(song.year_released.toString().slice(0, 2))
    const decade = Number(song.year_released.toString()[2])

    if (firstTwoNumbers === 20) i += 10
    i += decade

    headers[i].songsIndexes.push(song.index)
  }

  return {
    type: 'decade',
    headers: filterEmptyHeader ? headers.filter((val) => val.songsIndexes.length > 0) : headers,
    songsCount: sortedSongs.length,
  }
}

/**
 * Filters and catalogs an array of parsed songs data by year released into a header-based sorting object used in-game.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array of parsed songs data to be filtered and cataloged.
 * @param {DTAFilterOptions | undefined} options `OPTIONAL` An object with parameters that tweaks the filtering functionality.
 * @returns {DTAFilterGenericObject}
 */
export const filterDTAByYearReleased = (songs: RB3CompatibleDTAFile[], options?: DTAFilterOptions): DTAFilterGenericObject => {
  const { filterEmptyHeader } = useDefaultOptions<DTAFilterOptions>({ filterEmptyHeader: true, instrument: 'band' }, options)
  const sortedSongs = insertIndexOnSongsArray(songs).sort(useGenericCatalogSort)

  const headers: DTAFilterGenericHeaders[] = []

  for (let i = 1900; i <= 2050; i++) {
    headers.push({
      code: `year${i}`,
      name: i.toString(),
      songsIndexes: [],
    })
  }

  for (const song of sortedSongs) {
    headers[song.year_released - 1900].songsIndexes.push(song.index)
  }

  return {
    type: 'yearReleased',
    headers: filterEmptyHeader ? headers.filter((val) => val.songsIndexes.length > 0) : headers,
    songsCount: sortedSongs.length,
  }
}

/**
 * Filters and catalogs an array of parsed songs data by instrument difficulty into a header-based sorting object used in-game.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array of parsed songs data to be filtered and cataloged.
 * @param {DTAFilterOptions | undefined} options `OPTIONAL` An object with parameters that tweaks the filtering functionality.
 * @returns {DTAFilterGenericObject}
 */
export const filterDTAByInstrumentDifficulty = (songs: RB3CompatibleDTAFile[], options?: DTAFilterOptions): DTAFilterByDifficultyObject => {
  const { filterEmptyHeader, instrument } = useDefaultOptions<DTAFilterOptions>({ filterEmptyHeader: true, instrument: 'band' }, options)
  const sortedSongs = insertIndexOnSongsArray(songs).sort(useGenericCatalogSort)

  const headers: (Omit<DTAFilterGenericHeaders, 'songsIndexes'> & { songsIndexes: RB3CompatibleDTAFileWithIndex[] })[] = [
    { name: 'Warmup', code: 'diff0' },
    { name: 'Apprentice', code: 'diff1' },
    { name: 'Solid', code: 'diff2' },
    { name: 'Moderate', code: 'diff3' },
    { name: 'Challenging', code: 'diff4' },
    { name: 'Nightmare', code: 'diff5' },
    { name: 'Impossible', code: 'diff6' },
    { name: 'No Part', code: 'noPart' },
  ].map((val) => ({ ...val, songsIndexes: [] }))

  const key = (() => {
    switch (instrument) {
      default:
        return instrument
      case 'drums':
        return 'drum'
      case 'harmonies':
        return 'vocals'
      case 'proBass':
        return 'real_bass'
      case 'proDrums':
        return 'drum'
      case 'proGuitar':
        return 'real_guitar'
      case 'proKeys':
        return 'real_keys'
    }
  })()

  const rankKey = `rank_${key}` as const

  for (const song of sortedSongs) {
    const rawRankValue = song[rankKey]
    const rankValue = rankCalculator(key, rawRankValue)
    // console.log(instrument, key, song[`rank_${key}`], rankValue)

    if (rankValue === -1) headers[7].songsIndexes.push(song)
    else headers[rankValue].songsIndexes.push(song)
  }

  for (const header of headers) {
    header.songsIndexes.sort((a, b) => {
      if (a[rankKey] && !b[rankKey]) return -1
      if (!a[rankKey] && b[rankKey]) return 1
      if (a[rankKey] && b[rankKey]) return a[rankKey] - b[rankKey]
      return 0
    })
  }

  return {
    type: 'difficulty',
    instrument,
    headers: (filterEmptyHeader ? headers.filter((val) => val.songsIndexes.length > 0) : headers).map((val) => ({ ...val, songsIndexes: val.songsIndexes.map((val2) => val2.index) })),
    songsCount: sortedSongs.length,
  }
}

/**
 * Filters and catalogs an array of parsed songs data by song artist/band into a header-based sorting object used in-game.
 * - - - -
 * @param {RB3CompatibleDTAFile[]} songs An array of parsed songs data to be filtered and cataloged.
 * @param {DTAFilterOptions | undefined} options `OPTIONAL` An object with parameters that tweaks the filtering functionality.
 * @returns {DTAFilterGenericObject}
 */
export const filterDTAByArtist = (songs: RB3CompatibleDTAFile[], options?: DTAFilterOptions): DTAFilterByArtistObject => {
  //   const _options = useDefaultOptions<DTAFilterOptions>({ filterEmptyHeader: true, instrument: 'band' }, options)

  const collator = new Intl.Collator(undefined, {
    sensitivity: 'base',
  })

  const sortedSongs = insertIndexOnSongsArray(songs).sort((a, b) => {
    // 1. Artist
    let val = collator.compare(leadingArticleToTrailing(a.artist), leadingArticleToTrailing(b.artist))
    if (val !== 0) return val

    // 2. Album (undefined goes LAST)
    if (a.album_name && !b.album_name) return -1
    if (!a.album_name && b.album_name) return 1

    if (a.album_name && b.album_name) {
      val = collator.compare(leadingArticleToTrailing(a.album_name), leadingArticleToTrailing(b.album_name))
      if (val !== 0) return val
    }

    // 3. Track number
    val = (a.album_track_number ?? 0) - (b.album_track_number ?? 0)
    if (val !== 0) return val

    // Final: song_id (number OR string)
    const idA = a.song_id
    const idB = b.song_id

    if (typeof idA === 'number' && typeof idB === 'number') {
      return idA - idB
    }

    return String(idA).localeCompare(String(idB), undefined, {
      numeric: true, // ✅ handles "2" vs "10" correctly
    })
  })

  const headers: DTAFilterArtistHeaders[] = []

  const allArtists = new Set()

  for (const song of sortedSongs) {
    allArtists.add(song.artist)
  }

  const artistArray = Array.from(allArtists.values()) as string[]

  for (const artist of artistArray) {
    const artistSort = leadingArticleToTrailing(artist).toLowerCase()
    const allSongsFromArtist: RB3CompatibleDTAFileWithIndex[] = []
    const artistSongs: RB3CompatibleDTAFileWithIndex[] = []
    const allAlbums = new Set()

    for (const song of sortedSongs) {
      if (leadingArticleToTrailing(song.artist).toLowerCase() === artistSort) allSongsFromArtist.push(song)
    }

    for (const song of allSongsFromArtist) allAlbums.add(song.album_name)
    const albumsArray = (Array.from(allAlbums.values()) as (string | undefined)[])
      .filter((val) => typeof val === 'string')
      .map(
        (val) =>
          ({
            name: val,
            code: formatStringFromDTA(null, leadingArticleToTrailing(val), 'id'),
            songsIndexes: [],
          }) as Omit<DTAFilterGenericHeaders, 'songsIndexes'> & { songsIndexes: RB3CompatibleDTAFileWithIndex[] }
      )

    for (const album of albumsArray) {
      for (const song of allSongsFromArtist) {
        if (!song.album_name) {
          artistSongs.push(song)
          continue
        }

        if (leadingArticleToTrailing(song.album_name).toLowerCase() === leadingArticleToTrailing(album.name).toLowerCase()) {
          album.songsIndexes.push(song)
          continue
        }
      }
    }

    const validAlbumsArray: (Omit<DTAFilterGenericHeaders, 'songsIndexes'> & { songsIndexes: RB3CompatibleDTAFileWithIndex[] })[] = []

    for (const album of albumsArray) {
      if (album.songsIndexes.length < 3) artistSongs.push(...album.songsIndexes)
      else validAlbumsArray.push(album)
    }

    for (const song of allSongsFromArtist) {
      if (!song.album_name) artistSongs.push(song)
    }

    artistSongs.sort((a, b) => collator.compare(leadingArticleToTrailing(a.name), leadingArticleToTrailing(b.name)))

    headers.push({ name: artist, code: formatStringFromDTA(null, leadingArticleToTrailing(artist), 'id'), albums: validAlbumsArray.map((val) => ({ ...val, songsIndexes: val.songsIndexes.map((val2) => val2.index) })), songsIndexes: artistSongs.map((val) => val.index), songsCount: allSongsFromArtist.length })
  }

  return {
    type: 'artist',
    headers,
    songsCount: sortedSongs.length,
  }
}
