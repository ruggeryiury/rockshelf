import { create } from 'zustand'
import { RSPackImagePackageCategoryValues, SongPackagesFilterGenericObject, SongPackagesFilterTypes } from 'rockshelf-core'
import type { DTAFilterGenericObject, DTAFilterByArtistObject, DTAFilterByDifficultyObject, DTAFilterTypes, RB3CompatibleDTAFile } from 'rockshelf-core/rbtools/lib'
import type { GoCentralLeaderboardResultObject } from 'rockshelf-core/rbtools'

export interface SongDetailsStateProps {
  songIndex: number
  songDetailsTab: number
  isArtworkLoading: boolean
  artworkURL: string | null
  songLeaderboards: false | 'loading' | GoCentralLeaderboardResultObject
}

export interface SongDetailsStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<SongDetailsStateProps> | ((oldState: SongDetailsStateProps) => Partial<SongDetailsStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setSongDetailsState(state: Partial<SongDetailsStateProps> | ((oldState: SongDetailsStateProps) => Partial<SongDetailsStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {SongDetailsStateProps}
   */
  getSongDetailsState(): SongDetailsStateProps
  /**
   * Resets the state to its default values.
   */
  resetSongDetailsState(): void
}

export type SongDetailsStateHook = SongDetailsStateProps & SongDetailsStateActions

const defaultState: SongDetailsStateProps = {
  songIndex: -1,
  songDetailsTab: 0,
  isArtworkLoading: true,
  artworkURL: null,
  songLeaderboards: false,
}

export const useSongDetailsState = create<SongDetailsStateHook>()((set, get) => ({
  ...defaultState,
  setSongDetailsState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getSongDetailsState() {
    const state = get()
    const map = new Map<keyof SongDetailsStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof SongDetailsStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof SongDetailsStateProps, unknown> as SongDetailsStateProps
  },
  resetSongDetailsState() {
    return set(() => defaultState)
  },
}))
