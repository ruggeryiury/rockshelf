import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface MergePackageModalStateProps {
  selPKG: number
  index: number
  isPackageDropdownEnabled: boolean
}

export interface MergePackageModalStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<MergePackageModalStateProps> | ((oldState: MergePackageModalStateProps) => Partial<MergePackageModalStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setMergePackageModalState(state: Partial<MergePackageModalStateProps> | ((oldState: MergePackageModalStateProps) => Partial<MergePackageModalStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {MergePackageModalStateProps}
   */
  getMergePackageModalState(): MergePackageModalStateProps
  /**
   * Resets the state to its default values.
   */
  resetMergePackageModalState(): void
}

export type MergePackageModalStateHook = MergePackageModalStateProps & MergePackageModalStateActions

const defaultState: MergePackageModalStateProps = {
  selPKG: -1,
  index: -1,
  isPackageDropdownEnabled: false,
}

export const useMergePackageModalState = create<MergePackageModalStateHook>()(
  immer((set, get) => ({
    ...defaultState,
    setMergePackageModalState(state) {
      if (typeof state === 'function') return set((s) => state(s))
      return set(() => state)
    },
    getMergePackageModalState() {
      const state = get()
      const map = new Map<keyof MergePackageModalStateProps, unknown>()
      for (const key of Object.keys(state)) {
        if (typeof state[key] === 'function') continue
        else map.set(key as keyof MergePackageModalStateProps, state[key])
      }

      return Object.fromEntries(map.entries()) as Record<keyof MergePackageModalStateProps, unknown> as MergePackageModalStateProps
    },
    resetMergePackageModalState() {
      return set(() => defaultState)
    },
  }))
)
