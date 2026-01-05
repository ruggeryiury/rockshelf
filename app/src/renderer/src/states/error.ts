import { MainErrorMessageObject } from '@rockshelf/core'
import { create } from 'zustand'

export interface ErrorStateProps {
  error: MainErrorMessageObject | null
}

export interface ErrorStateActions {
  setErrorState(state: Partial<ErrorStateProps> | ((oldState: ErrorStateProps) => Partial<ErrorStateProps>)): void
  getErrorState(): ErrorStateProps
  resetErrorState(): void
}

export type ErrorStateHook = ErrorStateProps & ErrorStateActions

const defaultState: ErrorStateProps = {
  error: null,
}

export const useErrorState = create<ErrorStateHook>()((set, get) => ({
  ...defaultState,
  setErrorState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getErrorState() {
    const state = get()
    const map = new Map<keyof ErrorStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof ErrorStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof ErrorStateProps, unknown> as ErrorStateProps
  },
  resetErrorState() {
    return set(() => defaultState)
  },
}))
