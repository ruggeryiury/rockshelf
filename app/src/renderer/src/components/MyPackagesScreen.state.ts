import { create } from 'zustand'
import { DatabaseSearchFnResults, SongPackagesFilterGenericObject } from 'rockshelf-core'

export interface MyPackagesScreenStateProps {
  active: boolean
  myPackagesTab: number
  packagesCatalog: SongPackagesFilterGenericObject | false | 'loading'
  packageDescription: string | false | 1 // 1 = 'loading'
  hoveredPKG: number
  searchField: string
  searchFieldError: string | null
  isFetchingSearch: boolean
  searchHeaders: DatabaseSearchFnResults | null
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
  packageDescription: false,
  hoveredPKG: -1,
  searchField: '',
  searchFieldError: null,
  isFetchingSearch: false,
  searchHeaders: null,
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
