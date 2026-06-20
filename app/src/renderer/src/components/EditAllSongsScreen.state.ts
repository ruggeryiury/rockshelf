import { AnimTempoNumbers, DrumBank, PartialDTAFile, PercussionBank, RB3CompatibleDTAFile, SongGenre, SongGenreDX, SongRating, SongSubGenre, SongSubGenreDX, VocalParts } from 'rockshelf-core/rbtools/lib'
import { create } from 'zustand'

export interface EditAllSongsScreenStateProps {
  selectedPackage: number
}

export interface EditAllSongsScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<EditAllSongsScreenStateProps> | ((oldState: EditAllSongsScreenStateProps) => Partial<EditAllSongsScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setEditAllSongsScreenState(state: Partial<EditAllSongsScreenStateProps> | ((oldState: EditAllSongsScreenStateProps) => Partial<EditAllSongsScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {EditAllSongsScreenStateProps}
   */
  getEditAllSongsScreenState(): EditAllSongsScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetEditAllSongsScreenState(): void
}

export type EditAllSongsScreenStateHook = EditAllSongsScreenStateProps & EditAllSongsScreenStateActions

const defaultState: EditAllSongsScreenStateProps = {
  selectedPackage: -1,
}

export const useEditAllSongsScreenState = create<EditAllSongsScreenStateHook>()((set, get) => ({
  ...defaultState,
  setEditAllSongsScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getEditAllSongsScreenState() {
    const state = get()
    const map = new Map<keyof EditAllSongsScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof EditAllSongsScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof EditAllSongsScreenStateProps, unknown> as EditAllSongsScreenStateProps
  },
  resetEditAllSongsScreenState() {
    return set(() => defaultState)
  },
}))
