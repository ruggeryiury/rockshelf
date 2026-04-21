import type { CropImageCoordinatesObject } from 'rockshelf-core'
import { create } from 'zustand'

export interface ImageCropScreenStateProps {
  func: 'packageDetails' | 'createNewPackage' | null
  imgPath: string | null
  imgDataURL: string | null
  imgCropOptions: CropImageCoordinatesObject | null
}

export interface ImageCropScreenStateActions {
  /**
   * Sets new values to the state.
   * - - - -
   * @param {Partial<ImageCropScreenStateProps> | ((oldState: ImageCropScreenStateProps) => Partial<ImageCropScreenStateProps>)} state The new state values or a function that receives the old state and returns the new state values.
   */
  setImageCropScreenState(state: Partial<ImageCropScreenStateProps> | ((oldState: ImageCropScreenStateProps) => Partial<ImageCropScreenStateProps>)): void
  /**
   * Retrieves the values of the entire state, excluding its own functions.
   * - - - -
   * @returns {ImageCropScreenStateProps}
   */
  getImageCropScreenState(): ImageCropScreenStateProps
  /**
   * Resets the state to its default values.
   */
  resetImageCropScreenState(): void
}

export type ImageCropScreenStateHook = ImageCropScreenStateProps & ImageCropScreenStateActions

const defaultState: ImageCropScreenStateProps = {
  func: null,
  imgPath: null,
  imgDataURL: null,
  imgCropOptions: null,
}

export const useImageCropScreenState = create<ImageCropScreenStateHook>()((set, get) => ({
  ...defaultState,
  setImageCropScreenState(state) {
    if (typeof state === 'function') return set((s) => state(s))
    return set(() => state)
  },
  getImageCropScreenState() {
    const state = get()
    const map = new Map<keyof ImageCropScreenStateProps, unknown>()
    for (const key of Object.keys(state)) {
      if (typeof state[key] === 'function') continue
      else map.set(key as keyof ImageCropScreenStateProps, state[key])
    }

    return Object.fromEntries(map.entries()) as Record<keyof ImageCropScreenStateProps, unknown> as ImageCropScreenStateProps
  },
  resetImageCropScreenState() {
    return set(() => defaultState)
  },
}))
