import { SelectPKGFileReturnObject } from 'rockshelf-core/lib'
import { create } from 'zustand'

export interface RendererStateProps {
  // Screens
  IntroScreen: boolean

  // Modals
  WelcomeModal: boolean
  QuickConfigurationModal: boolean
  InstallPKGConfirmationModal: false | SelectPKGFileReturnObject
}

export interface RendererStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<RendererStateProps> | ((oldState: RendererStateProps) => Partial<RendererStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setRendererState(state: Partial<RendererStateProps> | ((oldState: RendererStateProps) => Partial<RendererStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {RendererStateProps}
   */
  getRendererState(): RendererStateProps
  /**
   * Resets the state to its default values.
   */
  resetRendererState(): void
}

export type RendererStateHook = RendererStateProps & RendererStateActions

const defaultState: RendererStateProps = {
  IntroScreen: true,
  WelcomeModal: false,
  QuickConfigurationModal: false,
  InstallPKGConfirmationModal: false,
}

export const useRendererState = create<RendererStateHook>()((set, get) => ({
  ...defaultState,
  setRendererState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getRendererState() {
    const state = get()
    const map = new Map<keyof RendererStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof RendererStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof RendererStateProps, unknown> as RendererStateProps
  },
  resetRendererState() {
    return set(() => defaultState)
  },
}))
