import readline from 'node:readline'
import { type Readable, Writable } from 'node:stream'
import { finished } from 'node:stream/promises'
import axios, { AxiosError } from 'axios'
import { type FilePath, getReadableBytesSize, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import { type PartialDTAFile } from '../lib.exports'
import { isValidURL, normalizeString } from '../utils.exports'

// #region Types

export const rhythmverseAPISourceURL = {
  all: 'https://rhythmverse.co/api/all/songfiles/list',
  rb3: 'https://rhythmverse.co/api/rb3/songfiles/list',
  rb3xbox: 'https://rhythmverse.co/api/rb3xbox/songfiles/list',
  rb3wii: 'https://rhythmverse.co/api/rb3wii/songfiles/list',
  rb3ps3: 'https://rhythmverse.co/api/rb3ps3/songfiles/list',
  wtde: 'https://rhythmverse.co/api/wtde/songfiles/list',
  tbrbxbox: 'https://rhythmverse.co/api/tbrbxbox/songfiles/list',
  yarg: 'https://rhythmverse.co/api/yarg/songfiles/list',
  rb2xbox: 'https://rhythmverse.co/api/rb2xbox/songfiles/list',
  ps: 'https://rhythmverse.co/api/ps/songfiles/list',
  chm: 'https://rhythmverse.co/api/chm/songfiles/list',
  gh3pc: 'https://rhythmverse.co/api/gh3pc/songfiles/list',
} as const

export const rhythmverseAPISourceSearchURL: Record<keyof typeof rhythmverseAPISourceURL, string> = {
  all: 'https://rhythmverse.co/api/all/songfiles/search/live',
  rb3: 'https://rhythmverse.co/api/rb3/songfiles/search/live',
  rb3xbox: 'https://rhythmverse.co/api/rb3xbox/songfiles/search/live',
  rb3wii: 'https://rhythmverse.co/api/rb3wii/songfiles/search/live',
  rb3ps3: 'https://rhythmverse.co/api/rb3ps3/songfiles/search/live',
  wtde: 'https://rhythmverse.co/api/wtde/songfiles/search/live',
  tbrbxbox: 'https://rhythmverse.co/api/tbrbxbox/songfiles/search/live',
  yarg: 'https://rhythmverse.co/api/yarg/songfiles/search/live',
  rb2xbox: 'https://rhythmverse.co/api/rb2xbox/songfiles/search/live',
  ps: 'https://rhythmverse.co/api/ps/songfiles/search/live',
  chm: 'https://rhythmverse.co/api/chm/songfiles/search/live',
  gh3pc: 'https://rhythmverse.co/api/gh3pc/songfiles/search/live',
}

export interface RhythmverseFetchingOptions {
  /** The game source of the fetched songs. Default is `rb3xbox`. */
  source?: keyof typeof rhythmverseAPISourceURL
  /** The sorting type. Default is `updateDate`. */
  sortBy?: 'updateDate' | 'title' | 'artist' | 'length' | 'author' | 'releaseDate' | 'downloads'
  /** The order of the sorting. Default is `asc`. */
  sortOrder?: 'asc' | 'desc'
  /** The pagination of the results based on the given `records` variable. Default is `1`. */
  page?: number
  /** The quantity of the records to be fetched. Default is `25`. */
  records?: number
  /** If `true`, the API will only fetch songs with all instruments charted. Default is `false`. */
  fullBand?: boolean
  /** If `true`, the API will only fetch songs with multitracks. Default is `false`. */
  multitrack?: boolean
  /** If `true`, the API will only fetch songs with pitched vocals. Default is `true`. */
  pitchedVocals?: boolean
}

export const rhythmverseOptsLocale = {
  artist: 'artist',
  asc: 'ASC',
  author: 'author',
  desc: 'DESC',
  downloads: 'downloads',
  length: 'length',
  releaseDate: 'release_date',
  title: 'title',
  updateDate: 'update_date',
} as const

export interface RawRhythmverseResponse {
  status: string
  data: {
    records: {
      total_available: number
      total_filtered: number
      returned: number
    }
    pagination: {
      start: number
      records: string
      page: string
    }
    songs:
      | {
          data: RhythmverseResSongData
          file: RhythmverseResSongFile
        }[]
      | false
  }
}

export interface RhythmverseResSongData {
  song_id: number
  member_id: number
  record_saved: number
  record_updated: number
  record_locked: number
  record_comments: number
  record_views: number
  song_length: number
  genre: string
  subgenre: string
  year: number
  album: string
  album_s: string
  album_track_number?: number
  decade: number
  artist: string
  artist_s: string
  artist_id: number
  title: string
  diff_drums: string
  diff_guitar: string
  diff_bass: string
  diff_vocals: string
  diff_keys: string
  diff_prokeys: string
  diff_proguitar: string
  diff_probass: string
  diff_band?: string
  master: number
  vocal_parts?: string
  gender?: string
  rating: string
  song_preview: any
  song_notes?: string
  downloads: number
  record_approved: number
  diff_rhythm: any
  diff_guitar_coop: any
  diff_drums_real_ps: any
  diff_keys_real_ps: any
  diff_dance: any
  diff_vocals_harm: any
  diff_guitarghl: any
  diff_bassghl: any
  genre_is_literal: number
  rank_drums: any
  rank_guitar: any
  rank_bass: any
  rank_vocals: any
  rank_keys: any
  rank_prokeys: any
  rank_probass: any
  rank_proguitar: any
  rank_guitar_coop: any
  rank_band: any
  album_art: string
  tiers: {
    songstiers_id?: number
    song_id?: number
    gameformat?: string
    diff_drums?: string
    diff_guitar?: string
    diff_bass?: string
    diff_vocals?: string
    diff_keys?: string
    diff_prokeys?: string
    diff_proguitar?: string
    diff_probass?: string
    diff_band?: string
    diff_dance: any
    diff_bassghl: any
    diff_guitarghl: any
    diff_keys_real_ps: any
    diff_drums_real_ps: any
    diff_vocals_harm: any
    diff_guitar_coop: any
    diff_rhythm: any
    rank_drums: any
    rank_guitar: any
    rank_bass: any
    rank_vocals: any
    rank_keys: any
    rank_prokeys: any
    rank_probass: any
    rank_proguitar: any
    rank_guitar_coop: any
    rank_band: any
  }
  genre_id: string
  record_id: string
}

export interface RhythmverseResSongFile {
  diff_drums: number
  diff_guitar: number
  diff_bass: number
  diff_vocals?: number
  diff_proguitar?: number
  diff_probass?: number
  diff_band: number
  rank_drums: number
  rank_guitar: number
  rank_bass: number
  rank_vocals: number
  rank_probass: number
  rank_proguitar: number
  rank_band: number
  file_id: string
  db_id: number
  user: string
  user_folder: string
  file_name: string
  giorno: string
  gameformat: string
  gamesource: string
  source: any
  group_id: any
  alt_versions?: {
    id: string
    title: string
    short_title: string
  }[]
  downloads: number
  deleted: number
  retired: number
  destroyed: number
  size: number
  utility: number
  unpitched: number
  audio_type: string
  tuning_offset_cents: string
  encoding: string
  has_reductions: string
  vocal_parts_authored?: string
  file_preview?: string
  file_notes?: string
  custom_id: string
  external_url?: string
  disc: string
  completeness?: number
  wip: any
  wip_date: string
  record_hidden: number
  release_date: string
  future_release_date: any
  delete_date: any
  retire_date: any
  pro_drums: number
  vocals_lyrics_only: number
  charter: any
  record_updated: string
  file_updated: string
  record_created: string
  file_artist: string
  file_artist_s: string
  file_title: string
  file_album: string
  file_album_s: string
  file_genre: string
  file_subgenre: any
  file_genre_is_literal: number
  file_year: number
  file_decade: number
  file_song_length: number
  file_album_track_number?: number
  filename: string
  upload_date: string
  off: number
  author: {
    member_id: number
    name: string
    account: string
    releases: number
    default_gameformat?: string
    shortname: string
    role: string
    author_class: any
    level: boolean
    confirmed: number
    source: number
    id: number
    dl_count: number
    public_profile_page: string
    songlist_url: string
    author_url: string
    author_url_full: string
    avatar_path: string
  }
  hidden: boolean
  game_completeness: number
  file_url: string
  file_url_full: string
  author_id: string
  comments: number
  update_date: any
  album_art: string
  file_genre_id: string
  difficulties: {
    drums: any
    guitar: any
    bass: any
    vocals: any
    keys: any
    prokeys: any
  }
  credits: any[]
  thanks: number
  download_url: string
  download_page_url: string
  download_page_url_full: string
  group: any
  song_length: number
  diff_keys?: number
  rank_keys?: number
  diff_prokeys?: number
  rank_prokeys?: number
}

export type ProcessedRhythmverseSongData = Omit<PartialDTAFile, 'id' | 'album_art'> & {
  /** The URL of the album artwork. */
  album_art: string
  /** The file name of the song. */
  file_name?: string
  /** The Rhythmverse URL of the song. */
  song_url: string
  /** The download URL of the song. */
  file_download_url: string
  /** A boolean value that tells if the song is hosted on Rhythmverse servers. */
  external_file_download: boolean
  /** The size of the song CON file. */
  file_size?: number
  /** The quantity of "thanks" to the song. */
  thanks: number
  /** The quantity of downloads of the song. */
  downloads: number
}

export interface ProcessedRhythmverseObject {
  records: RawRhythmverseResponse['data']['records']
  pagination: RawRhythmverseResponse['data']['pagination']
  songs: ProcessedRhythmverseSongData[]
}

/**
 * Logs a provided message to the console, erasing the entire last line of the console.
 * - - - -
 * @param {string} message The message you want ot display.
 */
const updateProgress = (message: string): void => {
  readline.clearLine(process.stdout, 0) // 0 = clear the entire line
  readline.cursorTo(process.stdout, 0) // move cursor to beginning of line
  process.stdout.write(message)
}

// #region Main Class

/** A class with static methods to fetch songs from Rhythmverse database. */
export class RhythmverseAPI {
  /**
   * Searchs a text through the Rhythmverse database.
   * - - - -
   * @param {string} text The text you want to be used as searching parameter.
   * @param {RhythmverseFetchingOptions | undefined} options `OPTIONAL` An object with properties that modifies the default behavior of the fetching process.
   * @returns {Promise<RawRhythmverseResponse>}
   */
  static async searchText(text: string, options?: RhythmverseFetchingOptions): Promise<RawRhythmverseResponse> {
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

    const reqURL: string = rhythmverseAPISourceSearchURL[opts.source]

    const urlParams: Record<string, string> = {
      'sort[0][sort_by]': rhythmverseOptsLocale[opts.sortBy],
      'sort[0][sort_order]': rhythmverseOptsLocale[opts.sortOrder],
      text,
      page: opts.page.toString(),
      records: opts.records.toString(),
      data_type: 'full',
    }

    if (opts.fullBand) urlParams.fullband = 'true'
    if (opts.multitrack) urlParams.audio = 'full'
    if (opts.pitchedVocals) urlParams.vocals = 'pitched'

    if (opts.sortBy === 'updateDate') urlParams['sort[0][sort_order]'] = 'DESC'

    const reqData = new URLSearchParams(urlParams).toString()
    const reqHeaders = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }

    try {
      const res = await axios.post<RawRhythmverseResponse>(reqURL, reqData, {
        headers: reqHeaders,
      })

      return res.data
    } catch (err) {
      if (err instanceof AxiosError) throw new Error(err.message, { cause: err })
      else throw err
    }
  }
  /**
   * Searchs an artist/band through the Rhythmverse database.
   * - - - -
   * @param {string} artist The text you want to be used as searching parameter.
   * @param {RhythmverseFetchingOptions | undefined} options `OPTIONAL` An object with properties that modifies the default behavior of the fetching process.
   * @returns {Promise<RawRhythmverseResponse>}
   */
  static async searchArtist(artist: string, options?: RhythmverseFetchingOptions): Promise<RawRhythmverseResponse> {
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
      artist: normalizeString(artist).replace(/\s+/g, '-').toLowerCase(),
      page: opts.page.toString(),
      records: opts.records.toString(),
      data_type: 'full',
    }

    if (opts.fullBand) urlParams.fullband = 'true'
    if (opts.multitrack) urlParams.audio = 'full'
    if (opts.pitchedVocals) urlParams.vocals = 'pitched'

    if (opts.sortBy === 'updateDate') urlParams['sort[0][sort_order]'] = 'DESC'

    const reqData = new URLSearchParams(urlParams).toString()
    const reqHeaders = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }

    try {
      const res = await axios.post<RawRhythmverseResponse>(reqURL, reqData, {
        headers: reqHeaders,
      })

      return res.data
    } catch (err) {
      if (err instanceof AxiosError) throw new Error(err.message, { cause: err })
      else throw err
    }
  }
  /**
   * Searchs an author through the Rhythmverse database.
   * - - - -
   * @param {string} author The text you want to be used as searching parameter.
   * @param {RhythmverseFetchingOptions | undefined} options `OPTIONAL` An object with properties that modifies the default behavior of the fetching process.
   * @returns {Promise<RawRhythmverseResponse>}
   */
  static async searchAuthor(author: string, options?: RhythmverseFetchingOptions): Promise<RawRhythmverseResponse> {
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
      author,
      page: opts.page.toString(),
      records: opts.records.toString(),
      data_type: 'full',
    }

    if (opts.fullBand) urlParams.fullband = 'true'
    if (opts.multitrack) urlParams.audio = 'full'
    if (opts.pitchedVocals) urlParams.vocals = 'pitched'

    if (opts.sortBy === 'updateDate') urlParams['sort[0][sort_order]'] = 'DESC'

    const reqData = new URLSearchParams(urlParams).toString()
    const reqHeaders = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }

    try {
      const res = await axios.post<RawRhythmverseResponse>(reqURL, reqData, {
        headers: reqHeaders,
      })

      return res.data
    } catch (err) {
      if (err instanceof AxiosError) throw new Error(err.message, { cause: err })
      else throw err
    }
  }

  /**
   * Transforms raw Rhythmverse data from the API, gathering the most important data.
   * - - - -
   * @param {RawRhythmverseResponse} data A raw Rhythmverse API response.
   * @returns {ProcessedRhythmverseObject}
   */
  static processRawData(data: RawRhythmverseResponse): ProcessedRhythmverseObject {
    const { pagination, records, songs } = data.data

    const allSongs: ProcessedRhythmverseSongData[] = []
    if (songs) {
      for (const song of songs) {
        if (song.file.author.name !== 'Harmonix') {
          allSongs.push({
            name: song.data.title,
            artist: song.data.artist,
            master: Boolean(song.data.master),
            song_id: song.file.custom_id,
            vocal_parts: Number(song.data.vocal_parts) as PartialDTAFile['vocal_parts'],
            song_length: song.data.song_length * 1000,
            rank_band: song.file.diff_band === -1 ? 0 : song.file.diff_band,
            rank_drum: song.file.diff_drums === -1 ? 0 : song.file.diff_drums,
            rank_bass: song.file.diff_bass === -1 ? 0 : song.file.diff_bass,
            rank_guitar: song.file.diff_guitar === -1 ? 0 : song.file.diff_guitar,
            rank_vocals: song.file.diff_vocals === -1 ? 0 : song.file.diff_vocals,
            rank_keys: song.file.diff_keys === -1 ? 0 : song.file.diff_keys,
            rank_real_bass: song.file.diff_probass === -1 ? 0 : song.file.diff_probass,
            rank_real_guitar: song.file.diff_proguitar === -1 ? 0 : song.file.diff_proguitar,
            rank_real_keys: song.file.diff_prokeys === -1 ? 0 : song.file.diff_prokeys,
            // rank_band: rankCalculator('band', song.file.diff_band),
            // rank_drum: rankCalculator('drum', song.file.diff_drums),
            // rank_bass: rankCalculator('bass', song.file.diff_bass),
            // rank_guitar: rankCalculator('guitar', song.file.diff_guitar),
            // rank_vocals: rankCalculator('vocals', song.file.diff_vocals),
            // rank_keys: rankCalculator('keys', song.file.diff_keys),
            // rank_real_bass: rankCalculator('real_bass', song.file.diff_probass),
            // rank_real_guitar: rankCalculator('real_guitar', song.file.diff_proguitar),
            // rank_real_keys: rankCalculator('real_keys', song.file.diff_prokeys),
            tuning_offset_cents: Number(song.file.tuning_offset_cents),
            encoding: song.file.encoding as PartialDTAFile['encoding'],
            rating: song.data.rating === 'ff' ? 1 : song.data.rating === 'sr' ? 2 : song.data.rating === 'mc' ? 3 : 4,
            genre: song.file.file_genre_id as PartialDTAFile['genre'],
            vocal_gender: (song.data.gender as PartialDTAFile['vocal_gender']) ?? 'male',
            year_released: song.data.year,
            album_art: `https://rhythmverse.co${song.file.album_art}`,
            album_name: song.data.album,
            album_track_number: song.data.album_track_number ?? 1,
            author: song.file.author.name,
            multitrack: song.file.audio_type === 'full' ? 'full' : undefined,

            // Non-DTA values relative
            file_name: song.file.file_name === 'file' ? undefined : song.file.file_name,
            song_url: song.file.file_url_full,
            file_download_url: !song.file.download_url.startsWith('/download_file/') ? song.file.download_url : `https://rhythmverse.co${song.file.download_url}`,
            external_file_download: !song.file.download_url.startsWith('/download_file/'),
            file_size: song.file.size ? song.file.size : undefined,
            thanks: song.file.thanks,
            downloads: song.file.downloads,
          })
        }
      }
    }

    return {
      pagination,
      records,
      songs: allSongs,
    }
  }

  /**
   * Downloads the songs found in the provided `searchResults` object, returning an array of `FilePath` classes pointing to the downloaded files.
   * - - - -
   * @param {RawRhythmverseResponse | ProcessedRhythmverseObject} searchResults A raw of processed Rhythmverse database fetching object.
   * @param {DirPathLikeTypes} destPath The directory path where the songs will be placed.
   * @param {boolean} debug `OPTIONAL` Logs the downloading percentage of the songs on the console. Default is `false`.
   * @returns {Promise<FilePath>}
   */
  static async downloadResults(searchResults: RawRhythmverseResponse | ProcessedRhythmverseObject, destPath: DirPathLikeTypes, debug = false): Promise<FilePath[]> {
    const files: FilePath[] = []
    let results: ProcessedRhythmverseObject
    if ('status' in searchResults) results = this.processRawData(searchResults)
    else results = searchResults

    const dest = pathLikeToDirPath(destPath)
    if (!dest.exists) await dest.mkDir(true)
    const operators = results.songs.map((val) => ({ filename: val.file_name, url: val.file_download_url }))

    for (const op of operators) {
      if (op.filename && isValidURL(op.url) && op.url.startsWith('https://rhythmverse.co/download_file')) {
        const songPath = dest.gotoFile(op.filename.endsWith('_rb3con') ? op.filename : `${op.filename}_rb3con`)
        files.push(songPath)
        const writer = await songPath.createWriteStream()
        const response = await axios.get<Readable>(op.url, { responseType: 'stream' })
        const totalLength = Number(response.headers['content-length']) || null
        let downloaded = 0

        if (debug) {
          console.log(`-----------------------------------------------------\nStarting download of file "${songPath.fullname}" ${totalLength ? `(${getReadableBytesSize(totalLength)})` : ''}...`)

          const processWriter = new Writable({
            write(chunk: Buffer, _encoding, callback) {
              downloaded += chunk.length
              updateProgress(`Downloaded: ${getReadableBytesSize(downloaded)}${totalLength ? ` / ${getReadableBytesSize(totalLength)}` : ''}`)
              callback()
            },
          })

          response.data.pipe(processWriter)
          response.data.pipe(writer)

          await finished(writer)
          console.log()
        } else {
          response.data.pipe(writer)
          await finished(writer)
        }
      }
    }

    return files
  }
}
