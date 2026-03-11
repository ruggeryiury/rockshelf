import type { ZustandStateSetterObject } from '@renderer/app/types'
import { create } from 'zustand/react'

export interface FirstTimeScreenProps {
  FirstTimeScreen: boolean
}

export interface FirstTimeScreenActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {ZustandStateSetterObject<FirstTimeScreenProps>} state The new state values or a function that receives the old state and returns the new state values.
   */
  setFirstTimeScreen(state: ZustandStateSetterObject<FirstTimeScreenProps>): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {FirstTimeScreenProps}
   */
  getFirstTimeScreen(): FirstTimeScreenProps
  /**
   * Resets the state to its default values.
   */
  resetFirstTimeScreen(): void
}

const defaultState: FirstTimeScreenProps = {
  FirstTimeScreen: false,
}

export const useFirstTimeScreenState = create<FirstTimeScreenProps & FirstTimeScreenActions>()((set, get) => ({
  ...defaultState,
  setFirstTimeScreen(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getFirstTimeScreen() {
    const state = get()
    const map = new Map<keyof FirstTimeScreenProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof FirstTimeScreenProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof FirstTimeScreenProps, unknown> as FirstTimeScreenProps
  },
  resetFirstTimeScreen() {
    return set(() => defaultState)
  },
}))
