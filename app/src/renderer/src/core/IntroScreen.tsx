import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionDiv } from '@renderer/lib/motion'

export function IntroScreen() {
  return (
    <AnimatedComponent condition={true}>
      <MotionDiv {...genAnimation({ opacity: true, duration: 1 })} className="absolute w-full h-full bg-neutral-700 justify-center items-center">
        <h1 className="text-[4rem] uppercase">Rockshelf</h1>
        <p className="absolute bottom-5">Rockshelf &copy; 2025-2026 Ruggery Iury Corrêa. All rights reserved.</p>
      </MotionDiv>
    </AnimatedComponent>
  )
}
