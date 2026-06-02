import { AnimTempoNumbers, DrumBank, PartialDTAFile, PercussionBank, RB3CompatibleDTAFile, SongGenre, SongGenreDX, SongRating, SongSubGenre, SongSubGenreDX, VocalParts } from 'rockshelf-core/rbtools/lib'
import { create } from 'zustand'

export interface EditSongScreenStateProps {
  isEditingSong: boolean
  editSongScreenTab: number
  hasUnsavedChanges: boolean
  dropdownActivated: number

  // Values with possible errors
  songEntryID: string
  songEntryIDError: string | null
  songname: string
  songnameError: string | null
  songID: string
  songIDError: string | null

  name: string
  artist: string
  master: boolean
  fake: boolean
  albumArt: boolean
  songRating: SongRating
  genre: SongGenre
  subGenre: SongSubGenre
  yearReleased: number
  yearReleasedEdit: string | null
  albumName: string | null
  albumTrackNumber: number
  albumTrackNumberEdit: string | null
  yearRecorded: number | null
  yearRecordedEdit: string | null

  // Deluxe and MAGMA
  enableDXGenre: boolean
  dxGenre: SongGenre | SongGenreDX
  enableDXGameOrigin: boolean
  dxGameOrigin: string
  author: string
  loadingPhrase: string
  multitrack: NonNullable<RB3CompatibleDTAFile['multitrack']> | null
  rhythmPart: NonNullable<RB3CompatibleDTAFile['rhythmOn']> | null
  reductionsStatus: NonNullable<RB3CompatibleDTAFile['emh']> | null
  unpitchedVocals: boolean
  convert: boolean
  doubleKick: boolean
}

export interface EditSongScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<EditSongScreenStateProps> | ((oldState: EditSongScreenStateProps) => Partial<EditSongScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setEditSongScreenState(state: Partial<EditSongScreenStateProps> | ((oldState: EditSongScreenStateProps) => Partial<EditSongScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {EditSongScreenStateProps}
   */
  getEditSongScreenState(): EditSongScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetEditSongScreenState(): void
  startEditingSong(songValues: Partial<PartialDTAFile>): void
}

export type EditSongScreenStateHook = EditSongScreenStateProps & EditSongScreenStateActions

const defaultState: EditSongScreenStateProps = {
  isEditingSong: false,
  hasUnsavedChanges: false,
  editSongScreenTab: 0,
  dropdownActivated: -1,

  songEntryID: '',
  songEntryIDError: null,
  songname: '',
  songnameError: null,
  songID: '',
  songIDError: null,

  name: '',
  artist: '',
  master: false,
  fake: false,
  albumArt: true,
  songRating: 4,
  genre: 'rock',
  subGenre: 'subgenre_rock',
  yearReleased: 2026,
  yearReleasedEdit: null,
  albumName: null,
  albumTrackNumber: 0,
  albumTrackNumberEdit: null,
  yearRecorded: 0,
  yearRecordedEdit: null,

  enableDXGenre: false,
  dxGenre: 'rock',
  enableDXGameOrigin: false,
  dxGameOrigin: 'ugc_plus',
  author: '',
  loadingPhrase: '',
  multitrack: null,
  rhythmPart: null,
  reductionsStatus: null,
  unpitchedVocals: false,
  convert: false,
  doubleKick: false,
}

export const useEditSongScreenState = create<EditSongScreenStateHook>()((set, get) => ({
  ...defaultState,
  setEditSongScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getEditSongScreenState() {
    const state = get()
    const map = new Map<keyof EditSongScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof EditSongScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof EditSongScreenStateProps, unknown> as EditSongScreenStateProps
  },
  resetEditSongScreenState() {
    return set(() => defaultState)
  },
  startEditingSong(songValues) {
    return set(() => ({
      songEntryID: songValues.id ?? defaultState.songEntryID,
      songEntryIDError: defaultState.songEntryIDError,
      songname: songValues.songname ?? defaultState.songname,
      songnameError: defaultState.songnameError,
      songID: songValues.song_id?.toString() ?? defaultState.songID,
      songIDError: defaultState.songIDError,

      name: songValues.name ?? defaultState.name,
      artist: songValues.artist ?? defaultState.artist,
      master: songValues.master ?? defaultState.master,
      fake: songValues.fake ?? defaultState.fake,
      albumArt: songValues.album_art !== undefined ? songValues.album_art : defaultState.albumArt,
      songRating: songValues.rating ?? defaultState.songRating,
      genre: songValues.genre ?? defaultState.genre,
      subGenre: songValues.sub_genre ?? defaultState.subGenre,
      yearReleased: songValues.year_released ?? new Date().getFullYear(),
      yearReleasedEdit: defaultState.yearReleasedEdit,
      yearRecorded: songValues.year_recorded ?? null,
      yearRecordedEdit: defaultState.yearRecordedEdit,

      dropdownActivated: -1,
      enableDXGenre: songValues.customsource?.genre !== undefined,
      dxGenre: (songValues.customsource?.genre as EditSongScreenStateProps['genre'] | undefined) ?? 'rock',
      enableDXGameOrigin: songValues.customsource?.game_origin !== undefined,
      dxGameOrigin: songValues.customsource?.game_origin ?? 'ugc_plus',
      author: songValues.author ?? defaultState.author,
      loadingPhrase: songValues.loading_phrase ?? defaultState.loadingPhrase,
      multitrack: songValues.multitrack || defaultState.multitrack,
      rhythmPart: songValues.rhythmOn ?? defaultState.rhythmPart,
      reductionsStatus: songValues.emh ?? defaultState.reductionsStatus,
      unpitchedVocals: songValues.unpitchedVocals ?? defaultState.unpitchedVocals,
      convert: songValues.convert ?? defaultState.convert,
      doubleKick: songValues.doubleKick ?? defaultState.doubleKick,

      // name: songValues.name ?? '',
      // artist: songValues.artist ?? '',
      // master: songValues.master ?? false,
      // fake: songValues.fake ?? false,
      // songID: songValues.song_id ? (typeof songValues.song_id === 'number' ? songValues.song_id.toString() : songValues.song_id) : '',
      // songname: songValues.songname ?? '',
      // vocalParts: songValues.vocal_parts ?? 0,
      // muteVolume: songValues.mute_volume ?? -96,
      // muteVolumeVocals: songValues.mute_volume_vocals ?? -12,
      // hopoThreshold: songValues.hopo_threshold ?? 170,
      // songScrollSpeed: songValues.song_scroll_speed ?? 2300,
      // bank: songValues.bank ?? 'sfx/tambourine_bank.milo',
      // drumBank: songValues.drum_bank ?? 'sfx/kit01_bank.milo',
      // animTempo: songValues.anim_tempo ?? 32,
      // songLength: songValues.song_length ?? 1,
      // songRating: songValues.rating ?? 4,
      // tuningOffsetCents: songValues.tuning_offset_cents ?? 0,
      // guidePitchVolume: songValues.guide_pitch_volume ?? -3,
      // genre: songValues.genre ?? 'rock',
      // subGenre: songValues.sub_genre ?? 'subgenre_rock',
      // albumArt: songValues.album_art ?? true,
      // albumName: songValues.album_name ?? '',
      isEditingSong: true,
      hasUnsavedChanges: false,
    }))
  },
}))
