/** Aplication version, change this when updating. */
export const APP_VERSION = '0.0.1'

/** Flags to allow logging of specific messages. */
export const VERBOSE = {
  /**
   * Allow logging of specific typed objects sent by the main process.
   */
  STRUCT: false,
} as const

export const DXNIGHTLYLINK = 'https://nightly.link/hmxmilohax/rock-band-3-deluxe/workflows/build/develop'
export const TU5LINK = 'http://b0.ww.np.dl.playstation.net/tppkg/np/BLUS30463/BLUS30463_T4/e52d21c696ed0fcf/UP8802-BLUS30463_00-ROCKBAND3PATCH05-A0105-V0100-PE.pkg'

export const MYPACKAGES_TABS = {
  PACKAGES: 0,
  FILTERS: 10,
} as const

export const PACKAGE_DETAILS_TABS = {
  SONGS: 0,
  DETAILS: 1,
  OPTIONS: 2,
  FILTERS: 10,
} as const

export const CREATE_NEW_PACKAGE_TABS = {
  FILES: 0,
  OPTIONS: 1,
} as const

export const SONG_DETAILS_TABS = {
  DETAILS: 0,
  LEADERBOARDS: 1,
  OPTIONS: 2,
} as const
