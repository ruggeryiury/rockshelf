import { UserConfigObj } from 'rockshelf-core/lib'
import { create } from 'zustand'

export interface UserConfigStateProps extends UserConfigObj {}

export interface UserConfigStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<UserConfigStateProps> | ((oldState: UserConfigStateProps) => Partial<UserConfigStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setUserConfigState(state: Partial<UserConfigStateProps> | ((oldState: UserConfigStateProps) => Partial<UserConfigStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {UserConfigStateProps}
   */
  getUserConfigState(): UserConfigStateProps
  /**
   * Resets the state to its default values.
   */
  resetUserConfigState(): void
}

export type UserConfigStateHook = UserConfigStateProps & UserConfigStateActions

const defaultState: UserConfigStateProps = {
  devhdd0Path: '',
  rpcs3ExePath: '',
  mostPlayedDifficulty: 3,
  mostPlayedInstrument: 'band',
}

export const useUserConfigState = create<UserConfigStateHook>()((set, get) => ({
  ...defaultState,
  setUserConfigState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getUserConfigState() {
    const state = get()
    const map = new Map<keyof UserConfigStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof UserConfigStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof UserConfigStateProps, unknown> as UserConfigStateProps
  },
  resetUserConfigState() {
    return set(() => defaultState)
  },
}))
