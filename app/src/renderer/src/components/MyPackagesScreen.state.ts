import { create } from 'zustand'
import { SongPackagesFilterGenericObject, SongPackagesFilterTypes } from 'rockshelf-core'
import type { DTAFilterGenericObject, DTAFilterByArtistObject, DTAFilterByDifficultyObject, DTAFilterTypes } from 'rockshelf-core/rbtools/lib'
import type { GoCentralLeaderboardResultObject } from 'rockshelf-core/rbtools'

export interface MyPackagesScreenStateProps {
  active: boolean
  selPKG: number
  songsCatalog: DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject | false | 'loading'
  songsCatalogSortBy: DTAFilterTypes
  myPackagesTab: number
  packagesCatalog: SongPackagesFilterGenericObject | false | 'loading'
  packagesCatalogSortBy: SongPackagesFilterTypes
  packageDetailsTab: number
  songDetailsTab: number
  songLeaderboards: false | 'loading' | GoCentralLeaderboardResultObject
  hoveredPKG: number
  selSong: number
  isArtworkLoading: boolean
  artworkURL: string | null
  editPackageName: string
  editPackageEdited: boolean
}

export interface MyPackagesScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<MyPackagesScreenStateProps> | ((oldState: MyPackagesScreenStateProps) => Partial<MyPackagesScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setMyPackagesScreenState(state: Partial<MyPackagesScreenStateProps> | ((oldState: MyPackagesScreenStateProps) => Partial<MyPackagesScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {MyPackagesScreenStateProps}
   */
  getMyPackagesScreenState(): MyPackagesScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetMyPackagesScreenState(): void
}

export type MyPackagesScreenStateHook = MyPackagesScreenStateProps & MyPackagesScreenStateActions

const defaultState: MyPackagesScreenStateProps = {
  active: false,
  selPKG: -1,
  songsCatalog: false,
  songsCatalogSortBy: 'title',
  packagesCatalog: false,
  packagesCatalogSortBy: 'name',
  myPackagesTab: 0,
  packageDetailsTab: 0,
  songDetailsTab: 0,
  songLeaderboards: false,
  hoveredPKG: -1,
  selSong: -1,
  isArtworkLoading: true,
  artworkURL: null,
  editPackageName: '',
  editPackageEdited: false,
}

export const useMyPackagesScreenState = create<MyPackagesScreenStateHook>()((set, get) => ({
  ...defaultState,
  setMyPackagesScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getMyPackagesScreenState() {
    const state = get()
    const map = new Map<keyof MyPackagesScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof MyPackagesScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof MyPackagesScreenStateProps, unknown> as MyPackagesScreenStateProps
  },
  resetMyPackagesScreenState() {
    return set(() => defaultState)
  },
}))
