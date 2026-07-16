import { GitHubCommitCompare, GitHubCommitResponse } from '@renderer/app/types'
import { SelectPKGFileReturnObject } from 'rockshelf-core'
import { create } from 'zustand'

export interface DeluxeConfigScreenStateProps {
  active: boolean
  selectedTab: number
}

export interface DeluxeConfigScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<DeluxeConfigScreenStateProps> | ((oldState: DeluxeConfigScreenStateProps) => Partial<DeluxeConfigScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setDeluxeConfigScreenState(state: Partial<DeluxeConfigScreenStateProps> | ((oldState: DeluxeConfigScreenStateProps) => Partial<DeluxeConfigScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {DeluxeConfigScreenStateProps}
   */
  getDeluxeConfigScreenState(): DeluxeConfigScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetDeluxeConfigScreenState(): void
}

export type DeluxeConfigScreenStateHook = DeluxeConfigScreenStateProps & DeluxeConfigScreenStateActions

const defaultState: DeluxeConfigScreenStateProps = {
  active: false,
  selectedTab: 0,
}

export const useDeluxeConfigScreenState = create<DeluxeConfigScreenStateHook>()((set, get) => ({
  ...defaultState,
  setDeluxeConfigScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getDeluxeConfigScreenState() {
    const state = get()
    const map = new Map<keyof DeluxeConfigScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof DeluxeConfigScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof DeluxeConfigScreenStateProps, unknown> as DeluxeConfigScreenStateProps
  },
  resetDeluxeConfigScreenState() {
    return set(() => defaultState)
  },
}))
