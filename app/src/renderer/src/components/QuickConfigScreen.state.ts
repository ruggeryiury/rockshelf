import { create } from 'zustand'

export interface QuickConfigScreenStateProps {
  active: boolean
}

export interface QuickConfigScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<QuickConfigScreenStateProps> | ((oldState: QuickConfigScreenStateProps) => Partial<QuickConfigScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setQuickConfigScreenState(state: Partial<QuickConfigScreenStateProps> | ((oldState: QuickConfigScreenStateProps) => Partial<QuickConfigScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {QuickConfigScreenStateProps}
   */
  getQuickConfigScreenState(): QuickConfigScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetQuickConfigScreenState(): void
}

export type QuickConfigScreenStateHook = QuickConfigScreenStateProps & QuickConfigScreenStateActions

const defaultState: QuickConfigScreenStateProps = {
  active: false,
}

export const useQuickConfigScreenState = create<QuickConfigScreenStateHook>()((set, get) => ({
  ...defaultState,
  setQuickConfigScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getQuickConfigScreenState() {
    const state = get()
    const map = new Map<keyof QuickConfigScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof QuickConfigScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof QuickConfigScreenStateProps, unknown> as QuickConfigScreenStateProps
  },
  resetQuickConfigScreenState() {
    return set(() => defaultState)
  },
}))
