import { create } from 'zustand'

export interface AboutScreenStateProps {
  active: boolean
}

export interface AboutScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<AboutScreenStateProps> | ((oldState: AboutScreenStateProps) => Partial<AboutScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setAboutScreenState(state: Partial<AboutScreenStateProps> | ((oldState: AboutScreenStateProps) => Partial<AboutScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {AboutScreenStateProps}
   */
  getAboutScreenState(): AboutScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetAboutScreenState(): void
}

export type AboutScreenStateHook = AboutScreenStateProps & AboutScreenStateActions

const defaultState: AboutScreenStateProps = {
  active: false,
}

export const useAboutScreenState = create<AboutScreenStateHook>()((set, get) => ({
  ...defaultState,
  setAboutScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getAboutScreenState() {
    const state = get()
    const map = new Map<keyof AboutScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof AboutScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof AboutScreenStateProps, unknown> as AboutScreenStateProps
  },
  resetAboutScreenState() {
    return set(() => defaultState)
  },
}))
