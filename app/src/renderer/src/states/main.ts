import type { RPCS3InstalledGamesStats, ParsedRB3SaveData } from '@rockshelf/core'
import { create } from 'zustand'

export interface MainStateProps {
  isWinMaximized: boolean
  disableButtons: boolean
  disableTopBarButtons: boolean
  stats: RPCS3InstalledGamesStats | null
  saveData: ParsedRB3SaveData | null

  isHighMemoryPatchBeingInstalled: boolean
}

export interface MainStateActions {
  setMainState(state: Partial<MainStateProps> | ((oldState: MainStateProps) => Partial<MainStateProps>)): void
  getMainState(): MainStateProps
  resetMainState(): void
}

export type MainStateHook = MainStateProps & MainStateActions

const defaultState: MainStateProps = {
  isWinMaximized: false,
  disableButtons: true,
  disableTopBarButtons: true,
  stats: null,
  saveData: null,

  isHighMemoryPatchBeingInstalled: false,
}

export const useMainState = create<MainStateHook>()((set, get) => ({
  ...defaultState,
  setMainState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getMainState() {
    const state = get()
    const map = new Map<keyof MainStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof MainStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof MainStateProps, unknown> as MainStateProps
  },
  resetMainState() {
    return set(() => defaultState)
  },
}))
