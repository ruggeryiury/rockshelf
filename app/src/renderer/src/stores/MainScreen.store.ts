import type { ZustandStateSetterObject } from '@renderer/app/types'
import { create } from 'zustand/react'

export interface MainScreenProps {
  MainScreen: boolean
  selectedNavigatorIndex: number
}

export interface MainScreenActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {ZustandStateSetterObject<MainScreenProps>} state The new state values or a function that receives the old state and returns the new state values.
   */
  setMainScreen(state: ZustandStateSetterObject<MainScreenProps>): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {MainScreenProps}
   */
  getMainScreen(): MainScreenProps
  /**
   * Resets the state to its default values.
   */
  resetMainScreen(): void
}

const defaultState: MainScreenProps = {
  MainScreen: true,
  selectedNavigatorIndex: 0
}

export const useMainScreenState = create<MainScreenProps & MainScreenActions>()((set, get) => ({
  ...defaultState,
  setMainScreen(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getMainScreen() {
    const state = get()
    const map = new Map<keyof MainScreenProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof MainScreenProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof MainScreenProps, unknown> as MainScreenProps
  },
  resetMainScreen() {
    return set(() => defaultState)
  },
}))
