import { GitHubCommitCompare, GitHubCommitResponse } from '@renderer/app/types'
import { SelectPKGFileReturnObject } from 'rockshelf-core'
import { create } from 'zustand'

export interface DeluxeInstallScreenStateProps {
  active: boolean
  selectedPKG: SelectPKGFileReturnObject | null | 'loading'
  commitData: GitHubCommitResponse | null | 'loading'
  aheadCommitData: GitHubCommitCompare | null | 'loading'
}

export interface DeluxeInstallScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<DeluxeInstallScreenStateProps> | ((oldState: DeluxeInstallScreenStateProps) => Partial<DeluxeInstallScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setDeluxeInstallScreenState(state: Partial<DeluxeInstallScreenStateProps> | ((oldState: DeluxeInstallScreenStateProps) => Partial<DeluxeInstallScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {DeluxeInstallScreenStateProps}
   */
  getDeluxeInstallScreenState(): DeluxeInstallScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetDeluxeInstallScreenState(): void
}

export type DeluxeInstallScreenStateHook = DeluxeInstallScreenStateProps & DeluxeInstallScreenStateActions

const defaultState: DeluxeInstallScreenStateProps = {
  active: false,
  selectedPKG: null,
  commitData: null,
  aheadCommitData: null,
}

export const useDeluxeInstallScreenState = create<DeluxeInstallScreenStateHook>()((set, get) => ({
  ...defaultState,
  setDeluxeInstallScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getDeluxeInstallScreenState() {
    const state = get()
    const map = new Map<keyof DeluxeInstallScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof DeluxeInstallScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof DeluxeInstallScreenStateProps, unknown> as DeluxeInstallScreenStateProps
  },
  resetDeluxeInstallScreenState() {
    return set(() => defaultState)
  },
}))
