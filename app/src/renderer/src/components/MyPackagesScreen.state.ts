import { create } from 'zustand'
import { SongPackagesFilterGenericObject, SongPackagesFilterTypes } from 'rockshelf-core'
import type { DTAFilterGenericObject, DTAFilterByArtistObject, DTAFilterByDifficultyObject, DTAFilterTypes } from 'rockshelf-core/rbtools/lib'
import type { GoCentralLeaderboardResultObject } from 'rockshelf-core/rbtools'

export interface MyPackagesScreenStateProps {
  active: boolean
  myPackagesTab: number
  packagesCatalog: SongPackagesFilterGenericObject | false | 'loading'
  packageDescription: string | undefined | 1 // 1 = 'loading'

  selPKG: number
  packageDetailsTab: number
  hoveredPKG: number

  songsCatalog: DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject | false | 'loading'
  songDetailsTab: number
  songLeaderboards: false | 'loading' | GoCentralLeaderboardResultObject
  selSong: number
  isArtworkLoading: boolean
  artworkURL: string | null

  editPackageName: string
  packageNameError: string | null
  hasPackageNameChanged: boolean

  editPackageFolderName: string
  packageFolderNameError: string | null
  hasPackageFolderNameChanged: boolean
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
  myPackagesTab: 0,
  packagesCatalog: false,
  packageDescription: undefined,

  selPKG: -1,
  packageDetailsTab: 0,
  hoveredPKG: -1,

  songsCatalog: false,
  songDetailsTab: 0,
  songLeaderboards: false,
  selSong: -1,
  isArtworkLoading: true,
  artworkURL: null,

  editPackageName: '',
  packageNameError: null,
  hasPackageNameChanged: false,

  editPackageFolderName: '',
  packageFolderNameError: null,
  hasPackageFolderNameChanged: false,
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
