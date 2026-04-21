import { type PartialDTAFile, type RB3CompatibleDTAFile, type SongSortingTypes } from '../../lib.exports'
import { omitLeadingArticle } from '../../utils.exports'

export type AnyDTAType = RB3CompatibleDTAFile | PartialDTAFile
export type AnyDTATypeArray = RB3CompatibleDTAFile[] | PartialDTAFile[]
export type DTASelfReturnType<T> = T

/**
 * Sorts an array of `RB3CompatibleDTAFile` objects based on a song data value.
 * - - - -
 * @template {AnyDTATypeArray} T
 * @param {AnyDTATypeArray} songs An array with `RB3CompatibleDTAFile` objects.
 * @param {SongSortingTypes} sortBy The sorting type.
 * @returns {DTASelfReturnType<T>}
 */
export const sortDTA = <T extends AnyDTATypeArray>(songs: T, sortBy: SongSortingTypes): T => {
  if (sortBy === 'Song Title') {
    return songs.sort((a, b) => {
      const AID = a.id.toLowerCase()
      const BID = b.id.toLowerCase()
      const nameA = a.name ? omitLeadingArticle(a.name.toLowerCase()) : undefined
      const nameB = b.name ? omitLeadingArticle(b.name.toLowerCase()) : undefined

      if (nameA !== undefined && nameB !== undefined) return nameA.localeCompare(nameB)

      if (nameA !== undefined) return -1
      if (nameB !== undefined) return 1
      return AID.localeCompare(BID)
    }) as DTASelfReturnType<T>
  } else if (sortBy === 'Artist') {
    return songs.sort((a, b) => {
      const AID = a.id.toLowerCase()
      const BID = b.id.toLowerCase()
      const artistA = a.artist ? omitLeadingArticle(a.artist.toLowerCase()) : undefined
      const artistB = b.artist ? omitLeadingArticle(b.artist.toLowerCase()) : undefined

      if (artistA !== undefined && artistB !== undefined) return artistA.localeCompare(artistB)

      if (artistA !== undefined) return -1
      if (artistB !== undefined) return 1
      return AID.localeCompare(BID)
    }) as DTASelfReturnType<T>
  } else if (sortBy === 'Artist, Song Title') {
    return songs.sort((a, b) => {
      const AID = a.id.toLowerCase()
      const BID = b.id.toLowerCase()
      const artistA = a.artist ? omitLeadingArticle(a.artist.toLowerCase()) : undefined
      const artistB = b.artist ? omitLeadingArticle(b.artist.toLowerCase()) : undefined
      const nameA = a.name ? omitLeadingArticle(a.name.toLowerCase()) : undefined
      const nameB = b.name ? omitLeadingArticle(b.name.toLowerCase()) : undefined

      if (artistA !== undefined && artistB !== undefined) return artistA.localeCompare(artistB)
      if (nameA !== undefined && nameB !== undefined) return nameA.localeCompare(nameB)

      if (artistA !== undefined) return -1
      if (artistB !== undefined) return 1
      if (nameA !== undefined) return -1
      if (nameB !== undefined) return 1

      return AID.localeCompare(BID)
    }) as DTASelfReturnType<T>
  } else if (sortBy === 'Song Title, Artist') {
    return songs.sort((a, b) => {
      const AID = a.id.toLowerCase()
      const BID = b.id.toLowerCase()
      const nameA = a.name ? omitLeadingArticle(a.name.toLowerCase()) : undefined
      const nameB = b.name ? omitLeadingArticle(b.name.toLowerCase()) : undefined
      const artistA = a.artist ? omitLeadingArticle(a.artist.toLowerCase()) : undefined
      const artistB = b.artist ? omitLeadingArticle(b.artist.toLowerCase()) : undefined

      if (nameA !== undefined && nameB !== undefined) return nameA.localeCompare(nameB)
      if (artistA !== undefined && artistB !== undefined) return artistA.localeCompare(artistB)

      if (nameA !== undefined) return -1
      if (nameB !== undefined) return 1
      if (artistA !== undefined) return -1
      if (artistB !== undefined) return 1

      return AID.localeCompare(BID)
    }) as DTASelfReturnType<T>
  } else if (sortBy === 'Artist, Year Released, Album Name, Album Track Number') {
    return songs.sort((a, b) => {
      const AID = a.id.toLowerCase()
      const BID = b.id.toLowerCase()
      const artistA = a.artist ? omitLeadingArticle(a.artist.toLowerCase()) : undefined
      const artistB = b.artist ? omitLeadingArticle(b.artist.toLowerCase()) : undefined
      const yearA = a.year_released ?? undefined
      const yearB = b.year_released ?? undefined
      const albumA = a.album_name ? omitLeadingArticle(a.album_name.toLowerCase()) : undefined
      const albumB = b.album_name ? omitLeadingArticle(b.album_name.toLowerCase()) : undefined
      const trackA = a.album_track_number ?? undefined
      const trackB = b.album_track_number ?? undefined

      if (artistA !== undefined && artistB !== undefined) return artistA.localeCompare(artistB)
      if (yearA !== undefined && yearB !== undefined) return yearA.toString().localeCompare(yearB.toString())
      if (albumA !== undefined && albumB !== undefined) return albumA.localeCompare(albumB)
      if (trackA !== undefined && trackB !== undefined) return trackA.toString().localeCompare(trackB.toString())

      if (artistA !== undefined) return -1
      if (artistB !== undefined) return 1
      if (yearA !== undefined) return -1
      if (yearB !== undefined) return 1
      if (albumA !== undefined) return -1
      if (albumB !== undefined) return 1
      if (trackA !== undefined) return -1
      if (trackB !== undefined) return 1

      return AID.localeCompare(BID)
    }) as DTASelfReturnType<T>
  } else if (sortBy === 'ID') {
    return songs.sort((a, b) => {
      const AID = a.id.toLowerCase()
      const BID = b.id.toLowerCase()
      return AID.localeCompare(BID)
    }) as DTASelfReturnType<T>
  } else if (sortBy === 'Song ID') {
    return songs.sort((a, b) => {
      const AID = Number(a.song_id)
      const BID = Number(b.song_id)
      if (isNaN(AID)) return -1
      if (isNaN(BID)) return -1

      if (AID > BID) return 1
      else if (AID < BID) return -1
      else return 0
    }) as DTASelfReturnType<T>
  } else {
    // sortBy === 'Shortname'
    return songs.sort((a, b) => {
      const AID = a.songname?.toLocaleLowerCase() ?? ''
      const BID = b.songname?.toLowerCase() ?? ''
      return AID.localeCompare(BID)
    }) as DTASelfReturnType<T>
  }
  return songs
}
