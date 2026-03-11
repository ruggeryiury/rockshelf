import type { ZustandStateSetterObject } from '@renderer/app/types'
import { RendererMessageObject } from 'rockshelf-core'
import { create } from 'zustand/react'

export interface MessageModalScreenProps {
  msgObject: RendererMessageObject | null
}

export interface MessageModalScreenActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {ZustandStateSetterObject<MessageModalScreenProps>} state The new state values or a function that receives the old state and returns the new state values.
   */
  setMessageModalScreen(state: ZustandStateSetterObject<MessageModalScreenProps>): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {MessageModalScreenProps}
   */
  getMessageModalScreen(): MessageModalScreenProps
  /**
   * Resets the state to its default values.
   */
  resetMessageModalScreen(): void
}

const defaultState: MessageModalScreenProps = {
  msgObject: null,
}

export const useMessageModalScreenState = create<MessageModalScreenProps & MessageModalScreenActions>()((set, get) => ({
  ...defaultState,
  setMessageModalScreen(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getMessageModalScreen() {
    const state = get()
    const map = new Map<keyof MessageModalScreenProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof MessageModalScreenProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof MessageModalScreenProps, unknown> as MessageModalScreenProps
  },
  resetMessageModalScreen() {
    return set(() => defaultState)
  },
}))
