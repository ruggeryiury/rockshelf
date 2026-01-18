import { create } from 'zustand'

export interface ConfigStateProps {
  devhdd0Path: string
  rpcs3ExePath: string
}

export interface ConfigStateActions {
  setConfigState(state: Partial<ConfigStateProps> | ((oldState: ConfigStateProps) => Partial<ConfigStateProps>)): void
  getConfigState(): ConfigStateProps
  resetConfigState(): void
}

export type ConfigStateHook = ConfigStateProps & ConfigStateActions

const defaultState: ConfigStateProps = {
  devhdd0Path: '',
  rpcs3ExePath: '',
}

export const useConfigState = create<ConfigStateHook>()((set, get) => ({
  ...defaultState,
  setConfigState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getConfigState() {
    const state = get()
    const map = new Map<keyof ConfigStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof ConfigStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof ConfigStateProps, unknown> as ConfigStateProps
  },
  resetConfigState() {
    return set(() => defaultState)
  },
}))
