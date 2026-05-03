import { useHandler } from '../core.exports'
import { RhythmverseAPI } from '../lib/rbtools'

export type RhythmverseDataFetchingTypes = 'text' | 'artist'

export const fetchRhythmverseData = useHandler(async (_, __, type: RhythmverseDataFetchingTypes, searchField: string) => {
  switch (type) {
    case 'text':
    default:
      return RhythmverseAPI.processRawData(await RhythmverseAPI.searchText(searchField))
    case 'artist':
      return RhythmverseAPI.processRawData(await RhythmverseAPI.searchArtist(searchField))
  }
})
