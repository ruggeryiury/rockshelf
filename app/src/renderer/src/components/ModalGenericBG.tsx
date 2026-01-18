import { AnimationGeneratorReturnObject } from '@renderer/lib/genAnimation'
import { AnimatedSection } from '@renderer/lib/motion'

import clsx from 'clsx'
import { HTMLMotionProps } from 'motion/react'

export function ModalGenericBG({ children, condition, animation, ...props }: HTMLMotionProps<'section'> & React.PropsWithChildren & { condition: boolean; animation: AnimationGeneratorReturnObject }) {
  return (
    <AnimatedSection condition={condition} {...animation} {...props}>
      {children}
    </AnimatedSection>
  )
}
