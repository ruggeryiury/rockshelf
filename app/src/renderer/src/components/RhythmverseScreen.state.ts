import { create } from 'zustand'
import type { PKGFileJSONRepresentation, ProcessedRhythmverseObject, STFSFileJSONRepresentation } from 'rockshelf-core/rbtools'

export interface RhythmverseScreenStateProps {
  active: boolean
  searchField: string
  lastSearchedField: string | null
  selectedTab: number
  searchResults: false | 'loading' | ProcessedRhythmverseObject

  source: 'rb3' | 'rb3xbox' | 'all' | 'rb3wii' | 'rb3ps3' | 'wtde' | 'tbrbxbox' | 'yarg' | 'rb2xbox' | 'ps' | 'chm' | 'gh3pc'
  sortBy: 'updateDate' | 'title' | 'artist' | 'length' | 'author' | 'releaseDate' | 'downloads'
  sortOrder: 'asc' | 'desc'
  page: number
  records: number
  fullBand: boolean
  multitrack: boolean
  pitchedVocals: boolean

  downloadedSongs: (PKGFileJSONRepresentation | STFSFileJSONRepresentation)[] | null
}

export interface RhythmverseScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<RhythmverseScreenStateProps> | ((oldState: RhythmverseScreenStateProps) => Partial<RhythmverseScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setRhythmverseScreenState(state: Partial<RhythmverseScreenStateProps> | ((oldState: RhythmverseScreenStateProps) => Partial<RhythmverseScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {RhythmverseScreenStateProps}
   */
  getRhythmverseScreenState(): RhythmverseScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetRhythmverseScreenState(): void
}

export type RhythmverseScreenStateHook = RhythmverseScreenStateProps & RhythmverseScreenStateActions

const defaultState: RhythmverseScreenStateProps = {
  active: false,
  searchField: '',
  lastSearchedField: null,
  selectedTab: 0,
  searchResults: false,

  source: 'rb3xbox',
  sortBy: 'updateDate',
  sortOrder: 'asc',
  page: 1,
  records: 4,
  fullBand: false,
  multitrack: false,
  pitchedVocals: true,

  downloadedSongs: null,
}

export const useRhythmverseScreenState = create<RhythmverseScreenStateHook>()((set, get) => ({
  ...defaultState,
  setRhythmverseScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getRhythmverseScreenState() {
    const state = get()
    const map = new Map<keyof RhythmverseScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof RhythmverseScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof RhythmverseScreenStateProps, unknown> as RhythmverseScreenStateProps
  },
  resetRhythmverseScreenState() {
    return set(() => defaultState)
  },
}))
