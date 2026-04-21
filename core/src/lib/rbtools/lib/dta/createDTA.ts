import { useDefaultOptions } from 'use-default-options'
import type { RequiredDeep } from 'type-fest'
import type { MAGMAProjectSongData } from '../../core.exports'
import { dta } from '../dta/dtaStruct'
import { genNumericSongID, channelsCountToPanArray, rankValuesToDTARankSystem, type AnimTempoNames, type BandFailCueNames, type BandRankingNames, type BandRankingNumbers, type DrumBankNames, type RB3CompatibleDTAFile, type PercussionBankNames, type SongGameOriginNames, type SongGenreNames, type SongRatingNames, type SongScrollSpeedNames, type VocalParts, type VocalPartsNames, type SongEncoding, containsLatin1SpecificChars, type SoloFlags, bandAverageRankCalculator, type MAGMALanguagesTypes, type CustomSourceValuesObject, type VocalGenderNames } from '../../lib.exports'
import { MyObject } from 'node-lib'
import { getKeyFromMapValue } from '../../utils.exports'

export type InstrumentChannelsTypes = 'Mono' | 'Stereo' | 1 | 2
export type DrumTracksTypes = 2 | 'Stereo Else' | 3 | 'Mono Kick + Stereo Else' | 4 | 'Mono Kick + Mono Snare + Stereo Else' | 5 | 'Mono Kick + Stereo Snare + Stereo Else' | 6 | 'Stereo Kick + Stereo Snare + Stereo Else'
export type PansVolsInformation<T extends InstrumentChannelsTypes> = T extends 1 | 'Mono' ? [number] : T extends 2 | 'Stereo' ? [number, number] : never
export type PansVolsDrumsInformation<T extends DrumTracksTypes> = T extends 2 | 'Stereo Else' ? [number, number] : T extends 3 | 'Mono Kick + Stereo Else' ? [number, number, number] : T extends 4 | 'Mono Kick + Mono Snare + Stereo Else' ? [number, number, number, number] : T extends 5 | 'Mono Kick + Stereo Snare + Stereo Else' ? [number, number, number, number, number] : T extends 6 | 'Stereo Kick + Stereo Snare + Stereo Else' ? [number, number, number, number, number, number] : never

export interface DrumUpdateOptions<T extends DrumTracksTypes> {
  /**
   * The quantity of channels for the drum part.
   *
   * Valid values are:
   * - `Stereo Else` (or `2`)
   * - `Mono Kick + Stereo Else` (or `3`)
   * - `Mono Kick + Mono Snare + Stereo Else` (or `4`)
   * - `Mono Kick + Stereo Snare + Stereo Else` (or `5`)
   * - `Stereo Kick + Stereo Snare + Stereo Else` (or `6`)
   */
  channels: T
  /**
   * The ranking of the instrument.
   */
  rank: BandRankingNames | BandRankingNumbers
  /**
   * Set to `true` if the instrument has solo sessions.
   */
  hasSolo?: boolean
  /**
   * Custom panning information. If not specified, mono tracks will have centered
   * `0.0` panning, and stereo tracks will be `-1.0` (for the left track) and `1.0` (for the right track).
   */
  pans?: PansVolsDrumsInformation<T>
  /**
   * Custom volume information. If not specified, all tracks from the insturment
   * will have no volume change (`0.0`).
   */
  vols?: PansVolsDrumsInformation<T>
}

export interface BassUpdateOptions<T extends InstrumentChannelsTypes> {
  /**
   * The quantity of channels for the instrument.
   *
   * Valid values are:
   * - `Mono` (or `1`)
   * - `Stereo` (or `2`)
   */
  channels: T
  /**
   * The ranking of the instrument.
   */
  rank: BandRankingNames | BandRankingNumbers
  /**
   * Set to `true` if the instrument has solo sessions.
   */
  hasSolo?: boolean
  /**
   * The ranking of the PRO Bass part.
   */
  rankPRO?: BandRankingNames | BandRankingNumbers
  /**
   * An array with the tuning of all 4 strings of the PRO Bass part.
   *
   * If the PRO Bass rank is specified, it will use E Standard `[0, 0, 0, 0]` as default.
   */
  tuning?: [number, number, number, number]
  /**
   * Custom panning information. If not specified, mono tracks will have centered
   * `0.0` panning, and stereo tracks will be `-1.0` (for the left track) and `1.0` (for the right track).
   */
  pans?: PansVolsInformation<T>
  /**
   * Custom volume information. If not specified, all tracks from the insturment
   * will have no volume change (`0.0`).
   */
  vols?: PansVolsInformation<T>
}

export interface GuitarUpdateOptions<T extends InstrumentChannelsTypes> {
  /**
   * The quantity of channels for the instrument.
   *
   * Valid values are:
   * - `Mono` (or `1`)
   * - `Stereo` (or `2`)
   */
  channels: T
  /**
   * The ranking of the instrument.
   */
  rank: BandRankingNames | BandRankingNumbers
  /**
   * Set to `true` if the instrument has solo sessions.
   */
  hasSolo?: boolean
  /**
   * The ranking of the PRO Guitar part.
   */
  rankPRO?: BandRankingNames | BandRankingNumbers
  /**
   * An array with the tuning of all 6 strings of the PRO Guitar part.
   *
   * If the PRO Guitar rank is specified, it will use E Standard `[0, 0, 0, 0, 0, 0]` as default.
   */
  tuning?: [number, number, number, number, number, number]
  /**
   * Custom panning information. If not specified, mono tracks will have centered
   * `0.0` panning, and stereo tracks will be `-1.0` (for the left track) and `1.0` (for the right track).
   */
  pans?: PansVolsInformation<T>
  /**
   * Custom volume information. If not specified, all tracks from the insturment
   * will have no volume change (`0.0`).
   */
  vols?: PansVolsInformation<T>
}

export interface VocalsUpdateOptions<T extends InstrumentChannelsTypes> {
  /**
   * The quantity of channels for the instrument.
   *
   * Valid values are:
   * - `Mono` (or `1`)
   * - `Stereo` (or `2`)
   */
  channels: T
  /**
   * The ranking of the instrument.
   */
  rank: BandRankingNames | BandRankingNumbers
  /**
   * Set to `true` if the instrument has solo sessions.
   */
  hasSolo?: boolean
  /**
   * The quantity of vocal parts of the song.
   */
  vocalParts: Exclude<VocalPartsNames, 'No Vocals'> | Exclude<VocalParts, 0>
  /**
   * The gender of the vocalist. Default is `Male`.
   */
  vocalGender?: VocalGenderNames
  /**
   * Custom panning information. If not specified, mono tracks will have centered
   * `0.0` panning, and stereo tracks will be `-1.0` (for the left track) and `1.0` (for the right track).
   */
  pans?: PansVolsInformation<T>
  /**
   * Custom volume information. If not specified, all tracks from the insturment
   * will have no volume change (`0.0`).
   */
  vols?: PansVolsInformation<T>
}

export interface KeysUpdateOptions<T extends InstrumentChannelsTypes> {
  /**
   * The quantity of channels for the instrument.
   *
   * Valid values are:
   * - `Mono` (or `1`)
   * - `Stereo` (or `2`)
   */
  channels: T
  /**
   * The ranking of the instrument.
   */
  rank: BandRankingNames | BandRankingNumbers
  /**
   * Set to `true` if the instrument has solo sessions.
   */
  hasSolo?: boolean
  /**
   * The ranking of the PRO Keys part.
   */
  rankPRO?: BandRankingNames | BandRankingNumbers
  /**
   * Custom panning information. If not specified, mono tracks will have centered
   * `0.0` panning, and stereo tracks will be `-1.0` (for the left track) and `1.0` (for the right track).
   */
  pans?: PansVolsInformation<T>
  /**
   * Custom volume information. If not specified, all tracks from the insturment
   * will have no volume change (`0.0`).
   */
  vols?: PansVolsInformation<T>
}

export interface BackingUpdateOptions<T extends InstrumentChannelsTypes> {
  /**
   * The quantity of channels for the drum part.
   *
   * Valid values are:
   * - `Mono` (or `1`)
   * - `Stereo` (or `2`)
   */
  channels: T
  /**
   * Custom panning information. If not specified, mono tracks will have centered
   * `0.0` panning, and stereo tracks will be `-1.0` (for the left track) and `1.0` (for the right track).
   */
  pans?: PansVolsInformation<T>
  /**
   * Custom volume information. If not specified, all tracks from the insturment
   * will have no volume change (`0.0`).
   */
  vols?: PansVolsInformation<T>
}

export type DrumUpdateOptionsTypes = {
  [P in DrumTracksTypes]: DrumUpdateOptions<P>
}[DrumTracksTypes]
export type BassUpdateOptionsTypes = {
  [P in InstrumentChannelsTypes]: BassUpdateOptions<P>
}[InstrumentChannelsTypes]
export type GuitarUpdateOptionsTypes = {
  [P in InstrumentChannelsTypes]: GuitarUpdateOptions<P>
}[InstrumentChannelsTypes]
export type VocalsUpdateOptionsTypes = {
  [P in InstrumentChannelsTypes]: VocalsUpdateOptions<P>
}[InstrumentChannelsTypes]
export type KeysUpdateOptionsTypes = {
  [P in InstrumentChannelsTypes]: KeysUpdateOptions<P>
}[InstrumentChannelsTypes]
export type BackingUpdateOptionsTypes = {
  [P in InstrumentChannelsTypes]: BackingUpdateOptions<P>
}[InstrumentChannelsTypes]

export interface GenreUpdateOptions<G extends SongGenreNames> {
  /**
   * The song's genre.
   */
  genre: G
  /**
   * The song's sub-genre.
   */
  subGenre?: SubGenreUpdateValues<G>
}

export type SongGenreUpdateOptions = {
  [P in SongGenreNames]: GenreUpdateOptions<P>
}[SongGenreNames]

export type SongKeyMajorValues = 'C' | 'C Major' | 'C#' | 'Db' | 'C# Major' | 'Db Major' | 'D' | 'D Major' | 'D#' | 'Eb' | 'D# Major' | 'Eb Major' | 'E' | 'E Major' | 'F' | 'F Major' | 'F#' | 'Gb' | 'F# Major' | 'Gb Major' | 'G' | 'G Major' | 'G#' | 'Ab' | 'G# Major' | 'Ab Major' | 'A' | 'A Major' | 'A#' | 'Bb' | 'A# Major' | 'Bb Major' | 'B' | 'B Major'

export type SongKeyMinorValues = 'Cm' | 'C Minor' | 'C#m' | 'Dbm' | 'C# Minor' | 'Db Minor' | 'Dm' | 'D Minor' | 'D#m' | 'Ebm' | 'D# Minor' | 'Eb Minor' | 'Em' | 'E Minor' | 'Fm' | 'F Minor' | 'F#m' | 'Gbm' | 'F# Minor' | 'Gb Minor' | 'Gm' | 'G Minor' | 'G#m' | 'Abm' | 'G# Minor' | 'Ab Minor' | 'Am' | 'A Minor' | 'A#m' | 'Bbm' | 'A# Minor' | 'Bb Minor' | 'Bm' | 'B Minor'

export type TrainerKeyOverrideValues = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'

export interface SongKeyUpdateOptions {
  key: SongKeyMajorValues | SongKeyMinorValues
  trainerKeyOverride?: TrainerKeyOverrideValues | null
}

export type SubGenreUpdateValues<G extends SongGenreNames> = G extends 'Classical' | 'Classic Rock' | 'Emo' | 'Fusion' | 'Grunge' | 'Inspirational' | 'J-Rock' | 'Latin' | 'Novelty' | 'Nu-Metal' | 'Southern Rock' | 'World' ? G : G extends 'Alternative' ? 'Alternative' | 'College' | 'Other' : G extends 'Blues' ? 'Acoustic' | 'Chicago' | 'Classic' | 'Contemporary' | 'Country' | 'Delta' | 'Electric' | 'Other' : G extends 'Country' ? 'Alternative' | 'Bluegrass' | 'Contemporary' | 'Honky Tonk' | 'Outlaw' | 'Traditional Folk' | 'Other' : G extends 'Glam' ? 'Glam' | 'Goth' | 'Other' : G extends 'Hip-Hop/Rap' ? 'Alternative Rap' | 'Gangsta' | 'Hardcore Rap' | 'Hip Hop' | 'Old School Hip Hop' | 'Rap' | 'Trip Hop' | 'Underground Rap' | 'Other' : G extends 'Indie Rock' ? 'Indie Rock' | 'Lo-fi' | 'Math Rock' | 'Noise' | 'Post Rock' | 'Shoegazing' | 'Other' : G extends 'Jazz' ? 'Acid Jazz' | 'Contemporary' | 'Experimental' | 'Ragtime' | 'Smooth' | 'Other' : G extends 'Metal' ? 'Alternative' | 'Black' | 'Core' | 'Death' | 'Hair' | 'Industrial' | 'Metal' | 'Power' | 'Prog' | 'Speed' | 'Thrash' | 'Other' : G extends 'New Wave' ? 'Dark Wave' | 'Electroclash' | 'New Wave' | 'Synthpop' | 'Other' : G extends 'Pop/Dance/Electronic' ? 'Ambient' | 'Breakbeat' | 'Chiptune' | 'Dance' | 'Downtempo' | 'Dub' | 'Drum and Bass' | 'Electronica' | 'Garage' | 'Hardcore Dance' | 'House' | 'Industrial' | 'Techno' | 'Trance' | 'Other' : G extends 'Pop-Rock' ? 'Contemporary' | 'Pop' | 'Soft Rock' | 'Teen' | 'Other' : G extends 'Prog' ? 'Prog Rock' : G extends 'Punk' ? 'Alternative' | 'Classic' | 'Dance Punk' | 'Garage' | 'Hardcore' | 'Pop' | 'Other' : G extends 'R&B/Soul/Funk' ? 'Disco' | 'Funk' | 'Motown' | 'Rhythm and Blues' | 'Soul' | 'Other' : G extends 'Reggae/Ska' ? 'Reggae' | 'Ska' | 'Other' : G extends 'Rock' ? 'Arena' | 'Blues' | 'Folk Rock' | 'Garage' | 'Hard Rock' | 'Psychedelic' | 'Rock' | 'Rockabilly' | 'Rock and Roll' | 'Surf' | 'Other' : G extends 'Other' ? 'A capella' | 'Acoustic' | 'Contemporary Folk' | 'Experimental' | 'Oldies' | 'Other' : never

export interface SongDataCreationObject {
  id: string
  name: string
  artist: string
  master?: boolean | number
  songID?: string | number
  songname?: string
  backingTracksCount?: InstrumentChannelsTypes | BackingUpdateOptionsTypes
  /**
   * An object specifying the structure of the drum part.
   */
  drum?: DrumUpdateOptionsTypes | null
  /**
   * An object specifying the structure of the bass part.
   */
  bass?: BassUpdateOptionsTypes | null
  /**
   * An object specifying the structure of the guitar part.
   */
  guitar?: GuitarUpdateOptionsTypes | null
  /**
   * An object specifying the structure of the vocals part.
   */
  vocals?: VocalsUpdateOptionsTypes | null
  /**
   * An object specifying the structure of the keys part.
   */
  keys?: KeysUpdateOptionsTypes | null
  /**
   * Tells if the song has crowd channels.
   *
   * If `true`, crowd channels will be placed as stereo tracks with `0dB` volume.
   *
   * If it's a `number`, you can specify the volume of both crowd tracks
   *
   * if it's an `array`, you can specify the volume of each crowd tracks.
   *
   * Crowd channels are always stereo.
   */
  crowdChannels?: true | [number, number] | number | null
  muteVolume?: number
  muteVolumeVocals?: number
  hopoThreshold?: number
  bank?: PercussionBankNames
  drumBank?: DrumBankNames
  animTempo?: AnimTempoNames
  bandFailCue?: BandFailCueNames
  songScrollSpeed?: SongScrollSpeedNames
  preview: number | [number, number]
  songLength: number
  bandRank?: BandRankingNumbers | null
  tuningOffsetCents?: number
  guidePitchVolume?: number
  format?: number
  version?: number
  gameOrigin?: SongGameOriginNames
  rating?: SongRatingNames
  genre: SongGenreUpdateOptions
  yearReleased: number
  yearRecorded?: number | null
  albumArt?: boolean
  albumName?: string
  albumTrackNumber?: number
  songKey?: SongKeyMajorValues | SongKeyMinorValues | SongKeyUpdateOptions
  packName?: string
  loadingPhrase?: string
  author?: string
  stringsAuthor?: string
  keysAuthor?: string
  /**
   * An array with the languages of the song.
   */
  languages?: MAGMALanguagesTypes[]
  /**
   * Tells the type of the song's audio stems. It can be `true`, representing `full`, original multitracks.
   */
  multitrack?: 'diy_stems' | 'partial' | 'karaoke' | 'full' | null
  /**
   * Tells if the song has unpitched vocals.
   */
  unpitchedVocals?: boolean
  /**
   * Tells if the song is a conversion from another game.
   */
  convert?: boolean
  /**
   * Tells if the song is a 2x Kick Pedal song.
   */
  doubleKick?: boolean
  /**
   * Tells if the song has rhythm guitar charted on the Bass or Keys track, or no rhythm guitar at all if `false`.
   */
  rhythmOn?: 'keys' | 'bass' | null
  /**
   * Tells if the song has EMH autogenerated by CAT, or if it has only Expert charts done.
   */
  emh?: 'cat' | 'expert_only' | null
  /**
   * An object with values that will be inserted on the DTA file contents if the
   * `useCustomSource` parameters on the `DTAParser.toString()` method is set to `true`.
   */
  customsource?: CustomSourceValuesObject | null
  /**
   * An object with values that will be used to configure the `MAGMAProject` module.
   */
  magma?: MAGMAProjectSongData | null
}

export const createDTA = (songdata: SongDataCreationObject): RB3CompatibleDTAFile => {
  const map = new MyObject<RB3CompatibleDTAFile>()
  const {
    id,
    name,
    artist,
    master,
    songID,
    songname,
    backingTracksCount,
    drum,
    bass,
    guitar,
    keys,
    vocals,
    crowdChannels,
    muteVolume,
    muteVolumeVocals,
    hopoThreshold,
    bank,
    drumBank,
    animTempo,
    bandFailCue,
    songScrollSpeed,
    preview,
    songLength,
    bandRank,
    tuningOffsetCents,
    guidePitchVolume,
    format,
    version,
    gameOrigin,
    rating,
    genre: { genre: g, subGenre },
    yearReleased,
    yearRecorded,
    albumArt,
    albumName,
    albumTrackNumber,
    songKey,
    packName,
    loadingPhrase,
    author,
    keysAuthor,
    stringsAuthor,
    languages,
    multitrack,
    unpitchedVocals,
    convert,
    doubleKick,
    rhythmOn,
    emh,
    customsource,
    magma,
  } = useDefaultOptions<RequiredDeep<SongDataCreationObject>>(
    {
      id: '',
      name: '',
      artist: '',
      master: true,
      songID: '',
      songname: '',
      backingTracksCount: 2,
      drum: null,
      bass: null,
      guitar: null,
      vocals: null,
      keys: null,
      crowdChannels: null,
      muteVolume: -96,
      muteVolumeVocals: -12,
      hopoThreshold: 170,
      bank: 'Tambourine',
      drumBank: 'Hard Rock Kit',
      animTempo: 'Medium (100-160bpm)',
      bandFailCue: 'Rock (Keys)',
      songScrollSpeed: 'Normal',
      preview: [0, 30000],
      songLength: 30000,
      bandRank: null,
      tuningOffsetCents: 0,
      guidePitchVolume: -3,
      format: 10,
      version: 30,
      gameOrigin: 'User-generated content/Rock Band Network 2.0',
      rating: 'No Rating',
      genre: {
        genre: 'Other',
        subGenre: 'Other',
      },
      yearReleased: new Date().getFullYear(),
      yearRecorded: null,
      albumArt: true,
      albumName: '',
      albumTrackNumber: 1,
      songKey: 'C',
      packName: '',
      loadingPhrase: '',
      author: '',
      keysAuthor: '',
      stringsAuthor: '',
      languages: ['English'],
      multitrack: null,
      unpitchedVocals: false,
      convert: false,
      doubleKick: false,
      rhythmOn: null,
      emh: null,
      customsource: null,
      magma: null,
    },
    songdata
  )

  map.set('id', id)
  map.set('name', name)
  map.set('artist', artist)
  map.set('master', Boolean(master))
  if (songID) map.set('song_id', songID)
  else {
    if (songname) {
      const hash = genNumericSongID(songname)
      map.set('song_id', hash)
    } else {
      const hash = genNumericSongID(id)
      map.set('song_id', hash)
    }
  }
  if (songname) map.set('songname', songname)
  else map.set('songname', id)

  // Tracks
  const tracksCount: number[] = []
  let pans: number[] = []
  let vols: number[] = []
  const cores: number[] = []
  const solo: SoloFlags[] = []
  let instrumentCount = 0
  let gtrTuning: number[] = [0, 0, 0, 0, 0, 0]
  let bassTuning: number[] = [0, 0, 0, 0]
  const drumTracksPan = drum ? channelsCountToPanArray(drum.channels).length : 0
  tracksCount.push(drumTracksPan)
  const bassTracksPan = bass ? channelsCountToPanArray(bass.channels).length : 0
  tracksCount.push(bassTracksPan)
  const guitarTracksPan = guitar ? channelsCountToPanArray(guitar.channels).length : 0
  tracksCount.push(guitarTracksPan)
  const vocalsTracksPan = vocals ? channelsCountToPanArray(vocals.channels).length : 0
  tracksCount.push(vocalsTracksPan)
  const keysTracksPan = keys ? channelsCountToPanArray(keys.channels).length : 0
  tracksCount.push(keysTracksPan)
  const backingTracksPan = channelsCountToPanArray(typeof backingTracksCount === 'object' ? backingTracksCount.channels : backingTracksCount).length
  tracksCount.push(backingTracksPan)

  map.set('tracks_count', tracksCount as RB3CompatibleDTAFile['tracks_count'])

  let drumR = 0,
    bassR = 0,
    guitarR = 0,
    vocalsR = 0,
    keysR = 0,
    real_guitarR = 0,
    real_bassR = 0,
    real_keysR = 0

  if (drum) {
    instrumentCount++

    drumR = rankValuesToDTARankSystem('drum', drum.rank)
    map.set('rank_drum', drumR)

    channelsCountToPanArray(drum.channels).forEach((pan) => {
      pans.push(pan)
      vols.push(0)
      cores.push(-1)
    })

    if (drum.pans as typeof drum.pans | undefined) {
      pans = pans.slice(0, drum.pans.length * -1)
      drum.pans.forEach((pan) => pans.push(pan))
    }

    if (drum.vols as typeof drum.pans | undefined) {
      vols = vols.slice(0, drum.vols.length * -1)
      drum.vols.forEach((pan) => vols.push(pan))
    }

    if (drum.hasSolo as typeof drum.hasSolo | undefined) solo.push('drum')
  }

  if (bass) {
    instrumentCount++

    bassR = rankValuesToDTARankSystem('bass', bass.rank)
    real_bassR = rankValuesToDTARankSystem('real_bass', (bass.rankPRO as typeof bass.rankPRO | undefined) ?? -1)
    map.set('rank_bass', bassR)

    if (real_bassR > 0) {
      map.set('rank_real_bass', real_bassR)
      if (bass.tuning as typeof bass.tuning | undefined) bassTuning = bass.tuning
      map.set('real_bass_tuning', bassTuning as RB3CompatibleDTAFile['real_bass_tuning'])
    }

    channelsCountToPanArray(bass.channels).forEach((pan) => {
      pans.push(pan)
      vols.push(0)
      cores.push(-1)
    })

    if (bass.pans as typeof bass.pans | undefined) {
      pans = pans.slice(0, bass.pans.length * -1)
      bass.pans.forEach((pan) => pans.push(pan))
    }

    if (bass.vols as typeof bass.vols | undefined) {
      vols = vols.slice(0, bass.vols.length * -1)
      bass.vols.forEach((pan) => vols.push(pan))
    }

    if (bass.hasSolo as typeof bass.hasSolo | undefined) solo.push('bass')
  }

  if (guitar) {
    instrumentCount++

    guitarR = rankValuesToDTARankSystem('guitar', guitar.rank)
    real_guitarR = rankValuesToDTARankSystem('real_guitar', (guitar.rankPRO as typeof guitar.rankPRO | undefined) ?? -1)
    map.set('rank_guitar', guitarR)

    if (real_guitarR > 0) {
      map.set('rank_real_guitar', real_guitarR)
      if (guitar.tuning as typeof guitar.tuning | undefined) gtrTuning = guitar.tuning
      map.set('real_guitar_tuning', gtrTuning as RB3CompatibleDTAFile['real_guitar_tuning'])
    }

    channelsCountToPanArray(guitar.channels).forEach((pan) => {
      pans.push(pan)
      vols.push(0)
      cores.push(1)
    })

    if (guitar.pans as typeof guitar.pans | undefined) {
      pans = pans.slice(0, guitar.pans.length * -1)
      guitar.pans.forEach((pan) => pans.push(pan))
    }

    if (guitar.vols as typeof guitar.pans | undefined) {
      vols = vols.slice(0, guitar.vols.length * -1)
      guitar.vols.forEach((pan) => vols.push(pan))
    }

    if (guitar.hasSolo as typeof guitar.hasSolo | undefined) solo.push('guitar')
  }

  if (vocals) {
    instrumentCount++

    vocalsR = rankValuesToDTARankSystem('vocals', vocals.rank)
    map.set('rank_vocals', vocalsR)
    map.set('vocal_parts', typeof vocals.vocalParts === 'number' ? vocals.vocalParts : vocals.vocalParts === 'Solo Vocals' ? 1 : vocals.vocalParts === '2-Part Harmonies' ? 2 : 3)
    map.set('vocal_gender', (vocals.vocalGender as typeof vocals.vocalGender | undefined) ? (vocals.vocalGender.toLowerCase() as RB3CompatibleDTAFile['vocal_gender']) : 'male')

    channelsCountToPanArray(vocals.channels).forEach((pan) => {
      pans.push(pan)
      vols.push(0)
      cores.push(-1)
    })

    if (vocals.pans as typeof vocals.pans | undefined) {
      pans = pans.slice(0, vocals.pans.length * -1)
      vocals.pans.forEach((pan) => pans.push(pan))
    }

    if (vocals.vols as typeof vocals.vols | undefined) {
      vols = vols.slice(0, vocals.vols.length * -1)
      vocals.vols.forEach((pan) => vols.push(pan))
    }

    if (vocals.hasSolo as typeof vocals.hasSolo | undefined) solo.push('vocal_percussion')
  } else {
    map.set('vocal_parts', 0)
    map.set('vocal_gender', 'male')
  }

  if (keys) {
    instrumentCount++

    keysR = rankValuesToDTARankSystem('keys', keys.rank)
    real_keysR = rankValuesToDTARankSystem('real_keys', (keys.rankPRO as typeof keys.rankPRO | undefined) ?? -1)
    map.set('rank_keys', keysR)
    map.set('rank_real_keys', real_keysR)

    channelsCountToPanArray(keys.channels).forEach((pan) => {
      pans.push(pan)
      vols.push(0)
      cores.push(-1)
    })

    if (keys.pans as typeof keys.pans | undefined) {
      pans = pans.slice(0, keys.pans.length * -1)
      keys.pans.forEach((pan) => pans.push(pan))
    }

    if (keys.vols as typeof keys.vols | undefined) {
      vols = vols.slice(0, keys.vols.length * -1)
      keys.vols.forEach((pan) => vols.push(pan))
    }

    if (keys.hasSolo as typeof keys.hasSolo | undefined) solo.push('keys')
  }

  if (typeof backingTracksCount === 'object') {
    channelsCountToPanArray(backingTracksCount.channels).forEach((pan) => {
      pans.push(pan)
      vols.push(0)
      cores.push(-1)
    })

    if (backingTracksCount.pans as typeof backingTracksCount.pans | undefined) {
      pans = pans.slice(0, backingTracksCount.pans.length * -1)
      backingTracksCount.pans.forEach((pan) => pans.push(pan))
    }

    if (backingTracksCount.vols as typeof backingTracksCount.vols | undefined) {
      vols = vols.slice(0, backingTracksCount.vols.length * -1)
      backingTracksCount.vols.forEach((pan) => vols.push(pan))
    }
  } else {
    channelsCountToPanArray(backingTracksCount).forEach((pan) => {
      pans.push(pan)
      vols.push(0)
      cores.push(-1)
    })
  }

  if (crowdChannels) {
    tracksCount.push(2)
    pans.push(-2.5, 2.5)
    cores.push(-1, -1)
    if (crowdChannels === true) vols.push(0, 0)
    else if (typeof crowdChannels === 'number') vols.push(crowdChannels)
    else {
      const [leftC, rightC] = crowdChannels
      vols.push(leftC)
      vols.push(rightC)
    }
  }

  if (bandRank !== null) map.set('rank_band', rankValuesToDTARankSystem('band', bandRank))
  else map.set('rank_band', bandAverageRankCalculator(guitarR + bassR + drumR + keysR + vocalsR, instrumentCount))

  map.set('pans', pans)
  map.set('vols', vols)
  map.set('cores', cores)
  if (solo.length > 0) map.set('solo', solo)

  map.set('mute_volume', muteVolume)
  map.set('mute_volume_vocals', muteVolumeVocals)
  map.set('hopo_threshold', hopoThreshold)
  map.set('bank', getKeyFromMapValue(dta.percussionBank, bank) as RB3CompatibleDTAFile['bank'])
  map.set('drum_bank', getKeyFromMapValue(dta.drumBank, drumBank) as RB3CompatibleDTAFile['drum_bank'])
  map.set('anim_tempo', Number(getKeyFromMapValue(dta.animTempo, animTempo)) as RB3CompatibleDTAFile['anim_tempo'])
  map.set('band_fail_cue', getKeyFromMapValue(dta.bandFailCue, bandFailCue) as RB3CompatibleDTAFile['band_fail_cue'])
  map.set('song_scroll_speed', Number(getKeyFromMapValue(dta.songScrollSpeed, songScrollSpeed)) as RB3CompatibleDTAFile['song_scroll_speed'])

  if (typeof preview === 'number') map.set('preview', [preview, preview + 30000])
  else {
    const [start, end] = preview
    map.set('preview', [start, end])
  }

  map.set('song_length', songLength)
  map.set('tuning_offset_cents', tuningOffsetCents)
  map.set('guide_pitch_volume', guidePitchVolume)
  map.set('format', format)
  map.set('version', version)
  map.set('game_origin', getKeyFromMapValue(dta.gameOrigin, gameOrigin) as RB3CompatibleDTAFile['game_origin'])
  map.set(
    'encoding',
    ((): SongEncoding => {
      let hasNonASCIIChars = false

      if (name && containsLatin1SpecificChars(name)) hasNonASCIIChars = true
      if (artist && containsLatin1SpecificChars(artist)) hasNonASCIIChars = true
      if (albumName && containsLatin1SpecificChars(albumName)) hasNonASCIIChars = true
      if (packName && containsLatin1SpecificChars(packName)) hasNonASCIIChars = true
      if (author && containsLatin1SpecificChars(author)) hasNonASCIIChars = true
      if (keysAuthor && containsLatin1SpecificChars(keysAuthor)) hasNonASCIIChars = true
      if (stringsAuthor && containsLatin1SpecificChars(stringsAuthor)) hasNonASCIIChars = true
      if (loadingPhrase && containsLatin1SpecificChars(loadingPhrase)) hasNonASCIIChars = true

      return hasNonASCIIChars ? 'utf8' : 'latin1'
    })()
  )
  map.set('rating', Number(getKeyFromMapValue(dta.rating, rating)) as RB3CompatibleDTAFile['rating'])

  map.set('genre', getKeyFromMapValue(dta.genre, g) as RB3CompatibleDTAFile['genre'])
  map.set('sub_genre', getKeyFromMapValue(dta.subGenre, subGenre) as RB3CompatibleDTAFile['sub_genre'])

  map.set(`year_released`, yearReleased)
  if (yearRecorded !== null) map.set(`year_recorded`, yearRecorded)

  map.set('album_art', albumArt)
  if (albumName) map.set('album_name', albumName)
  if (albumTrackNumber) map.set('album_track_number', albumTrackNumber)
  if (packName) map.set('pack_name', packName)
  if (loadingPhrase) map.set('loading_phrase', loadingPhrase)
  if (author) map.set('author', author)
  if (stringsAuthor) map.set('strings_author', stringsAuthor)
  if (keysAuthor) map.set('keys_author', keysAuthor)

  if (typeof songKey === 'object') {
    switch (songKey.key) {
      case 'C Major':
      case 'C':
        map.set('vocal_tonic_note', 0)
        map.set('song_tonality', 0)
        break
      case 'Db Major':
      case 'C# Major':
      case 'Db':
      case 'C#':
        map.set('vocal_tonic_note', 1)
        map.set('song_tonality', 0)
        break
      case 'D Major':
      case 'D':
        map.set('vocal_tonic_note', 2)
        map.set('song_tonality', 0)
        break
      case 'Eb Major':
      case 'D# Major':
      case 'Eb':
      case 'D#':
        map.set('vocal_tonic_note', 3)
        map.set('song_tonality', 0)
        break
      case 'E Major':
      case 'E':
        map.set('vocal_tonic_note', 4)
        map.set('song_tonality', 0)
        break
      case 'F Major':
      case 'F':
        map.set('vocal_tonic_note', 5)
        map.set('song_tonality', 0)
        break
      case 'Gb Major':
      case 'F# Major':
      case 'Gb':
      case 'F#':
        map.set('vocal_tonic_note', 6)
        map.set('song_tonality', 0)
        break
      case 'G Major':
      case 'G':
        map.set('vocal_tonic_note', 7)
        map.set('song_tonality', 0)
        break
      case 'Ab Major':
      case 'G# Major':
      case 'Ab':
      case 'G#':
        map.set('vocal_tonic_note', 8)
        map.set('song_tonality', 0)
        break
      case 'A Major':
      case 'A':
        map.set('vocal_tonic_note', 9)
        map.set('song_tonality', 0)
        break
      case 'Bb Major':
      case 'A# Major':
      case 'Bb':
      case 'A#':
        map.set('vocal_tonic_note', 10)
        map.set('song_tonality', 0)
        break
      case 'B Major':
      case 'B':
        map.set('vocal_tonic_note', 11)
        map.set('song_tonality', 0)
        break
      case 'C Minor':
      case 'Cm':
        map.set('vocal_tonic_note', 0)
        map.set('song_tonality', 1)
        break
      case 'Db Minor':
      case 'C# Minor':
      case 'Dbm':
      case 'C#m':
        map.set('vocal_tonic_note', 1)
        map.set('song_tonality', 1)
        break
      case 'D Minor':
      case 'Dm':
        map.set('vocal_tonic_note', 2)
        map.set('song_tonality', 1)
        break
      case 'Eb Minor':
      case 'D# Minor':
      case 'Ebm':
      case 'D#m':
        map.set('vocal_tonic_note', 3)
        map.set('song_tonality', 1)
        break
      case 'E Minor':
      case 'Em':
        map.set('vocal_tonic_note', 4)
        map.set('song_tonality', 1)
        break
      case 'F Minor':
      case 'Fm':
        map.set('vocal_tonic_note', 5)
        map.set('song_tonality', 1)
        break
      case 'Gb Minor':
      case 'F# Minor':
      case 'Gbm':
      case 'F#m':
        map.set('vocal_tonic_note', 6)
        map.set('song_tonality', 1)
        break
      case 'G Minor':
      case 'Gm':
        map.set('vocal_tonic_note', 7)
        map.set('song_tonality', 1)
        break
      case 'Ab Minor':
      case 'G# Minor':
      case 'Abm':
      case 'G#m':
        map.set('vocal_tonic_note', 8)
        map.set('song_tonality', 1)
        break
      case 'A Minor':
      case 'Am':
        map.set('vocal_tonic_note', 9)
        map.set('song_tonality', 1)
        break
      case 'Bb Minor':
      case 'A# Minor':
      case 'Bbm':
      case 'A#m':
        map.set('vocal_tonic_note', 10)
        map.set('song_tonality', 1)
        break
      case 'B Minor':
      case 'Bm':
        map.set('vocal_tonic_note', 11)
        map.set('song_tonality', 1)
        break
    }

    if (songKey.trainerKeyOverride) {
      switch (songKey.trainerKeyOverride) {
        case 'C':
          map.set('song_key', 0)
          break
        case 'C#':
          map.set('song_key', 1)
          break
        case 'D':
          map.set('song_key', 2)
          break
        case 'D#':
          map.set('song_key', 3)
          break
        case 'E':
          map.set('song_key', 4)
          break
        case 'F':
          map.set('song_key', 5)
          break
        case 'F#':
          map.set('song_key', 6)
          break
        case 'G':
          map.set('song_key', 7)
          break
        case 'G#':
          map.set('song_key', 8)
          break
        case 'A':
          map.set('song_key', 9)
          break
        case 'A#':
          map.set('song_key', 10)
          break
        case 'B':
          map.set('song_key', 11)
          break
      }
    }
  } else if (typeof songKey === 'string') {
    switch (songKey) {
      case 'C Major':
      case 'C':
        map.set('vocal_tonic_note', 0)
        map.set('song_tonality', 0)
        break
      case 'Db Major':
      case 'C# Major':
      case 'Db':
      case 'C#':
        map.set('vocal_tonic_note', 1)
        map.set('song_tonality', 0)
        break
      case 'D Major':
      case 'D':
        map.set('vocal_tonic_note', 2)
        map.set('song_tonality', 0)
        break
      case 'Eb Major':
      case 'D# Major':
      case 'Eb':
      case 'D#':
        map.set('vocal_tonic_note', 3)
        map.set('song_tonality', 0)
        break
      case 'E Major':
      case 'E':
        map.set('vocal_tonic_note', 4)
        map.set('song_tonality', 0)
        break
      case 'F Major':
      case 'F':
        map.set('vocal_tonic_note', 5)
        map.set('song_tonality', 0)
        break
      case 'Gb Major':
      case 'F# Major':
      case 'Gb':
      case 'F#':
        map.set('vocal_tonic_note', 6)
        map.set('song_tonality', 0)
        break
      case 'G Major':
      case 'G':
        map.set('vocal_tonic_note', 7)
        map.set('song_tonality', 0)
        break
      case 'Ab Major':
      case 'G# Major':
      case 'Ab':
      case 'G#':
        map.set('vocal_tonic_note', 8)
        map.set('song_tonality', 0)
        break
      case 'A Major':
      case 'A':
        map.set('vocal_tonic_note', 9)
        map.set('song_tonality', 0)
        break
      case 'Bb Major':
      case 'A# Major':
      case 'Bb':
      case 'A#':
        map.set('vocal_tonic_note', 10)
        map.set('song_tonality', 0)
        break
      case 'B Major':
      case 'B':
        map.set('vocal_tonic_note', 11)
        map.set('song_tonality', 0)
        break
      case 'C Minor':
      case 'Cm':
        map.set('vocal_tonic_note', 0)
        map.set('song_tonality', 1)
        break
      case 'Db Minor':
      case 'C# Minor':
      case 'Dbm':
      case 'C#m':
        map.set('vocal_tonic_note', 1)
        map.set('song_tonality', 1)
        break
      case 'D Minor':
      case 'Dm':
        map.set('vocal_tonic_note', 2)
        map.set('song_tonality', 1)
        break
      case 'Eb Minor':
      case 'D# Minor':
      case 'Ebm':
      case 'D#m':
        map.set('vocal_tonic_note', 3)
        map.set('song_tonality', 1)
        break
      case 'E Minor':
      case 'Em':
        map.set('vocal_tonic_note', 4)
        map.set('song_tonality', 1)
        break
      case 'F Minor':
      case 'Fm':
        map.set('vocal_tonic_note', 5)
        map.set('song_tonality', 1)
        break
      case 'Gb Minor':
      case 'F# Minor':
      case 'Gbm':
      case 'F#m':
        map.set('vocal_tonic_note', 6)
        map.set('song_tonality', 1)
        break
      case 'G Minor':
      case 'Gm':
        map.set('vocal_tonic_note', 7)
        map.set('song_tonality', 1)
        break
      case 'Ab Minor':
      case 'G# Minor':
      case 'Abm':
      case 'G#m':
        map.set('vocal_tonic_note', 8)
        map.set('song_tonality', 1)
        break
      case 'A Minor':
      case 'Am':
        map.set('vocal_tonic_note', 9)
        map.set('song_tonality', 1)
        break
      case 'Bb Minor':
      case 'A# Minor':
      case 'Bbm':
      case 'A#m':
        map.set('vocal_tonic_note', 10)
        map.set('song_tonality', 1)
        break
      case 'B Minor':
      case 'Bm':
        map.set('vocal_tonic_note', 11)
        map.set('song_tonality', 1)
        break
    }
  }

  map.set('languages', languages)
  if (multitrack) map.set('multitrack', multitrack)
  if (unpitchedVocals) map.set('unpitchedVocals', unpitchedVocals)
  if (convert) map.set('convert', convert)
  if (doubleKick) map.set('doubleKick', doubleKick)
  if (rhythmOn) map.set('rhythmOn', rhythmOn)
  if (emh) map.set('emh', emh)
  if (customsource) map.set('customsource', customsource)
  if (magma) map.set('magma', magma)

  return map.toJSON()
}
