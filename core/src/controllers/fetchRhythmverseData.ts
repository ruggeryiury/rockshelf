import { useHandler } from '../core.exports'
import { RhythmverseAPI, type ProcessedRhythmverseObject } from '../lib/rbtools'

export type RhythmverseDataFetchingTypes = 'text' | 'artist'

export const fetchRhythmverseData = useHandler(async (_, __, type: RhythmverseDataFetchingTypes, searchField: string): Promise<ProcessedRhythmverseObject> => {
  switch (type) {
    case 'text':
    default: {
      const searchResults = await RhythmverseAPI.searchText(searchField)
      return RhythmverseAPI.processRawData(searchResults)
    }
    case 'artist': {
      const searchResults = await RhythmverseAPI.searchArtist(searchField)
      return RhythmverseAPI.processRawData(searchResults)
    }
  }
})
