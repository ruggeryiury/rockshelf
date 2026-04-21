import { GitHubCommitCompare, GitHubCommitResponse } from '@renderer/app/types'
import { ParsedRB3SaveData, InstrumentScoreData } from 'rbtools'
import { RockBand3Data } from 'rbtools/lib'
import { RPCS3SongPackagesDataExtra } from 'rockshelf-core'
import { create, StoreApi, UseBoundStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface WindowStateProps {
  /**
   * Indicates whether the window is maximized.
   */
  isWinMaximized: boolean
  /**
   * Indicates whether the window buttons are disabled.
   */
  disableButtons: boolean
  /**
   * Indicates whether the top bar buttons are disabled.
   */
  disableTopbarButtons: boolean
  disableImg: number
  err: Error | null
  rb3Stats: false | RockBand3Data | 'loading'
  saveData: false | ParsedRB3SaveData | 'loading'
  instrumentScores: false | InstrumentScoreData | 'loading'
  packages: false | RPCS3SongPackagesDataExtra | 'loading'
  commitData: GitHubCommitResponse | null | 'loading'
  aheadCommitData: GitHubCommitCompare | null | 'loading'
  richPresence: boolean
}

export interface WindowStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<WindowStateProps> | ((oldState: WindowStateProps) => Partial<WindowStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setWindowState(state: Partial<WindowStateProps> | ((oldState: WindowStateProps) => Partial<WindowStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {WindowStateProps}
   */
  getWindowState(): WindowStateProps
  /**
   * Resets the state to its default values.
   */
  resetWindowState(): void
}

export type WindowStateHook = WindowStateProps & WindowStateActions

const defaultState: WindowStateProps = {
  isWinMaximized: false,
  disableButtons: true,
  disableTopbarButtons: false,
  disableImg: -1,
  err: null,
  rb3Stats: false,
  instrumentScores: false,
  saveData: false,
  packages: false,
  commitData: null,
  aheadCommitData: null,
  richPresence: false,
}

export const useWindowState: UseBoundStore<StoreApi<WindowStateHook>> = create<WindowStateHook>()(
  immer((set, get) => ({
    ...defaultState,
    setWindowState(state) {
      if (typeof state === 'function') return set((s) => state(s))
      return set(() => state)
    },
    getWindowState() {
      const state = get()
      const map = new Map<keyof WindowStateProps, unknown>()
      for (const key of Object.keys(state)) {
        if (typeof state[key] === 'function') continue
        else map.set(key as keyof WindowStateProps, state[key])
      }

      return Object.fromEntries(map.entries()) as Record<keyof WindowStateProps, unknown> as WindowStateProps
    },
    resetWindowState() {
      return set(() => defaultState)
    },
  }))
)
