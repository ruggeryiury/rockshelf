import type { ZustandStateSetterObject } from '@renderer/app/types'
import type { InstrumentScoreData, ParsedRB3SaveData } from 'rbtools'
import type { RockBand3Data } from 'rbtools/lib'
import { create } from 'zustand/react'

export interface CachedDataProps {
  rb3Stats: RockBand3Data | false | 'loading'
  saveData: ParsedRB3SaveData | false
  instrumentScores: InstrumentScoreData | false
}

export interface CachedDataActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {ZustandStateSetterObject<CachedDataProps>} state The new state values or a function that receives the old state and returns the new state values.
   */
  setCachedData(state: ZustandStateSetterObject<CachedDataProps>): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {CachedDataProps}
   */
  getCachedData(): CachedDataProps
  /**
   * Resets the state to its default values.
   */
  resetCachedData(): void
}

const defaultState: CachedDataProps = {
  rb3Stats: false,
  saveData: false,
  instrumentScores: false,
}

export const useCachedDataState = create<CachedDataProps & CachedDataActions>()((set, get) => ({
  ...defaultState,
  setCachedData(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getCachedData() {
    const state = get()
    const map = new Map<keyof CachedDataProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof CachedDataProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof CachedDataProps, unknown> as CachedDataProps
  },
  resetCachedData() {
    return set(() => defaultState)
  },
}))
