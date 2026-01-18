import { create } from 'zustand'

export interface WindowStateProps {
  isWinMaximized: boolean
  disableButtons: boolean
  disableTopBarButtons: boolean

  // Core: IntroScreen.tsx
  isIntroScreenActivated: boolean

  // Modals: FirstTimeModal.tsx
  isFirstTimeModalActivated: boolean
}

export interface WindowStateActions {
  setWindowState(state: Partial<WindowStateProps> | ((oldState: WindowStateProps) => Partial<WindowStateProps>)): void
  getWindowState(): WindowStateProps
  resetWindowState(): void
}

export type WindowStateHook = WindowStateProps & WindowStateActions

const defaultState: WindowStateProps = {
  isWinMaximized: false,
  disableButtons: true,
  disableTopBarButtons: false,

  // Core: IntroScreen.tsx
  isIntroScreenActivated: true,

  // Modals: FirstTimeModal.tsx
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
