import type { ZustandStateSetterObject } from '@renderer/app/types'
import { create } from 'zustand/react'

export interface InitScreenProps {
  InitScreen: boolean
  isLoadingTextActivated: boolean
  loadingTextKey: string
}

export interface InitScreenActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {ZustandStateSetterObject<InitScreenProps>} state The new state values or a function that receives the old state and returns the new state values.
   */
  setInitScreen(state: ZustandStateSetterObject<InitScreenProps>): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {InitScreenProps}
   */
  getInitScreen(): InitScreenProps
  /**
   * Resets the state to its default values.
   */
  resetInitScreen(): void
}

const defaultState: InitScreenProps = {
  InitScreen: true,
  isLoadingTextActivated: false,
  loadingTextKey: 'introText1',
}

export const useInitScreenState = create<InitScreenProps & InitScreenActions>()((set, get) => ({
  ...defaultState,
  setInitScreen(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getInitScreen() {
    const state = get()
    const map = new Map<keyof InitScreenProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof InitScreenProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof InitScreenProps, unknown> as InitScreenProps
  },
  resetInitScreen() {
    return set(() => defaultState)
  },
}))
