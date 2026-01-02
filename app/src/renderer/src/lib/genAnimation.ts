import type { MotionNodeAnimationOptions } from 'motion/react'

export interface FramerMotionAnimationGeneratorOptions {
  delay?: number
  duration?: number
  height?: boolean
  heightInit?: boolean
  left?: boolean
  leftInit?: boolean
  opacity?: boolean
  opacityInit?: boolean
  right?: boolean
  rightInit?: boolean
  scaleX?: boolean
  scaleXInit?: boolean
  scaleY?: boolean
  scaleYInit?: boolean
  width?: boolean
  widthInit?: boolean
  top?: boolean
  topInit?: boolean
  bottom?: boolean
  bottomInit?: boolean
}

export interface AnimationGeneratorReturnObject {
  initial: MotionNodeAnimationOptions['initial']
  animate: MotionNodeAnimationOptions['animate']
  exit: MotionNodeAnimationOptions['exit']
  transition?: MotionNodeAnimationOptions['transition']
}

/**
 * Quickly generates animation configurations for `framer-motion` package.
 * - - - -
 * @param {FramerMotionAnimationGeneratorOptions} animations An object flagging the animations you want to be activated.
 * @returns {AnimationGeneratorReturnObject}
 */
export const genAnimation = (animations: FramerMotionAnimationGeneratorOptions): AnimationGeneratorReturnObject => {
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
