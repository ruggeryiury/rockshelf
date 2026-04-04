import { SelectPKGFileReturnObject } from 'rockshelf-core'
import { create } from 'zustand'

export interface InstallPKGScreenStateProps {
  selectedPKG: null | SelectPKGFileReturnObject
  packageFolderName: string
  packageFolderNameError: null | 'reserved'
  thumbnailPath: string
}

export interface InstallPKGScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<InstallPKGScreenStateProps> | ((oldState: InstallPKGScreenStateProps) => Partial<InstallPKGScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setInstallPKGScreenState(state: Partial<InstallPKGScreenStateProps> | ((oldState: InstallPKGScreenStateProps) => Partial<InstallPKGScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {InstallPKGScreenStateProps}
   */
  getInstallPKGScreenState(): InstallPKGScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetInstallPKGScreenState(): void
}

export type InstallPKGScreenStateHook = InstallPKGScreenStateProps & InstallPKGScreenStateActions

const defaultState: InstallPKGScreenStateProps = {
  selectedPKG: null,
  packageFolderName: '',
  packageFolderNameError: null,
  thumbnailPath: '',
}

export const useInstallPKGScreenState = create<InstallPKGScreenStateHook>()((set, get) => ({
  ...defaultState,
  setInstallPKGScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getInstallPKGScreenState() {
    const state = get()
    const map = new Map<keyof InstallPKGScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof InstallPKGScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof InstallPKGScreenStateProps, unknown> as InstallPKGScreenStateProps
  },
  resetInstallPKGScreenState() {
    return set(() => defaultState)
  },
}))
