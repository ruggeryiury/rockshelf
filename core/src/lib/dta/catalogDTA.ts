import { dta, sortDTA, type RB3CompatibleDTAFile } from 'rbtools/lib'
import { leadingArticleToTrailing } from 'rbtools/utils'

export interface DTACatalogGenericHeaders {
  /**
   * The name of header (in English).
   */
  name: string
  code: string
  songsIndexes: number[]
}

export interface DTACatalogByTitleObject {
  type: 'title'
  headers: DTACatalogGenericHeaders[]
}

export interface DTACatalogByGenreObject {
  type: 'genre'
  headers: DTACatalogGenericHeaders[]
}

export type DTACatalogTypes = 'title' | 'artist' | 'genre'

/**
 *
 * @param songs
 * @param filterEmptyHeader `OPTIONAL` Default is `true`.
 * @returns
 */
export const catalogDTAByTitle = (songs: RB3CompatibleDTAFile[], filterEmptyHeader: boolean = true): DTACatalogByTitleObject => {
  const sortedSongs = songs
    .map((val, valI) => ({ ...val, index: valI }))
    .sort((a, b) => {
      if (leadingArticleToTrailing(a.name).toLowerCase() > leadingArticleToTrailing(b.name).toLowerCase()) return 1
      else if (leadingArticleToTrailing(a.name).toLowerCase() < leadingArticleToTrailing(b.name).toLowerCase()) return -1
      else if (leadingArticleToTrailing(a.artist).toLowerCase() > leadingArticleToTrailing(b.artist).toLowerCase()) return 1
      else if (leadingArticleToTrailing(a.artist).toLowerCase() < leadingArticleToTrailing(b.artist).toLowerCase()) return -1
      else return 0
    })

  const charZCode = 0x7a
  const headers: DTACatalogGenericHeaders[] = [
    {
      name: '123',
      code: 'titleSymbols',
      songsIndexes: [],
    },
  ] as DTACatalogGenericHeaders[]

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
  }
}

/**
 *
 * @param songs
 * @param filterEmptyHeader `OPTIONAL` Default is `true`.
 * @returns
 */
export const catalogDTAByGenre = (songs: RB3CompatibleDTAFile[], filterEmptyHeader: boolean = true): DTACatalogByGenreObject => {
  const sortedSongs = songs
    .map((val, valI) => ({ ...val, index: valI }))
    .sort((a, b) => {
      if (leadingArticleToTrailing(a.name).toLowerCase() > leadingArticleToTrailing(b.name).toLowerCase()) return 1
      else if (leadingArticleToTrailing(a.name).toLowerCase() < leadingArticleToTrailing(b.name).toLowerCase()) return -1
      else if (leadingArticleToTrailing(a.artist).toLowerCase() > leadingArticleToTrailing(b.artist).toLowerCase()) return 1
      else if (leadingArticleToTrailing(a.artist).toLowerCase() < leadingArticleToTrailing(b.artist).toLowerCase()) return -1
      else return 0
    })

  const headers: DTACatalogGenericHeaders[] = [
    // ...(() => {
    //   const genres: DTACatalogGenericHeaders[] = []
    //   return genres
    // })(),
  ] as DTACatalogGenericHeaders[]

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
  }
}
