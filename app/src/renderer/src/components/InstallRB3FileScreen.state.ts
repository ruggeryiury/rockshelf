import { create } from 'zustand'
import { type RB3FileJSONRepresentation } from 'rockshelf-core'

export interface InstallRB3FileScreenStateProps {
  selectedRB3File: null | RB3FileJSONRepresentation
  installRB3FileTab: number
  packageName: string
  packageNameError: string | null
  packageFolderName: string
  packageFolderNameError: string | null
  selectedSongs: string[]
}

export interface InstallRB3FileScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<InstallRB3FileScreenStateProps> | ((oldState: InstallRB3FileScreenStateProps) => Partial<InstallRB3FileScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setInstallRB3FileScreenState(state: Partial<InstallRB3FileScreenStateProps> | ((oldState: InstallRB3FileScreenStateProps) => Partial<InstallRB3FileScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {InstallRB3FileScreenStateProps}
   */
  getInstallRB3FileScreenState(): InstallRB3FileScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetInstallRB3FileScreenState(): void
}

export type InstallRB3FileScreenStateHook = InstallRB3FileScreenStateProps & InstallRB3FileScreenStateActions

const defaultState: InstallRB3FileScreenStateProps = {
  selectedRB3File: null,
  installRB3FileTab: 0,
  packageName: '',
  packageNameError: null,
  packageFolderName: '',
  packageFolderNameError: null,
  selectedSongs: [],
}

export const useInstallRB3FileScreenState = create<InstallRB3FileScreenStateHook>()((set, get) => ({
  ...defaultState,
  setInstallRB3FileScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getInstallRB3FileScreenState() {
    const state = get()
    const map = new Map<keyof InstallRB3FileScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof InstallRB3FileScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof InstallRB3FileScreenStateProps, unknown> as InstallRB3FileScreenStateProps
  },
  resetInstallRB3FileScreenState() {
    return set(() => defaultState)
  },
}))
