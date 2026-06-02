import type { SongGenre, SongGenreDX, SongSubGenre, SongSubGenreDX } from 'rockshelf-core/rbtools/lib'
import zod from 'zod'

/** Aplication version, change this when updating. */
export const APP_VERSION = '0.0.1'

/** Flags to allow logging of specific messages. */
export const VERBOSE = {
  /**
   * Allow logging of specific typed objects sent by the main process.
   */
  STRUCT: true,
} as const

export const DXNIGHTLYLINK = 'https://nightly.link/hmxmilohax/rock-band-3-deluxe/workflows/build/develop'
export const TU5LINK = 'http://b0.ww.np.dl.playstation.net/tppkg/np/BLUS30463/BLUS30463_T4/e52d21c696ed0fcf/UP8802-BLUS30463_00-ROCKBAND3PATCH05-A0105-V0100-PE.pkg'

export const MYPACKAGES_TABS = {
  PACKAGES: 0,
  FILTERS: 10,
} as const

export const PACKAGE_DETAILS_TABS = {
  SONGS: 0,
  DESCRIPTION: 1,
  DETAILS: 2,
  OPTIONS: 3,
  FILTERS: 10,
} as const

export const SONG_DETAILS_TABS = {
  DETAILS: 0,
  LEADERBOARDS: 1,
  OPTIONS: 2,
} as const

export const CREATE_NEW_PACKAGE_TABS = {
  FILES: 0,
  SONGS: 1,
  OPTIONS: 2,
} as const

export const RHYTHMVERSE_SCREEN_TABS = {
  BROWSE: 0,
} as const

export const EDIT_SONG_SCREEN_TABS = {
  SONG_ENTRY: 0,
  METADATA: 1,
  INSTRUMENT_DATA: 2,
  TECHNICAL_DATA: 3,
  DELUXE_AND_MAGMA: 4,
} as const

export const EDIT_SONG_SCREEN_DROPDOWNS = {
  GENRE: 0,
  GAME_ORIGIN: 1,
} as const

export const GAME_ORIGIN_HEADERS = [
  { code: 'betaBuilds', options: ['gh1_beta', 'gh2_beta', 'gh80s_beta', 'gh3_beta', 'gh5_beta', 'djhero_beta', 'gh6_beta', 'djhero2_beta', 'rb1_beta', 'rb2_beta', 'rb3_beta'], official: true },
  { code: 'ghGames', options: ['gh1', 'gh2', 'gh2dlc', 'gh80s', 'gh3', 'gh3dlc', 'ghot', 'gha', 'ghwt', 'ghwtdlc', 'ghotd', 'ghm', 'ghmdlc', 'ghsh', 'gh5', 'gh5dlc', 'djhero', 'djherodlc', 'bh', 'bh2', 'bhds', 'ghvh', 'ghotmh', 'ghwor', 'ghwordlc', 'djhero2', 'djhero2dlc', 'ghl', 'ghtv', 'gh', 'ghdlc'], official: true },
  { code: 'hmxGames', options: ['acs', 'amp03', 'amp16', 'antigrav', 'audica', 'flux', 'fnfestival', 'freq', 'ham1', 'ham2', 'ham3', 'kr_cmt', 'kr_party', 'kr_vol_1', 'kr_vol_2', 'kr_vol_3', 'kr', 'viper'], official: true },
  { code: 'rbGames', options: ['dlc', 'rb1_dlc', 'rb3_dlc', 'ugc1', 'rbtp_vol_1', 'rbtp_acdc', 'rbtp_vol_2', 'rbtp_classic_rock', 'rbtp_country_1', 'beatles', 'beatles_dlc', 'rbtp_metal', 'rb3dlc', 'rbtp_country_2', 'ugc2', 'blitz', 'pearljam', 'rbjapan', 'rb1', 'rb2', 'rb3', 'rb4', 'rb4dlc', 'rb4_dlc', 'rbvr', 'rb4_rivals', 'lost_dlc', 'lego', 'greenday'], official: true },
  { code: 'thirdPartyGames', options: ['gd', 'gf1', 'gf2dm1', 'pg', 'pgdlc', 'rr', 'rrdlc', 'unbeatable'], official: true },
  { code: 'charters', options: ['ataeaf', 'ganso', 'goulart', 'iasg14', 'linosrb', 'onyxite', 'pistolofrb6', 'plumato', 'ruggy', 'sog', 'sygenysis', 'ted', '3rs'] },
  { code: 'community', options: ['a7xmegapack', 'airheads', 'customs', 'c3customs', 'c3legacy', 'euterpe', 'finnish', 'jrb', 'lanebreakers', 'lanebreakersbonus', 'lanebreakersdlc', 'milohax', 'paramoremegapack', 'rbbr', 'rbee', 'rbrc', 'tbrbcdlc', 'ugc', 'ugc_c3', 'ugc_lost', 'ugc_plus', 'ugc_rv'] },
  { code: 'fanMadeGames', options: ['ch', 'fof', 'fretsmasher', 'phaseshift', 'yarg', 'yargdlc'] },
]

export const DTA_STRUCT = {
  allGenresKeys: ['alternative', 'blues', 'classical', 'classicrock', 'country', 'emo', 'fusion', 'glam', 'grunge', 'hiphoprap', 'indierock', 'inspirational', 'jazz', 'jrock', 'latin', 'metal', 'new_wave', 'novelty', 'numetal', 'other', 'popdanceelectronic', 'poprock', 'prog', 'punk', 'rbsoulfunk', 'reggaeska', 'rock', 'southernrock', 'world'] as SongGenre[],
  allGenresKeysDX: ['alternative', 'axebr', 'bigband', 'blackmetal', 'blues', 'bossanova', 'bregatechnobrega', 'classical', 'classicrock', 'country', 'deathmetal', 'disco', 'dubstep', 'emo', 'experimental', 'forro', 'funkbr', 'funkmelody', 'fusion', 'glam', 'gospel', 'grunge', 'hairmetal', 'hardcorepunk', 'hiphoprap', 'indierock', 'industrial', 'inspirational', 'jazz', 'jrock', 'latin', 'metal', 'metalcore', 'mpb', 'new_wave', 'novelty', 'numetal', 'other', 'pagode', 'pop', 'popdanceelectronic', 'poppunk', 'poprock', 'posthardcore', 'prog', 'psychadelic', 'psychobilly', 'punk', 'raprock', 'rbsoulfunk', 'reggaeska', 'rock', 'rockabilly', 'samba', 'sertanejo', 'sertanejo_universitario', 'skapunk', 'southernrock', 'speedmetal', 'surfrock', 'trap', 'urban', 'world'] as SongGenreDX[],
  allSubgenresKeysDX: ['subgenre_acapella', 'subgenre_acidjazz', 'subgenre_acoustic', 'subgenre_alternative', 'subgenre_alternativerap', 'subgenre_ambient', 'subgenre_arena', 'subgenre_axebr', 'subgenre_black', 'subgenre_bluegrass', 'subgenre_blues', 'subgenre_bossanova', 'subgenre_breakbeat', 'subgenre_brega', 'subgenre_chicago', 'subgenre_chiptune', 'subgenre_classic', 'subgenre_classical', 'subgenre_classicrock', 'subgenre_college', 'subgenre_contemporary', 'subgenre_contemporaryfolk', 'subgenre_core', 'subgenre_country', 'subgenre_dance', 'subgenre_dancepunk', 'subgenre_darkwave', 'subgenre_death', 'subgenre_delta', 'subgenre_disco', 'subgenre_downtempo', 'subgenre_drumandbass', 'subgenre_dub', 'subgenre_electric', 'subgenre_electroclash', 'subgenre_electronica', 'subgenre_emo', 'subgenre_experimental', 'subgenre_folkrock', 'subgenre_forro', 'subgenre_funk', 'subgenre_funkbr', 'subgenre_funkmelody', 'subgenre_fusion', 'subgenre_gangsta', 'subgenre_garage', 'subgenre_glam', 'subgenre_gospel', 'subgenre_goth', 'subgenre_grunge', 'subgenre_hair', 'subgenre_hardcore', 'subgenre_hardcoredance', 'subgenre_hardcorerap', 'subgenre_hardrock', 'subgenre_hiphop', 'subgenre_honkytonk', 'subgenre_house', 'subgenre_indierock', 'subgenre_industrial', 'subgenre_inspirational', 'subgenre_jrock', 'subgenre_latin', 'subgenre_lofi', 'subgenre_mathrock', 'subgenre_metal', 'subgenre_motown', 'subgenre_mpb', 'subgenre_new_wave', 'subgenre_noise', 'subgenre_novelty', 'subgenre_numetal', 'subgenre_oldies', 'subgenre_oldschoolhiphop', 'subgenre_other', 'subgenre_outlaw', 'subgenre_pagode', 'subgenre_pop', 'subgenre_poprock', 'subgenre_postrock', 'subgenre_power', 'subgenre_prog', 'subgenre_progrock', 'subgenre_psychadelic', 'subgenre_ragtime', 'subgenre_rap', 'subgenre_reggae', 'subgenre_rhythmandblues', 'subgenre_rock', 'subgenre_rockabilly', 'subgenre_rockandroll', 'subgenre_samba', 'subgenre_sertanejo', 'subgenre_sertanejo_universitario', 'subgenre_shoegazing', 'subgenre_ska', 'subgenre_smooth', 'subgenre_softrock', 'subgenre_soul', 'subgenre_southernrock', 'subgenre_speed', 'subgenre_surf', 'subgenre_synth', 'subgenre_techno', 'subgenre_technobrega', 'subgenre_teen', 'subgenre_thrash', 'subgenre_traditionalfolk', 'subgenre_trance', 'subgenre_triphop', 'subgenre_undergroundrap', 'subgenre_world'] as (SongSubGenre | SongSubGenreDX)[],
  defaultSubgenre: {
    alternative: 'subgenre_alternative',
    blues: 'subgenre_acoustic',
    classical: 'subgenre_classical',
    classicrock: 'subgenre_classicrock',
    country: 'subgenre_alternative',
    emo: 'subgenre_emo',
    fusion: 'subgenre_fusion',
    glam: 'subgenre_glam',
    grunge: 'subgenre_grunge',
    hiphoprap: 'subgenre_alternativerap',
    indierock: 'subgenre_indierock',
    inspirational: 'subgenre_inspirational',
    jazz: 'subgenre_acidjazz',
    jrock: 'subgenre_jrock',
    latin: 'subgenre_latin',
    metal: 'subgenre_alternative',
    new_wave: 'subgenre_darkwave',
    novelty: 'subgenre_novelty',
    numetal: 'subgenre_numetal',
    other: 'subgenre_acapella',
    popdanceelectronic: 'subgenre_ambient',
    poprock: 'subgenre_contemporary',
    prog: 'subgenre_progrock',
    punk: 'subgenre_alternative',
    rbsoulfunk: 'subgenre_disco',
    reggaeska: 'subgenre_reggae',
    rock: 'subgenre_arena',
    southernrock: 'subgenre_southernrock',
    world: 'subgenre_world',
  },
  subGenresAllowed: {
    alternative: ['subgenre_alternative', 'subgenre_college', 'subgenre_other'],
    blues: ['subgenre_acoustic', 'subgenre_chicago', 'subgenre_classic', 'subgenre_contemporary', 'subgenre_country', 'subgenre_delta', 'subgenre_electric', 'subgenre_other'],
    classical: ['subgenre_classical'],
    classicrock: ['subgenre_classicrock'],
    country: ['subgenre_alternative', 'subgenre_bluegrass', 'subgenre_contemporary', 'subgenre_honkytonk', 'subgenre_outlaw', 'subgenre_traditionalfolk', 'subgenre_other'],
    emo: ['subgenre_emo'],
    fusion: ['subgenre_fusion'],
    glam: ['subgenre_glam', 'subgenre_goth', 'subgenre_other'],
    grunge: ['subgenre_grunge'],
    hiphoprap: ['subgenre_alternativerap', 'subgenre_gangsta', 'subgenre_hardcorerap', 'subgenre_hiphop', 'subgenre_oldschoolhiphop', 'subgenre_rap', 'subgenre_triphop', 'subgenre_undergroundrap', 'subgenre_other'],
    indierock: ['subgenre_indierock', 'subgenre_lofi', 'subgenre_mathrock', 'subgenre_noise', 'subgenre_postrock', 'subgenre_shoegazing', 'subgenre_other'],
    inspirational: ['subgenre_inspirational'],
    jazz: ['subgenre_acidjazz', 'subgenre_experimental', 'subgenre_ragtime', 'subgenre_smooth', 'subgenre_other'],
    jrock: ['subgenre_jrock'],
    latin: ['subgenre_latin'],
    metal: ['subgenre_alternative', 'subgenre_black', 'subgenre_core', 'subgenre_death', 'subgenre_hair', 'subgenre_industrial', 'subgenre_metal', 'subgenre_power', 'subgenre_prog', 'subgenre_speed', 'subgenre_thrash', 'subgenre_other'],
    new_wave: ['subgenre_darkwave', 'subgenre_electroclash', 'subgenre_new_wave', 'subgenre_synth', 'subgenre_other'],
    novelty: ['subgenre_novelty'],
    numetal: ['subgenre_numetal'],
    other: ['subgenre_acapella', 'subgenre_acoustic', 'subgenre_contemporaryfolk', 'subgenre_experimental', 'subgenre_oldies', 'subgenre_other'],
    popdanceelectronic: ['subgenre_ambient', 'subgenre_breakbeat', 'subgenre_chiptune', 'subgenre_dance', 'subgenre_downtempo', 'subgenre_dub', 'subgenre_drumandbass', 'subgenre_electronica', 'subgenre_garage', 'subgenre_hardcoredance', 'subgenre_house', 'subgenre_industrial', 'subgenre_techno', 'subgenre_trance', 'subgenre_other'],
    poprock: ['subgenre_contemporary', 'subgenre_pop', 'subgenre_softrock', 'subgenre_teen', 'subgenre_other'],
    prog: ['subgenre_progrock'],
    punk: ['subgenre_alternative', 'subgenre_classic', 'subgenre_dancepunk', 'subgenre_garage', 'subgenre_hardcore', 'subgenre_pop', 'subgenre_other'],
    rbsoulfunk: ['subgenre_disco', 'subgenre_funk', 'subgenre_motown', 'subgenre_rhythmandblues', 'subgenre_soul', 'subgenre_other'],
    reggaeska: ['subgenre_reggae', 'subgenre_ska', 'subgenre_other'],
    rock: ['subgenre_arena', 'subgenre_blues', 'subgenre_folkrock', 'subgenre_garage', 'subgenre_hardrock', 'subgenre_psychadelic', 'subgenre_rock', 'subgenre_rockabilly', 'subgenre_rockandroll', 'subgenre_surf', 'subgenre_other'],
    southernrock: ['subgenre_southernrock'],
    world: ['subgenre_world'],
  } satisfies { [key in SongGenre]: SongSubGenre[] },
  validators: {
    id: zod
      .string()
      .min(1, 'cantBeBlank')
      .max(64, 'tooBig')
      .regex(/^\S+$/, 'noSpacesAllowed')
      .regex(/^[a-zA-Z0-9_-]+$/, 'noSpecialCharacters'),
    songname: zod
      .string()
      .min(1, 'cantBeBlank')
      .max(42, 'tooBig')
      .regex(/^\S+$/, 'noSpacesAllowed')
      .regex(/^[a-zA-Z0-9_-]+$/, 'noSpecialCharacters'),
    song_id: zod
      .string()
      .min(1, 'cantBeBlank')
      .max(10, 'tooBig')
      .regex(/^\S+$/, 'noSpacesAllowed')
      .regex(/^[0-9]+$/, 'numbersOnly'),
  } as const,
} as const
