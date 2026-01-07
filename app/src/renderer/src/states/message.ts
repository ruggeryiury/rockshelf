import { MessagePopUpOptions } from '@rockshelf/core'
import { create } from 'zustand'

export interface PopUpMessageStateProps {
  message: MessagePopUpOptions | null
}

export interface PopUpMessageStateActions {
  setPopUpMessageState(state: Partial<PopUpMessageStateProps> | ((oldState: PopUpMessageStateProps) => Partial<PopUpMessageStateProps>)): void
  getPopUpMessageState(): PopUpMessageStateProps
  resetPopUpMessageState(): void
}

export type PopUpMessageStateHook = PopUpMessageStateProps & PopUpMessageStateActions

const defaultState: PopUpMessageStateProps = {
  message: null,
}

export const usePopUpMessageState = create<PopUpMessageStateHook>()((set, get) => ({
  ...defaultState,
  setPopUpMessageState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getPopUpMessageState() {
    const state = get()
    const map = new Map<keyof PopUpMessageStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof PopUpMessageStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof PopUpMessageStateProps, unknown> as PopUpMessageStateProps
  },
  resetPopUpMessageState() {
    return set(() => defaultState)
  },
}))
