import { create } from 'zustand'

export interface LogoScreenStateProps {
  active: boolean
}

export interface LogoScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<LogoScreenStateProps> | ((oldState: LogoScreenStateProps) => Partial<LogoScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setLogoScreenState(state: Partial<LogoScreenStateProps> | ((oldState: LogoScreenStateProps) => Partial<LogoScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {LogoScreenStateProps}
   */
  getLogoScreenState(): LogoScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetLogoScreenState(): void
}

export type LogoScreenStateHook = LogoScreenStateProps & LogoScreenStateActions

const defaultState: LogoScreenStateProps = {
  active: true,
}

export const useLogoScreenState = create<LogoScreenStateHook>()((set, get) => ({
  ...defaultState,
  setLogoScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getLogoScreenState() {
    const state = get()
    const map = new Map<keyof LogoScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof LogoScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof LogoScreenStateProps, unknown> as LogoScreenStateProps
  },
  resetLogoScreenState() {
    return set(() => defaultState)
  },
}))
