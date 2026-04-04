import { AnimatedSection } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useMemo } from 'react'

export function FatalErrorScreen() {
  const err = useWindowState((x) => x.err)
  const condition = useMemo(() => err !== null, [err])
  return (
    <AnimatedSection id="ErrorScreen" condition={condition} className="absolute! z-1000 h-full w-full items-center justify-center bg-neutral-950">
      <h1 className='mb-4'>FATAL ERROR</h1>
      {condition && <p className='text-center'>{err?.stack}</p>}
    </AnimatedSection>
  )
}
