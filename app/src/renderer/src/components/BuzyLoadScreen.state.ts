import type { BuzyLoadErrorObject, BuzyLoadInitObject } from 'rockshelf-core'
import { create } from 'zustand'

export interface BuzyLoadScreenStateProps {
  active: null | BuzyLoadInitObject
  step: number
  isCompleted: boolean
  hasError: null | BuzyLoadErrorObject
}

export interface BuzyLoadScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<BuzyLoadScreenStateProps> | ((oldState: BuzyLoadScreenStateProps) => Partial<BuzyLoadScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setBuzyLoadScreenState(state: Partial<BuzyLoadScreenStateProps> | ((oldState: BuzyLoadScreenStateProps) => Partial<BuzyLoadScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {BuzyLoadScreenStateProps}
   */
  getBuzyLoadScreenState(): BuzyLoadScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetBuzyLoadScreenState(): void
}

export type BuzyLoadScreenStateHook = BuzyLoadScreenStateProps & BuzyLoadScreenStateActions

const defaultState: BuzyLoadScreenStateProps = {
  active: null,
  step: 0,
  isCompleted: false,
  hasError: null,
}

export const useBuzyLoadScreenState = create<BuzyLoadScreenStateHook>()((set, get) => ({
  ...defaultState,
  setBuzyLoadScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getBuzyLoadScreenState() {
    const state = get()
    const map = new Map<keyof BuzyLoadScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof BuzyLoadScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof BuzyLoadScreenStateProps, unknown> as BuzyLoadScreenStateProps
  },
  resetBuzyLoadScreenState() {
    return set(() => defaultState)
  },
}))
