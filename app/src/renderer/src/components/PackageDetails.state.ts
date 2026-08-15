import { create } from 'zustand'
import { RSPackImagePackageCategoryValues, SongPackagesFilterGenericObject, SongPackagesFilterTypes } from 'rockshelf-core'
import type { DTAFilterGenericObject, DTAFilterByArtistObject, DTAFilterByDifficultyObject, DTAFilterTypes, RB3CompatibleDTAFile } from 'rockshelf-core/rbtools/lib'
import type { GoCentralLeaderboardResultObject } from 'rockshelf-core/rbtools'

export interface PackageDetailsStateProps {
  songs: RB3CompatibleDTAFile[] | false
  pkgIndex: number
  packageDetailsTab: number
  pkgDetailsDropdown: number
  songsCatalog: DTAFilterGenericObject | DTAFilterByArtistObject | DTAFilterByDifficultyObject | false | 'loading'
  editPackageName: string
  packageNameError: string | null
  hasPackageNameChanged: boolean
  editPackageFolderName: string
  packageFolderNameError: string | null
  hasPackageFolderNameChanged: boolean
  editPackageCategory: RSPackImagePackageCategoryValues
  hasPackageCategoryChanged: boolean
}

export interface PackageDetailsStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<PackageDetailsStateProps> | ((oldState: PackageDetailsStateProps) => Partial<PackageDetailsStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setPackageDetailsState(state: Partial<PackageDetailsStateProps> | ((oldState: PackageDetailsStateProps) => Partial<PackageDetailsStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {PackageDetailsStateProps}
   */
  getPackageDetailsState(): PackageDetailsStateProps
  /**
   * Resets the state to its default values.
   */
  resetPackageDetailsState(): void
}

export type PackageDetailsStateHook = PackageDetailsStateProps & PackageDetailsStateActions

const defaultState: PackageDetailsStateProps = {
  songs: false,
  pkgIndex: -1,
  packageDetailsTab: 0,
  pkgDetailsDropdown: -1,
  songsCatalog: false,
  editPackageName: '',
  packageNameError: null,
  hasPackageNameChanged: false,
  editPackageFolderName: '',
  packageFolderNameError: null,
  hasPackageFolderNameChanged: false,
  editPackageCategory: 'other',
  hasPackageCategoryChanged: false,
}

export const usePackageDetailsState = create<PackageDetailsStateHook>()((set, get) => ({
  ...defaultState,
  setPackageDetailsState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getPackageDetailsState() {
    const state = get()
    const map = new Map<keyof PackageDetailsStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof PackageDetailsStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof PackageDetailsStateProps, unknown> as PackageDetailsStateProps
  },
  resetPackageDetailsState() {
    return set(() => defaultState)
  },
}))
