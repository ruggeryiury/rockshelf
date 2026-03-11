import type { ZustandStateSetterObject } from '@renderer/app/types'
import { create } from 'zustand/react'

export interface ConfigScreenProps {
  ConfigScreen: boolean
}

export interface ConfigScreenActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {ZustandStateSetterObject<ConfigScreenProps>} state The new state values or a function that receives the old state and returns the new state values.
   */
  setConfigScreen(state: ZustandStateSetterObject<ConfigScreenProps>): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {ConfigScreenProps}
   */
  getConfigScreen(): ConfigScreenProps
  /**
   * Resets the state to its default values.
   */
  resetConfigScreen(): void
}

const defaultState: ConfigScreenProps = {
  ConfigScreen: false,
}

export const useConfigScreenState = create<ConfigScreenProps & ConfigScreenActions>()((set, get) => ({
  ...defaultState,
  setConfigScreen(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getConfigScreen() {
    const state = get()
    const map = new Map<keyof ConfigScreenProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof ConfigScreenProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof ConfigScreenProps, unknown> as ConfigScreenProps
  },
  resetConfigScreen() {
    return set(() => defaultState)
  },
}))
