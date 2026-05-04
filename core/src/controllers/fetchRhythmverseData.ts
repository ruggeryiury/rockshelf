import { useHandler } from '../core.exports'
import { RhythmverseAPI } from '../lib/rbtools'

export type RhythmverseDataFetchingTypes = 'text' | 'artist'

export const fetchRhythmverseData = useHandler(async (_, __, type: RhythmverseDataFetchingTypes, searchField: string) => {
  switch (type) {
    case 'text':
    default: {
      const searchResults = await RhythmverseAPI.searchText(searchField)
      if (searchResults.data.songs) {
        searchResults.data.songs.forEach((entry) => console.log(entry))
      }
      return RhythmverseAPI.processRawData(searchResults)
    }
    case 'artist': {
      const searchResults = await RhythmverseAPI.searchArtist(searchField)
      return RhythmverseAPI.processRawData(searchResults)
    }
  }
})
