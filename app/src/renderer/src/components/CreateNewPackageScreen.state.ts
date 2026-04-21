import { RPCS3ExtractionOptions } from 'rbtools/lib'
import { SelectPackageFilesStatsTypes } from 'rockshelf-core'
import { create } from 'zustand'

export interface CreateNewPackageScreenStateProps {
  active: boolean
  navIndex: number
  files: SelectPackageFilesStatsTypes[]
  addedSongsCount: number
  addedStarsCount: number
  hoveredFile: number
  packageName: string
  packageFolderName: string
  forceEncryption: NonNullable<RPCS3ExtractionOptions['forceEncryption']>
  packageArtwork: string | null
}

export interface CreateNewPackageScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<CreateNewPackageScreenStateProps> | ((oldState: CreateNewPackageScreenStateProps) => Partial<CreateNewPackageScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setCreateNewPackageScreenState(state: Partial<CreateNewPackageScreenStateProps> | ((oldState: CreateNewPackageScreenStateProps) => Partial<CreateNewPackageScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {CreateNewPackageScreenStateProps}
   */
  getCreateNewPackageScreenState(): CreateNewPackageScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetCreateNewPackageScreenState(): void
}

export type CreateNewPackageScreenStateHook = CreateNewPackageScreenStateProps & CreateNewPackageScreenStateActions

const defaultState: CreateNewPackageScreenStateProps = {
  active: false,
  navIndex: 0,
  files: [],
  addedSongsCount: 0,
  addedStarsCount: 0,
  hoveredFile: -1,
  packageName: '',
  packageFolderName: '',
  forceEncryption: 'disabled',
  packageArtwork: null,
}

export const useCreateNewPackageScreenState = create<CreateNewPackageScreenStateHook>()((set, get) => ({
  ...defaultState,
  setCreateNewPackageScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getCreateNewPackageScreenState() {
    const state = get()
    const map = new Map<keyof CreateNewPackageScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof CreateNewPackageScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof CreateNewPackageScreenStateProps, unknown> as CreateNewPackageScreenStateProps
  },
  resetCreateNewPackageScreenState() {
    return set(() => defaultState)
  },
}))
