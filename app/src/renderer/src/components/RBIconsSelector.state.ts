import { create } from 'zustand'

export interface RBIconsSelectorStateProps {
  active: 'editPackage' | 'createNewPackage' | null
  selIcon: number
}

export interface RBIconsSelectorStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<RBIconsSelectorStateProps> | ((oldState: RBIconsSelectorStateProps) => Partial<RBIconsSelectorStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setRBIconsSelectorState(state: Partial<RBIconsSelectorStateProps> | ((oldState: RBIconsSelectorStateProps) => Partial<RBIconsSelectorStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {RBIconsSelectorStateProps}
   */
  getRBIconsSelectorState(): RBIconsSelectorStateProps
  /**
   * Resets the state to its default values.
   */
  resetRBIconsSelectorState(): void
}

export type RBIconsSelectorStateHook = RBIconsSelectorStateProps & RBIconsSelectorStateActions

const defaultState: RBIconsSelectorStateProps = {
  active: null,
  selIcon: -1,
}

export const useRBIconsSelectorState = create<RBIconsSelectorStateHook>()((set, get) => ({
  ...defaultState,
  setRBIconsSelectorState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getRBIconsSelectorState() {
    const state = get()
    const map = new Map<keyof RBIconsSelectorStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof RBIconsSelectorStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof RBIconsSelectorStateProps, unknown> as RBIconsSelectorStateProps
  },
  resetRBIconsSelectorState() {
    return set(() => defaultState)
  },
}))
