import type { RPCS3InstalledGamesStats, ParsedRB3SaveData, DetailedScoreDataObject } from '@rockshelf/core'
import { create } from 'zustand'

export interface WindowStateProps {
  programProcessingInitMS: number
  isWinMaximized: boolean
  disableButtons: boolean
  disableTopBarButtons: boolean

  // Modals
  isFirstTimeModalActivated: boolean
}

export interface WindowStateActions {
  setWindowState(state: Partial<WindowStateProps> | ((oldState: WindowStateProps) => Partial<WindowStateProps>)): void
  getWindowState(): WindowStateProps
  resetWindowState(): void
}

export type WindowStateHook = WindowStateProps & WindowStateActions

const defaultState: WindowStateProps = {
  programProcessingInitMS: 2000,
  isWinMaximized: false,
  disableButtons: true,
  disableTopBarButtons: false,

  // Modals
  isFirstTimeModalActivated: false,
}

export const useWindowState = create<WindowStateHook>()((set, get) => ({
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
