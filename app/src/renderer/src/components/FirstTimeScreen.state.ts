import { create } from 'zustand'

export interface FirstTimeScreenStateProps {
  active: boolean
}

export interface FirstTimeScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<FirstTimeScreenStateProps> | ((oldState: FirstTimeScreenStateProps) => Partial<FirstTimeScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setFirstTimeScreenState(state: Partial<FirstTimeScreenStateProps> | ((oldState: FirstTimeScreenStateProps) => Partial<FirstTimeScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {FirstTimeScreenStateProps}
   */
  getFirstTimeScreenState(): FirstTimeScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetFirstTimeScreenState(): void
}

export type FirstTimeScreenStateHook = FirstTimeScreenStateProps & FirstTimeScreenStateActions

const defaultState: FirstTimeScreenStateProps = {
  active: false,
}

export const useFirstTimeScreenState = create<FirstTimeScreenStateHook>()((set, get) => ({
  ...defaultState,
  setFirstTimeScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getFirstTimeScreenState() {
    const state = get()
    const map = new Map<keyof FirstTimeScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof FirstTimeScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof FirstTimeScreenStateProps, unknown> as FirstTimeScreenStateProps
  },
  resetFirstTimeScreenState() {
    return set(() => defaultState)
  },
}))
