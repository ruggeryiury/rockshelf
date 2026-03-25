import { AnimatedSection } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useMemo } from 'react'

export function ErrorScreen() {
  const err = useWindowState((x) => x.err)
  const condition = useMemo(() => err !== null, [err])
  return <AnimatedSection id="ErrorScreen" condition={condition}></AnimatedSection>
}
