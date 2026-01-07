import { create } from 'zustand'

export interface IntroScreenStateProps {
  introStateIndex: number
  introDevhdd0Path: string
  introRPCS3ExePath: string
  isDevhdd0PathButtonDisabled: boolean
  isRPCS3ExePathButtonDisabled: boolean
}

export interface IntroScreenStateActions {
  setIntroScreenState(state: Partial<IntroScreenStateProps> | ((oldState: IntroScreenStateProps) => Partial<IntroScreenStateProps>)): void
  getIntroScreenState(): IntroScreenStateProps
  resetIntroScreenState(): void
}

export type IntroScreenStateHook = IntroScreenStateProps & IntroScreenStateActions

const defaultState: IntroScreenStateProps = {
  introStateIndex: 0,
  introDevhdd0Path: '',
  introRPCS3ExePath: '',
  isDevhdd0PathButtonDisabled: false,
  isRPCS3ExePathButtonDisabled: false,
}

export const useIntroScreenState = create<IntroScreenStateHook>()((set, get) => ({
  ...defaultState,
  setIntroScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getIntroScreenState() {
    const state = get()
    const map = new Map<keyof IntroScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof IntroScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof IntroScreenStateProps, unknown> as IntroScreenStateProps
  },
  resetIntroScreenState() {
    return set(() => defaultState)
  },
}))
