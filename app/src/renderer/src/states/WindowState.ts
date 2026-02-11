import { InstrumentScoreData, ParsedRB3SaveData } from 'rbtools'
import { RB3PackagesData, RendererMessageObject, RockBand3Data, SelectPKGFileReturnObject } from 'rockshelf-core/lib'
import { create } from 'zustand'

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
  disableTopBarButtons: boolean
  /**
   * An object that controls the msgObject rendering.
   */
  msgObject: RendererMessageObject | false
  /**
   * Controls the tabs of the `MainScreen` component.
   */
  mainWindowSelectionIndex: number
  /**
   * Stats from Rock Band 3.
   */
  rb3Stats: RockBand3Data | false | 'loading'
  saveData: ParsedRB3SaveData | false
  packages: RB3PackagesData | false
  instrumentScoresData: InstrumentScoreData | false
  /**
   * Information of the selected PKG file to install, controls the rendering of the `InstallPKGConfirmationModal` component
   */
  selectedPKGFile: SelectPKGFileReturnObject | false
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
  disableTopBarButtons: false,
  msgObject: false,
  mainWindowSelectionIndex: 0,
  rb3Stats: 'loading',
  saveData: false,
  packages: false,
  instrumentScoresData: false,
  selectedPKGFile: false,
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
