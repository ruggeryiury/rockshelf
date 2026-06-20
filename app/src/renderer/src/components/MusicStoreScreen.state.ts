import { create } from 'zustand'

export interface MusicStoreScreenStateProps {
  active: boolean
}

export interface MusicStoreScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<MusicStoreScreenStateProps> | ((oldState: MusicStoreScreenStateProps) => Partial<MusicStoreScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setMusicStoreScreenState(state: Partial<MusicStoreScreenStateProps> | ((oldState: MusicStoreScreenStateProps) => Partial<MusicStoreScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {MusicStoreScreenStateProps}
   */
  getMusicStoreScreenState(): MusicStoreScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetMusicStoreScreenState(): void
}

export type MusicStoreScreenStateHook = MusicStoreScreenStateProps & MusicStoreScreenStateActions

const defaultState: MusicStoreScreenStateProps = {
  active: false,
}

export const useMusicStoreScreenState = create<MusicStoreScreenStateHook>()((set, get) => ({
  ...defaultState,
  setMusicStoreScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getMusicStoreScreenState() {
    const state = get()
    const map = new Map<keyof MusicStoreScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof MusicStoreScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof MusicStoreScreenStateProps, unknown> as MusicStoreScreenStateProps
  },
  resetMusicStoreScreenState() {
    return set(() => defaultState)
  },
}))
