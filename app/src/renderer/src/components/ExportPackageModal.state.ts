import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface ExportPackageModalStateProps {
  selPKGToExport: number
  destPath: string | null
}

export interface ExportPackageModalStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<ExportPackageModalStateProps> | ((oldState: ExportPackageModalStateProps) => Partial<ExportPackageModalStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setExportPackageModalState(state: Partial<ExportPackageModalStateProps> | ((oldState: ExportPackageModalStateProps) => Partial<ExportPackageModalStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {ExportPackageModalStateProps}
   */
  getExportPackageModalState(): ExportPackageModalStateProps
  /**
   * Resets the state to its default values.
   */
  resetExportPackageModalState(): void
}

export type ExportPackageModalStateHook = ExportPackageModalStateProps & ExportPackageModalStateActions

const defaultState: ExportPackageModalStateProps = {
  selPKGToExport: -1,
  destPath: null,
}

export const useExportPackageModalState = create<ExportPackageModalStateHook>()(
  immer((set, get) => ({
    ...defaultState,
    setExportPackageModalState(state) {
      if (typeof state === 'function') return set((s) => state(s))
      return set(() => state)
    },
    getExportPackageModalState() {
      const state = get()
      const map = new Map<keyof ExportPackageModalStateProps, unknown>()
      for (const key of Object.keys(state)) {
        if (typeof state[key] === 'function') continue
        else map.set(key as keyof ExportPackageModalStateProps, state[key])
      }

      return Object.fromEntries(map.entries()) as Record<keyof ExportPackageModalStateProps, unknown> as ExportPackageModalStateProps
    },
    resetExportPackageModalState() {
      return set(() => defaultState)
    },
  }))
)
