import type { MotionNodeAnimationOptions } from 'motion/react'

export interface FramerMotionAnimationGeneratorOptions {
  /**
   * Delay before the animation starts (in seconds).
   */
  delay?: number
  /**
   * Duration of the animation (in seconds).
   */
  duration?: number
  /**
   * Animate height from 0 to auto and back to 0 on exit.
   */
  height?: boolean
  /**
   * Initialize height at auto, animate to auto, and exit to 0.
   */
  heightInit?: boolean
  /**
   * Animate left from -100% to 0 and back to -100% on exit
   */
  left?: boolean
  /**
   * Initialize left at 0, animate to 0, and exit to -100%
   */
  leftInit?: boolean
  /**
   * Animate opacity from 0 to 1 and back to 0 on exit.
   */
  opacity?: boolean
  /**
   * Initialize opacity at 1, animate to 1, and exit to 0.
   */
  opacityInit?: boolean
  /**
   * Animate right from -100% to 0 and back to -100% on exit.
   */
  right?: boolean
  /**
   * Initialize right at 0, animate to 0, and exit to -100%
   */
  rightInit?: boolean
  /**
   * Animate scaleX from 0% to 100% and back to 0% on exit.
   */
  scaleX?: boolean
  /**
   * Initialize scaleX at 100%, animate to 100%, and exit to 0%.
   */
  scaleXInit?: boolean
  /**
   * Animate scaleY from 0% to 100% and back to 0% on exit.
   */
  scaleY?: boolean
  /**
   * Initialize scaleY at 100%, animate to 100%, and exit to 0%.
   */
  scaleYInit?: boolean
  /**
   * Animate width from 0 to auto and back to 0 on exit.
   */
  width?: boolean
  /**
   * Initialize width at auto, animate to auto, and exit to 0.
   */
  widthInit?: boolean
  /**
   * Animate top from -100% to 0 and back to -100% on exit.
   */
  top?: boolean
  /**
   * Initialize top at 0, animate to 0, and exit to -100%
   */
  topInit?: boolean
  /**
   * Animate bottom from -100% to 0 and back to -100% on exit.
   */
  bottom?: boolean
  /**
   * Initialize bottom at 0, animate to 0, and exit to -100%
   */
  bottomInit?: boolean
}

export interface AnimationGeneratorReturnObject {
  /**
   * Initial animation state.
   */
  initial: MotionNodeAnimationOptions['initial']
  /**
   * Animate to this state.
   */
  animate: MotionNodeAnimationOptions['animate']
  /**
   * Exit animation state.
   */
  exit: MotionNodeAnimationOptions['exit']
  /**
   * Animation transition settings.
   */
  transition?: MotionNodeAnimationOptions['transition']
}

/**
 * Quickly generates animation configurations for `motion` package.
 * - - - -
 * @param {FramerMotionAnimationGeneratorOptions} animations An object flagging the animations you want to be activated.
 * @returns {AnimationGeneratorReturnObject}
 */
export const genAnim = (animations: FramerMotionAnimationGeneratorOptions): AnimationGeneratorReturnObject => {
  const { delay, duration, height, heightInit, left, leftInit, opacity, opacityInit, scaleX, scaleXInit, scaleY, scaleYInit, width, widthInit, right, rightInit, bottom, bottomInit, top, topInit } = animations
  const initial = new Map()
  const animate = new Map()
  const exit = new Map()
  const transition = new Map()

  if (height) {
    initial.set('height', '0')
    animate.set('height', 'auto')
    exit.set('height', '0')
  }
  if (heightInit) {
    initial.set('height', 'auto')
    animate.set('height', 'auto')
    exit.set('height', '0')
  }
  if (opacity) {
    initial.set('opacity', 0)
    animate.set('opacity', 1)
    exit.set('opacity', 0)
  }
  if (opacityInit) {
    initial.set('opacity', 1)
    animate.set('opacity', 1)
    exit.set('opacity', 0)
  }
  if (scaleY) {
    initial.set('scaleY', '0%')
    animate.set('scaleY', '100%')
    exit.set('scaleY', '0%')
  }
  if (scaleYInit) {
    initial.set('scaleY', '100%')
    animate.set('scaleY', '100%')
    exit.set('scaleY', '0%')
  }
  if (width) {
    initial.set('width', '0')
    animate.set('width', 'auto')
    exit.set('width', '0')
  }
  if (widthInit) {
    initial.set('width', 'auto')
    animate.set('width', 'auto')
    exit.set('width', '0')
  }
  if (scaleX) {
    initial.set('scaleX', '0%')
    animate.set('scaleX', '100%')
    exit.set('scaleX', '0%')
  }
  if (scaleXInit) {
    initial.set('scaleX', '100%')
    animate.set('scaleX', '100%')
    exit.set('scaleX', '0%')
  }
  if (left) {
    initial.set('left', '-100%')
    animate.set('left', '0')
    exit.set('left', '-100%')
  }
  if (leftInit) {
    initial.set('left', '0')
    animate.set('left', '0')
    exit.set('left', '-100%')
  }
  if (right) {
    initial.set('right', '-100%')
    animate.set('right', '0')
    exit.set('right', '-100%')
  }
  if (rightInit) {
    initial.set('right', '0')
    animate.set('right', '0')
    exit.set('right', '-100%')
  }
  if (top) {
    initial.set('top', '-100%')
    animate.set('top', '0')
    exit.set('top', '-100%')
  }
  if (topInit) {
    initial.set('top', '0')
    animate.set('top', '0')
    exit.set('top', '-100%')
  }
  if (bottom) {
    initial.set('bottom', '-100%')
    animate.set('bottom', '0')
    exit.set('bottom', '-100%')
  }
  if (bottomInit) {
    initial.set('bottom', '0')
    animate.set('bottom', '0')
    exit.set('bottom', '-100%')
  }
  if (typeof delay === 'number') transition.set('delay', delay)
  if (typeof duration === 'number') transition.set('duration', duration)
  return {
    initial: Object.fromEntries(initial.entries()),
    animate: Object.fromEntries(animate.entries()),
    exit: Object.fromEntries(exit.entries()),
    transition: Object.fromEntries(transition.entries()),
  }
}
