import type { GitHubCommitCompare, GitHubCommitResponse, ZustandStateSetterObject } from '@renderer/app/types'
import { SelectPKGFileReturnObject } from 'rockshelf-core'
import { create } from 'zustand/react'

export interface InstallPKGFileScreenProps {
  InstallPKGFileScreen: SelectPKGFileReturnObject | false
  commitInfo: GitHubCommitResponse | null
  aheadCommitInfo: GitHubCommitCompare | null
  isLoadingCommitInfo: boolean
  packageFolderName: string
  encryptPKGFiles: boolean
}

export interface InstallPKGFileScreenActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {ZustandStateSetterObject<InstallPKGFileScreenProps>} state The new state values or a function that receives the old state and returns the new state values.
   */
  setInstallPKGFileScreen(state: ZustandStateSetterObject<InstallPKGFileScreenProps>): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {InstallPKGFileScreenProps}
   */
  getInstallPKGFileScreen(): InstallPKGFileScreenProps
  /**
   * Resets the state to its default values.
   */
  resetInstallPKGFileScreen(): void
}

const defaultState: InstallPKGFileScreenProps = {
  InstallPKGFileScreen: false,
  commitInfo: null,
  aheadCommitInfo: null,
  isLoadingCommitInfo: true,
  packageFolderName: '',
  encryptPKGFiles: false,
}

export const useInstallPKGFileScreenState = create<InstallPKGFileScreenProps & InstallPKGFileScreenActions>()((set, get) => ({
  ...defaultState,
  setInstallPKGFileScreen(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getInstallPKGFileScreen() {
    const state = get()
    const map = new Map<keyof InstallPKGFileScreenProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof InstallPKGFileScreenProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof InstallPKGFileScreenProps, unknown> as InstallPKGFileScreenProps
  },
  resetInstallPKGFileScreen() {
    return set(() => defaultState)
  },
}))
