import { AnimationGeneratorReturnObject } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionSection } from '@renderer/lib/motion'

import clsx from 'clsx'

export function ModalGenericBG({ children, id, condition, animation, className }: React.PropsWithChildren & { id?: string; condition: boolean; animation: AnimationGeneratorReturnObject; className: string }) {
  return (
    <AnimatedComponent condition={condition}>
      <MotionSection {...animation} id={id} className={clsx(className, '')}>
        {children}
      </MotionSection>
    </AnimatedComponent>
  )
}
