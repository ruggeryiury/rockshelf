import { useDefaultOptions } from 'use-default-options'
import { sendRendererConsole, useHandler } from '../core.exports'
import { RhythmverseAPI, rhythmverseAPISourceSearchURL, rhythmverseAPISourceURL, rhythmverseOptsLocale, type ProcessedRhythmverseObject, type RawRhythmverseResponse, type RhythmverseFetchingOptions } from '../lib/rbtools'
import axios, { AxiosError } from 'axios'

export type RhythmverseDataFetchingTypes = 'text' | 'artist'

export const fetchRhythmverseData = useHandler(async (win, __, searchField: string, type: RhythmverseDataFetchingTypes, options?: RhythmverseFetchingOptions): Promise<ProcessedRhythmverseObject> => {
  if (searchField.length === 0) {
    const opts = useDefaultOptions<RhythmverseFetchingOptions>(
      {
        source: 'rb3xbox',
        sortBy: 'updateDate',
        sortOrder: 'asc',
        page: 1,
        records: 25,
        fullBand: false,
        multitrack: false,
        pitchedVocals: true,
      },
      options
    )

    const reqURL: string = rhythmverseAPISourceURL[opts.source]

    const urlParams: Record<string, string> = {
      'sort[0][sort_by]': rhythmverseOptsLocale[opts.sortBy],
      'sort[0][sort_order]': rhythmverseOptsLocale[opts.sortOrder],
      page: opts.page.toString(),
      records: opts.records.toString(),
      data_type: 'full',
    }

    if (opts.fullBand) urlParams.fullband = 'true'
    if (opts.multitrack) urlParams.audio = 'full'
    if (opts.pitchedVocals) urlParams.vocals = 'pitched'

    if (opts.sortBy === 'updateDate' || opts.sortBy === 'downloads') urlParams['sort[0][sort_order]'] = 'DESC'

    const reqData = new URLSearchParams(urlParams).toString()
    const reqHeaders = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }

    try {
      const res = await axios.post<RawRhythmverseResponse>(reqURL, reqData, {
        headers: reqHeaders,
      })

      return RhythmverseAPI.processRawData(res.data)
    } catch (err) {
      if (err instanceof AxiosError) throw new Error(err.message, { cause: err })
      else throw err
    }
  } else {
    switch (type) {
      case 'text':
      default: {
        const searchResults = await RhythmverseAPI.searchText(searchField, options)
        sendRendererConsole(win, searchResults)
        return RhythmverseAPI.processRawData(searchResults)
      }
      case 'artist': {
        const searchResults = await RhythmverseAPI.searchArtist(searchField, options)
        return RhythmverseAPI.processRawData(searchResults)
      }
    }
  }
})
