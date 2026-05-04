import { create } from 'zustand'
import type { ProcessedRhythmverseObject } from 'rockshelf-core/rbtools'

export interface RhythmverseScreenStateProps {
  active: boolean
  searchField: string
  selectedTab: number
  searchResults: false | 'loading' | ProcessedRhythmverseObject

  fullBand: boolean
  multitrack: boolean
  pitchedVocals: boolean
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
  selectedTab: 0,
  searchResults: false,

  fullBand: true,
  multitrack: false,
  pitchedVocals: true,
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
