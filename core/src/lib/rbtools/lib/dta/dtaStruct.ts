import type { LiteralUnion } from 'type-fest'
import type { MAGMAProjectSongData } from '../../core.exports'
import { MyObject } from 'node-lib'

/**
 * An object that holds information of many values used in a DTA file.
 */
export const dta = {
  allKeys: ['id', 'name', 'artist', 'fake', 'master', 'context', 'song_id', 'upgrade_version', 'songname', 'tracks_count', 'pans', 'vols', 'cores', 'vocal_parts', 'mute_volume', 'mute_volume_vocals', 'hopo_threshold', 'song_scroll_speed', 'bank', 'drum_bank', 'anim_tempo', 'band_fail_cue', 'preview', 'song_length', 'rank_drum', 'rank_guitar', 'rank_bass', 'rank_vocals', 'rank_keys', 'rank_real_keys', 'rank_real_guitar', 'rank_real_bass', 'rank_band', 'solo', 'genre', 'sub_genre', 'vocal_gender', 'format', 'version', 'album_art', 'album_name', 'album_track_number', 'year_released', 'year_recorded', 'rating', 'tuning_offset_cents', 'guide_pitch_volume', 'game_origin', 'encoding', 'vocal_tonic_note', 'song_tonality', 'song_key', 'real_guitar_tuning', 'real_bass_tuning', 'alternate_path', 'base_points', 'extra_authoring', 'author', 'strings_author', 'keys_author', 'loading_phrase', 'pack_name', 'languages', 'multitrack', 'unpitchedVocals', 'convert', 'doubleKick', 'rhythmOn', 'emh', 'customsource', 'magma'],
  name: {
    '123': '123',
    A: 'a',
    B: 'b',
    C: 'c',
    D: 'd',
    E: 'e',
    F: 'f',
    G: 'g',
    H: 'h',
    I: 'i',
    J: 'j',
    K: 'k',
    L: 'l',
    M: 'm',
    N: 'n',
    O: 'o',
    P: 'p',
    Q: 'q',
    R: 'r',
    S: 's',
    T: 't',
    U: 'u',
    V: 'v',
    W: 'w',
    X: 'x',
    Y: 'y',
    Z: 'z',
  },
  animTempo: {
    16: 'Slow (under 100bpm)',
    24: 'Custom: Medium Slow',
    32: 'Medium (100-160bpm)',
    48: 'Custom: Medium Fast',
    64: 'Fast (over 160bpm)',
  },
  animTempoStrings: {
    kTempoSlow: 'Slow (under 100bpm)',
    24: 'Custom: Medium Slow',
    kTempoMedium: 'Medium (100-160bpm)',
    48: 'Custom: Medium Fast',
    kTempoFast: 'Fast (over 160bpm)',
  },
  bandFailCue: {
    'band_fail_electro.cue': 'Electro',
    'band_fail_electro_keys.cue': 'Electro (Keys)',
    'band_fail_heavy.cue': 'Heavy',
    'band_fail_heavy_keys.cue': 'Heavy (Keys)',
    'band_fail_rock.cue': 'Rock',
    'band_fail_rock_keys.cue': 'Rock (Keys)',
    'band_fail_vintage.cue': 'Vintage',
    'band_fail_vintage_keys.cue': 'Vintage (Keys)',
  },
  percussionBank: {
    'sfx/tambourine_bank.milo': 'Tambourine',
    'sfx/cowbell_bank.milo': 'Cowbell',
    'sfx/handclap_bank.milo': 'Hand Clap',
    'sfx/cowbell3_bank.milo': 'Cowbell (Alternate)',
  },
  drumBank: {
    'sfx/kit01_bank.milo': 'Hard Rock Kit',
    'sfx/kit02_bank.milo': 'Arena Kit',
    'sfx/kit03_bank.milo': 'Vintage Kit',
    'sfx/kit04_bank.milo': 'Trashy Kit',
    'sfx/kit05_bank.milo': 'Electronic Kit',
  },
  genre: {
    alternative: 'Alternative',
    blues: 'Blues',
    classical: 'Classical',
    classicrock: 'Classic Rock',
    country: 'Country',
    emo: 'Emo',
    fusion: 'Fusion',
    glam: 'Glam',
    grunge: 'Grunge',
    hiphoprap: 'Hip-Hop/Rap',
    indierock: 'Indie Rock',
    inspirational: 'Inspirational',
    jazz: 'Jazz',
    jrock: 'J-Rock',
    latin: 'Latin',
    metal: 'Metal',
    new_wave: 'New Wave',
    novelty: 'Novelty',
    numetal: 'Nu-Metal',
    other: 'Other',
    popdanceelectronic: 'Pop/Dance/Electronic',
    poprock: 'Pop-Rock',
    prog: 'Prog',
    punk: 'Punk',
    rbsoulfunk: 'R&B/Soul/Funk',
    reggaeska: 'Reggae/Ska',
    rock: 'Rock',
    southernrock: 'Southern Rock',
    world: 'World',
  },
  genreDX: {
    axebr: 'Axé',
    bigband: 'Big Band',
    blackmetal: 'Black Metal',
    bossanova: 'Bossa Nova',
    bregatechnobrega: 'Brega/Techno Brega',
    deathmetal: 'Death Metal',
    disco: 'Disco',
    dubstep: 'Dubstep',
    experimental: 'Experimental',
    forro: 'Forró',
    funkbr: 'Brazilian Funk',
    funkmelody: 'Funk Melody',
    gospel: 'Gospel',
    hairmetal: 'Hair Metal',
    hardcorepunk: 'Hardcore Punk',
    industrial: 'Industrial',
    metalcore: 'Metalcore',
    mpb: 'MPB',
    pagode: 'Pagode',
    pop: 'Pop',
    poppunk: 'Pop Punk',
    posthardcore: 'Post-Hardcore',
    psychadelic: 'Psychedelic',
    psychobilly: 'Psychobilly',
    raprock: 'Rap-Rock',
    rockabilly: 'Rockabilly',
    samba: 'Samba',
    sertanejo_universitario: 'Sertanejo Universitário',
    sertanejo: 'Sertanejo',
    skapunk: 'Ska Punk',
    speedmetal: 'Speed Metal',
    surfrock: 'Surf Rock',
    trap: 'Trap',
    urban: 'Urban',
  },
  subGenre: {
    subgenre_acapella: 'A capella',
    subgenre_acidjazz: 'Acid Jazz',
    subgenre_acoustic: 'Acoustic',
    subgenre_alternative: 'Alternative',
    subgenre_alternativerap: 'Alternative Rap',
    subgenre_ambient: 'Ambient',
    subgenre_arena: 'Arena',
    subgenre_black: 'Black',
    subgenre_bluegrass: 'Bluegrass',
    subgenre_blues: 'Blues',
    subgenre_breakbeat: 'Breakbeat',
    subgenre_chicago: 'Chicago',
    subgenre_chiptune: 'Chiptune',
    subgenre_classic: 'Classic',
    subgenre_classical: 'Classical',
    subgenre_classicrock: 'Classic Rock',
    subgenre_college: 'College',
    subgenre_contemporary: 'Contemporary',
    subgenre_contemporaryfolk: 'Contemporary Folk',
    subgenre_core: 'Core',
    subgenre_country: 'Country',
    subgenre_dance: 'Dance',
    subgenre_dancepunk: 'Dance Punk',
    subgenre_darkwave: 'Dark Wave',
    subgenre_death: 'Death',
    subgenre_delta: 'Delta',
    subgenre_disco: 'Disco',
    subgenre_downtempo: 'Downtempo',
    subgenre_drumandbass: 'Drum and Bass',
    subgenre_dub: 'Dub',
    subgenre_electric: 'Electric',
    subgenre_electroclash: 'Electroclash',
    subgenre_electronica: 'Electronica',
    subgenre_emo: 'Emo',
    subgenre_experimental: 'Experimental',
    subgenre_folkrock: 'Folk Rock',
    subgenre_funk: 'Funk',
    subgenre_fusion: 'Fusion',
    subgenre_gangsta: 'Gangsta',
    subgenre_garage: 'Garage',
    subgenre_glam: 'Glam',
    subgenre_goth: 'Goth',
    subgenre_grunge: 'Grunge',
    subgenre_hair: 'Hair',
    subgenre_hardcore: 'Hardcore',
    subgenre_hardcoredance: 'Hardcore Dance',
    subgenre_hardcorerap: 'Hardcore Rap',
    subgenre_hardrock: 'Hard Rock',
    subgenre_hiphop: 'Hip Hop',
    subgenre_honkytonk: 'Honky Tonk',
    subgenre_house: 'House',
    subgenre_indierock: 'Indie Rock',
    subgenre_industrial: 'Industrial',
    subgenre_inspirational: 'Inspirational',
    subgenre_jrock: 'J-Rock',
    subgenre_latin: 'Latin',
    subgenre_lofi: 'Lo-fi',
    subgenre_mathrock: 'Math Rock',
    subgenre_metal: 'Metal',
    subgenre_motown: 'Motown',
    subgenre_new_wave: 'New Wave',
    subgenre_noise: 'Noise',
    subgenre_novelty: 'Novelty',
    subgenre_numetal: 'Nu-Metal',
    subgenre_oldies: 'Oldies',
    subgenre_oldschoolhiphop: 'Old School Hip Hop',
    subgenre_other: 'Other',
    subgenre_outlaw: 'Outlaw',
    subgenre_pop: 'Pop',
    subgenre_postrock: 'Post Rock',
    subgenre_power: 'Power',
    subgenre_prog: 'Prog',
    subgenre_progrock: 'Prog Rock',
    subgenre_psychadelic: 'Psychedelic',
    subgenre_ragtime: 'Ragtime',
    subgenre_rap: 'Rap',
    subgenre_reggae: 'Reggae',
    subgenre_rhythmandblues: 'Rhythm and Blues',
    subgenre_rock: 'Rock',
    subgenre_rockabilly: 'Rockabilly',
    subgenre_rockandroll: 'Rock and Roll',
    subgenre_shoegazing: 'Shoegazing',
    subgenre_ska: 'Ska',
    subgenre_smooth: 'Smooth',
    subgenre_softrock: 'Soft Rock',
    subgenre_soul: 'Soul',
    subgenre_southernrock: 'Southern Rock',
    subgenre_speed: 'Speed',
    subgenre_surf: 'Surf',
    subgenre_synth: 'Synthpop',
    subgenre_techno: 'Techno',
    subgenre_teen: 'Teen',
    subgenre_thrash: 'Thrash',
    subgenre_traditionalfolk: 'Traditional Folk',
    subgenre_trance: 'Trance',
    subgenre_triphop: 'Trip Hop',
    subgenre_undergroundrap: 'Underground Rap',
    subgenre_world: 'World',
  },
  subGenreDX: {
    subgenre_axebr: 'Axé',
    subgenre_bossanova: 'Bossa Nova',
    subgenre_brega: 'Brega',
    subgenre_forro: 'Forró',
    subgenre_funkbr: 'Brazilian Funk',
    subgenre_funkmelody: 'Funk Melody',
    subgenre_gospel: 'Gospel',
    subgenre_mpb: 'MPB',
    subgenre_pagode: 'Pagode',
    subgenre_poprock: 'Pop-Rock',
    subgenre_samba: 'Samba',
    subgenre_sertanejo_universitario: 'Sertanejo Universitário',
    subgenre_sertanejo: 'Sertanejo',
    subgenre_technobrega: 'Techno Brega',
  },
  instruments: {
    band: 'Band',
    bass: 'Bass',
    drums: 'Drums',
    guitar: 'Guitar',
    keys: 'Keys',
    real_drums: 'PRO Drums',
    real_bass: 'PRO Bass',
    real_guitar: 'PRO Guitar',
    real_keys: 'PRO Keys',
    vocals: 'Solo Vocals',
    harmonies: 'Harmonies',
  },
  rating: {
    1: 'Family Friendly',
    2: 'Supervision Recommended',
    3: 'Mature Content',
    4: 'No Rating',
  },
  songScrollSpeed: {
    1700: 'Crazy',
    1850: 'Faster',
    2000: 'Fast',
    2150: 'Medium Fast',
    2300: 'Normal',
    2450: 'Medium Slow',
    2600: 'Slow',
    2750: 'Slower',
    3000: 'Comatose',
  },
  vocalGender: {
    male: 'Male',
    female: 'Female',
  },
  vocalParts: {
    0: 'No Vocals',
    1: 'Solo Vocals',
    2: '2-Part Harmonies',
    3: '3-Part Harmonies',
  },
  rankName: {
    '-1': 'No Part',
    0: 'Warmup',
    1: 'Apprentice',
    2: 'Solid',
    3: 'Moderate',
    4: 'Challenging',
    5: 'Nightmare',
    6: 'Impossible',
  },
  rankDots: {
    '-1': 'No Part',
    0: 'Zero Dots',
    1: 'One Dot',
    2: 'Two Dots',
    3: 'Three Dots',
    4: 'Four Dots',
    5: 'Five Dots',
    6: 'Devil Dots',
  },
  solo: {
    drum: 'Drums',
    bass: 'Bass',
    guitar: 'Guitar',
    keys: 'Keys',
    vocal_percussion: 'Vocal Percussion',
  },
  extraAuthoring: {
    disc_update: 'Disc Update',
    pearljam: 'Pearl Jam',
    greenday: 'Green Day',
  },
  encoding: {
    latin1: 'Latin-1',
    utf8: 'UTF-8',
  },
  gameOrigin: {
    rb1: 'Rock Band 1',
    rb1_dlc: 'Rock Band 1 DLC',
    rb2: 'Rock Band 2',
    rb2_dlc: 'Rock Band 2 DLC',
    rb3: 'Rock Band 3',
    rb3_dlc: 'Rock Band 3 DLC',
    lego: 'LEGO Rock Band',
    greenday: 'Green Day: Rock Band',
    ugc: 'User-generated content/Rock Band Network',
    ugc_plus: 'User-generated content/Rock Band Network 2.0',
  },
  songKey: {
    0: 'C',
    1: 'Db',
    2: 'D',
    3: 'Eb',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'Ab',
    9: 'A',
    10: 'Bb',
    11: 'B',
  },
  songTonality: {
    0: 'Major',
    1: 'Minor',
  },
  sortingType: {
    name: 'Song Title',
    artist: 'Artist',
    artist_and_name: 'Artist, Song Title',
    artist_set: 'Artist, Year Released, Album Name, Album Track Number',
    id: 'ID',
    song_id: 'Song ID',
    songname: 'Shortname',
    name_and_artist: 'Song Title, Artist',
  },
} as const

export type SongTitleOptionsUppercaseNames = keyof typeof dta.name
export type SongTitleOptionsLowercaseNames = (typeof dta.name)[SongTitleOptionsUppercaseNames]

export type ExtractNumbers<T> = T extends number ? T : never
export type ExtractStrings<T> = T extends string ? T : never
export type StringNumToNum<T> = T extends '-1' ? -1 : T

export type AnimTempo = keyof typeof dta.animTempo | keyof typeof dta.animTempoStrings
export type AnimTempoStrings = ExtractStrings<AnimTempo>
export type AnimTempoNumbers = ExtractNumbers<AnimTempo>
export type AnimTempoNames = (typeof dta.animTempo)[AnimTempoNumbers]

export type BandFailCue = keyof typeof dta.bandFailCue
export type BandFailCueNames = (typeof dta.bandFailCue)[BandFailCue]

export type PercussionBank = keyof typeof dta.percussionBank
export type PercussionBankNames = (typeof dta.percussionBank)[PercussionBank]

export type DrumBank = keyof typeof dta.drumBank
export type DrumBankNames = (typeof dta.drumBank)[DrumBank]

export type SongGenre = keyof typeof dta.genre
export type SongGenreNames = (typeof dta.genre)[SongGenre]
export type SongGenreDX = keyof typeof dta.genreDX
export type SongGenreDXNames = (typeof dta.genreDX)[SongGenreDX]

export type SongRating = keyof typeof dta.rating
export type SongRatingNames = (typeof dta.rating)[SongRating]

export type SongScrollSpeed = keyof typeof dta.songScrollSpeed
export type SongScrollSpeedNames = (typeof dta.songScrollSpeed)[SongScrollSpeed]

export type SongSubGenre = keyof typeof dta.subGenre
export type SongSubGenreNames = (typeof dta.subGenre)[SongSubGenre]
export type SongSubGenreDX = keyof typeof dta.subGenreDX
export type SongSubGenreDXNames = (typeof dta.subGenreDX)[SongSubGenreDX]

export type VocalGender = keyof typeof dta.vocalGender
export type VocalGenderNames = (typeof dta.vocalGender)[VocalGender]

export type VocalParts = keyof typeof dta.vocalParts
export type VocalPartsNames = (typeof dta.vocalParts)[VocalParts]

export type SongKey = keyof typeof dta.songKey
export type SongTonality = keyof typeof dta.songTonality

export type InstrRankingNumbers = StringNumToNum<keyof typeof dta.rankName>
export type InstrRankingNames = (typeof dta.rankName)[InstrRankingNumbers]
export type InstrRankingNamesAsDots = (typeof dta.rankDots)[InstrRankingNumbers]

export type BandRankingNumbers = Exclude<InstrRankingNumbers, -1>
export type BandRankingNames = (typeof dta.rankName)[BandRankingNumbers]
export type BandRankingNamesAsDots = (typeof dta.rankDots)[BandRankingNumbers]

export type SoloFlags = keyof typeof dta.solo
export type SoloFlagsNames = (typeof dta.solo)[SoloFlags]

export type ExtraAuthoringFlags = keyof typeof dta.extraAuthoring
export type ExtraAuthoringFlagsNames = (typeof dta.extraAuthoring)[ExtraAuthoringFlags]

export type SongEncoding = keyof typeof dta.encoding
export type SongEncodingNames = (typeof dta.encoding)[SongEncoding]

export type SongGameOrigin = keyof typeof dta.gameOrigin
export type SongGameOriginNames = (typeof dta.gameOrigin)[SongGameOrigin]

export type SongSortingTypes = (typeof dta.sortingType)[keyof typeof dta.sortingType] | null

export type InstrumentTypes = keyof typeof dta.instruments
export type InstrumentNames = (typeof dta.instruments)[keyof typeof dta.instruments]

export type DTATracksCountArray = [number, number, number, number, number, number, number?]
export type MAGMALanguagesTypes = 'English' | 'French' | 'German' | 'Italian' | 'Japanese' | 'Spanish'

/**
 * A parsed song object that works on Rock Band 3 by providing all required values for it to work.
 */
export interface RB3CompatibleDTAFile {
  /**
   * An unique shortname ID of the song.
   */
  id: string
  /**
   * The song's title.
   */
  name: string
  /**
   * The song's artist/band.
   */
  artist: string
  /**
   * Tells if the song is a master recording.
   */
  master: boolean
  /**
   * If `true`, the song won't appear on the song library. Default is `false`.
   */
  fake?: boolean
  /**
   * A numerical, unique number ID of the song, used as an ID for saving scores. Might be a string ID as well (but scores won't be saved on these songs).
   */
  song_id: number | string
  upgrade_version?: number
  /**
   * The filename used inside the song's CON file structure.
   */
  songname: string
  /**
   * An array with the tracks count of all instruments, backing, and crowd channels.
   */
  tracks_count: DTATracksCountArray
  /**
   * Tracks panning information of all audio channels.
   */
  pans?: number[]
  /**
   * Volume information of all audio channels.
   */
  vols?: number[]
  cores?: number[]
  /**
   * The quantity of vocal parts of the song.
   */
  vocal_parts: VocalParts
  /**
   * This controls the volume reduction of a stem when the player misses notes/fails out.
   * Number value is in decibels. Default is `-96`.
   *
   * If your song has "fake" stems produced by frequency banding, you can use this to make the game mute the stems less harshly when players make mistakes or fail, in order to prevent the overall sound from becoming too deadened.
   */
  mute_volume?: number
  /**
   * This controls the volume reduction of the vocal stem if the vocalist fails. Default is `-12`.
   */
  mute_volume_vocals?: number
  /**
   * Default is `170`.
   */
  hopo_threshold?: number
  /**
   * The audio cue type of the vocal percussion. Default is `sfx/tambourine_bank.milo` (Tambourine).
   */
  bank: PercussionBank
  /**
   * The audio cue type of the drums on Drum Fills/Freestyle Mode. Default is `sfx/kit01_bank.milo` (Hard Rock Kit).
   */
  drum_bank: DrumBank
  /**
   * The song animation's speed. Default is `32` (Normal).
   */
  anim_tempo: AnimTempoNumbers
  band_fail_cue?: BandFailCue
  /**
   * The speed of the vocal track. Default is `2300` (Normal).
   */
  song_scroll_speed?: SongScrollSpeed
  /**
   * An array with start and end of the preview, in milliseconds
   */
  preview: [number, number]
  /**
   * The length of the song, in milliseconds.
   */
  song_length: number
  /**
   * The song's band ranking number.
   */
  rank_band: number
  /**
   * The song's drums ranking number. This rank is shared with PRO Drums as well.
   */
  rank_drum?: number
  /**
   * The song's bass ranking number.
   */
  rank_bass?: number
  /**
   * The song's guitar ranking number.
   */
  rank_guitar?: number
  /**
   * The song's vocals ranking number. This rank is shared with Harmonies as well.
   */
  rank_vocals?: number
  /**
   * The song's keys ranking number.
   */
  rank_keys?: number
  /**
   * The song's PRO Bass ranking number.
   */
  rank_real_bass?: number
  /**
   * The song's PRO Guitar ranking number.
   */
  rank_real_guitar?: number
  /**
   * The song's PRO Keys ranking number.
   */
  rank_real_keys?: number
  /**
   * An array specifying which instrument parts has solo sessions.
   */
  solo?: SoloFlags[]
  /**
   * Adjusts the entire song's vocal chart up or down by cents. Default is `0`.
   */
  tuning_offset_cents?: number
  /**
   * The volume of the vocal guide pitch on the vocal practice menu. Default is `-3`.
   */
  guide_pitch_volume?: number
  /**
   * The encoding of the song file DTA values. Default is `latin1`.
   *
   * Songs with any characters with accents on the DTA must set the encoding to `utf8`.
   */
  encoding?: SongEncoding
  /**
   * The version of the song's MILO file.
   */
  format?: number
  version?: number
  /**
   * The game origin of the song.
   *
   * All customs are compiled on MAGMA using `ugc_plus`.
   */
  game_origin: SongGameOrigin
  /**
   * The song's rating.
   */
  rating: SongRating
  /**
   * The song's genre.
   */
  genre: SongGenre
  /**
   * The song's sub-genre.
   */
  sub_genre?: SongSubGenre
  /**
   * The gender of the lead vocalist.
   */
  vocal_gender: VocalGender
  /**
   * The song's release year.
   */
  year_released: number
  /**
   * The song's recorded year.
   *
   * This is used on re-recordings or alternative versions of
   * the song.
   */
  year_recorded?: number
  /**
   * Tells if the song has an album artwork file to be displayed.
   */
  album_art: boolean
  /**
   * The name of the song's album.
   */
  album_name?: string
  /**
   * The song's track number on the album.
   */
  album_track_number?: number
  /**
   * The vocal tonic note of the song. This changes the HUD on the vocal tracks based on the given note.
   *
   * If `song_key` is not specified, it'll be used as song key in general, changing the accident symbol on
   * PRO Guitar/Bass parts and showing the song key on PRO Keys trainers based on it.
   */
  vocal_tonic_note?: SongKey
  /**
   * The song tonality of the song.
   *
   * Values can be `0` (Major tonality) or `1` (Minor tonality).
   */
  song_tonality?: SongTonality
  /**
   * Specific parameter to override the `vocal_tonic_note` on PRO Guitar/Bass/Keys parts.
   */
  song_key?: SongKey
  /**
   * An array with the tuning of all 6 strings of the PRO Guitar part.
   */
  real_guitar_tuning?: [number, number, number, number, number, number]
  /**
   * An array with the tuning of all 4 strings of the PRO Bass part.
   */
  real_bass_tuning?: [number, number, number, number]
  /**
   * An array with flags about the existence of an MIDI file with any track update for the song inside the game's file structure.
   *
   * Rock Band 3 uses this flag to update several pre-RB3 DLCs songs and exports.
   */
  extra_authoring?: ExtraAuthoringFlags[]
  /**
   * If `true`, the game will load both album art and MILO file from the game patch file system.
   */
  alternate_path?: boolean
  context?: number
  /**
   * The name of the song's pack.
   */
  pack_name?: string
  base_points?: number
  /**
   * The loading phrase that will appear on the loading screen.
   *
   * _This value only works on Rock Band 3 Deluxe_.
   */
  loading_phrase?: string
  /**
   * The PRO Guitar/Bass chart author(s).
   *
   * _This value only works on Rock Band 3 Deluxe_.
   */
  strings_author?: string
  /**
   * The Basic Keys and PRO Keys chart author(s).
   *
   * _This value only works on Rock Band 3 Deluxe_.
   */
  keys_author?: string
  /**
   * The chart author(s) of the song.
   *
   * _This value only works on Rock Band 3 Deluxe_.
   */
  author?: string
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
  customsource?: CustomSourceValuesObject
  /**
   * An object with values that will be used to configure the `MAGMAProject` module.
   */
  magma?: MAGMAProjectSongData
  /**
   * The original ID of the song's name.
   */
  original_id?: string
}

export interface CustomSourceValuesObject {
  /**
   * The game origin of the song.
   *
   * All customs are compiled on MAGMA using `ugc_plus`.
   */
  game_origin?: LiteralUnion<SongGameOrigin, string>
  /**
   * The song's genre.
   */
  genre?: LiteralUnion<SongGenre | SongGenreDX, string>
  /**
   * The song's sub-genre.
   */
  sub_genre?: LiteralUnion<SongSubGenre | SongSubGenreDX, string>
}

export type PartialDTAFile = Partial<RB3CompatibleDTAFile> & {
  /**
   * An unique shortname ID of the song.
   */
  id: string
}
export type DTAFileUpdateObject = PartialDTAFile & {
  /**
   * An unique shortname ID to replace the old ID of the song.
   */
  newID?: string
}

export type DTAFileBatchUpdateObject = Omit<PartialDTAFile, 'id' | 'songname' | 'song_id'>

export type DTAObjectTypes = RB3CompatibleDTAFile | PartialDTAFile | PartialDTAFile[]

/**
 * Type with all available keys from a DTA File.
 */
export type DTAFileKeys = keyof RB3CompatibleDTAFile

/**
 * Type guard function to check through all known parsed song types if the provided parsed song
 * is a `DTAFile` object.
 * - - - -
 * @param {unknown} song Any type of parsed song object or class.
 * @returns {boolean} A boolean value that tells the provided parsed song is a `DTAFile` object.
 */
export const isRB3CompatibleDTA = (song: unknown): song is RB3CompatibleDTAFile => {
  return !Array.isArray(song) && typeof song === 'object' && song !== null && 'name' in song && 'artist' in song && 'id' in song && 'master' in song && 'tracks_count' in song && 'song_id' in song && 'preview' in song && 'vocal_parts' in song && 'pans' in song && 'vols' in song && 'cores' in song && 'bank' in song && 'anim_tempo' in song && 'rank_band' in song && 'game_origin' in song && 'rating' in song && 'genre' in song && 'vocal_gender' in song && 'year_released' in song && 'format' in song && 'version' in song
}

/**
 * Gets all the missing values of a partial parsed song object and returns them as array.
 * - - - -
 * @param {PartialDTAFile} song A parsed song object.
 * @returns {DTAFileKeys[]}
 */
export const getCompleteDTAMissingValues = (song: PartialDTAFile): DTAFileKeys[] => {
  const missingValues: DTAFileKeys[] = []
  let hasName = false,
    hasArtist = false,
    hasID = false,
    hasMaster = false,
    hasTracksCount = false,
    hasSongID = false,
    hasPreview = false,
    hasVocalParts = false,
    hasPans = false,
    hasVols = false,
    hasCores = false,
    hasBank = false,
    hasAnimTempo = false,
    hasRankBand = false,
    hasGameOrigin = false,
    hasRating = false,
    hasGenre = false,
    hasVocalGender = false,
    hasYearReleased = false,
    hasFormat = false,
    hasVersion = false

  const allKeys = Object.keys(song) as DTAFileKeys[]

  for (const key of allKeys) {
    if (key === 'name') hasName = true
    if (key === 'artist') hasArtist = true
    if (key === 'id') hasID = true
    if (key === 'master') hasMaster = true
    if (key === 'tracks_count') hasTracksCount = true
    if (key === 'song_id') hasSongID = true
    if (key === 'preview') hasPreview = true
    if (key === 'vocal_parts') hasVocalParts = true
    if (key === 'pans') hasPans = true
    if (key === 'vols') hasVols = true
    if (key === 'cores') hasCores = true
    if (key === 'bank') hasBank = true
    if (key === 'anim_tempo') hasAnimTempo = true
    if (key === 'rank_band') hasRankBand = true
    if (key === 'game_origin') hasGameOrigin = true
    if (key === 'rating') hasRating = true
    if (key === 'genre') hasGenre = true
    if (key === 'vocal_gender') hasVocalGender = true
    if (key === 'year_released') hasYearReleased = true
    if (key === 'format') hasFormat = true
    if (key === 'version') hasVersion = true
  }

  if (!hasName) missingValues.push('name')
  if (!hasArtist) missingValues.push('artist')
  if (!hasID) missingValues.push('id')
  if (!hasMaster) missingValues.push('master')
  if (!hasTracksCount) missingValues.push('tracks_count')
  if (!hasSongID) missingValues.push('song_id')
  if (!hasPreview) missingValues.push('preview')
  if (!hasVocalParts) missingValues.push('vocal_parts')
  if (!hasPans) missingValues.push('pans')
  if (!hasVols) missingValues.push('vols')
  if (!hasCores) missingValues.push('cores')
  if (!hasBank) missingValues.push('bank')
  if (!hasAnimTempo) missingValues.push('anim_tempo')
  if (!hasRankBand) missingValues.push('rank_band')
  if (!hasGameOrigin) missingValues.push('game_origin')
  if (!hasRating) missingValues.push('rating')
  if (!hasGenre) missingValues.push('genre')
  if (!hasVocalGender) missingValues.push('vocal_gender')
  if (!hasYearReleased) missingValues.push('year_released')
  if (!hasFormat) missingValues.push('format')
  if (!hasVersion) missingValues.push('version')

  return missingValues
}

/**
 * Converts a DTAFile `Map` class to a `DTAFile` object, sorting all key values to match common `.dta` file structure.
 * - - - -
 * @param {DTAMap} song A `Map` class with `DTAFile` keys and values.
 * @returns {DTAMap} A `Map` class with `DTAFile` keys and values.
 */
export const sortDTAMap = (song: MyObject<RB3CompatibleDTAFile>): MyObject<RB3CompatibleDTAFile> => {
  const sortedDTA = new MyObject<RB3CompatibleDTAFile>()

  for (const key of dta.allKeys) {
    if (song.has(key)) {
      sortedDTA.set(key, song.get(key))
    }
  }

  return sortedDTA
}

/**
 * Removes if statements from common values that generally uses if statements (Game Origin, Genre, and Sub-Genre).
 * - - - -
 * @param {DTAMap} song The unformatted DTA file map.
 * @returns {DTAMap} The DTA file map with only the values that works in vanilla game.
 */
export const customSourceIfdefDeconstructor = (song: MyObject<RB3CompatibleDTAFile>): MyObject<RB3CompatibleDTAFile> => {
  const gameOrigin = song.get('game_origin') as CustomSourceValuesObject['game_origin']
  const genre = song.get('genre') as CustomSourceValuesObject['genre']
  const subGenre = song.get('sub_genre') as CustomSourceValuesObject['sub_genre']

  let hasAnyCustomSource = false
  const customSource = new MyObject<CustomSourceValuesObject>()

  if (gameOrigin && gameOrigin.startsWith('#ifdef')) {
    const split = gameOrigin.split(' ')
    song.set('game_origin', split[4] as RB3CompatibleDTAFile['game_origin'])
    customSource.set('game_origin', split[2])
    hasAnyCustomSource = true
  }
  if (genre && genre.startsWith('#ifdef')) {
    const split = genre.split(' ')
    song.set('genre', split[4] as RB3CompatibleDTAFile['genre'])
    customSource.set('genre', split[2])
    hasAnyCustomSource = true
  }
  if (subGenre && subGenre.startsWith('#ifdef')) {
    const split = subGenre.split(' ')
    song.set('sub_genre', split[4] as RB3CompatibleDTAFile['sub_genre'])
    customSource.set('sub_genre', split[2])
    hasAnyCustomSource = true
  }

  if (hasAnyCustomSource) song.set('customsource', customSource.toJSON())

  return song
}
