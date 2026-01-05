import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionDiv } from '@renderer/lib/motion'
import { useErrorState } from '@renderer/states/error'
import { useEffect, useState } from 'react'

export function ErrorModals() {
  const error = useErrorState((x) => x.error)
  const [timeout, setNewTimeout] = useState<NodeJS.Timeout | null>(null)
  const setErrorState = useErrorState((x) => x.setErrorState)

  useEffect(() => {
    window.api.listeners.onErrorMessage((_, message) => {
      setErrorState({ error: message })
    })
  }, [])

  useEffect(() => {
    if (timeout !== null) clearTimeout(timeout)
    const newTimeout = setTimeout(() => setErrorState({ error: null }), 4000)
    setNewTimeout(newTimeout)
  }, [error])

  return (
    <section id="ErrorModals" className="absolute! w-full h-full">
      <AnimatedComponent condition={error !== null}>
        <MotionDiv {...genAnimation({ opacity: true })} className="max-w-[40%] w-fit z-50 ml-auto mt-4 mr-4 p-4 border">
          <p className="text-xs wrap-break-word ">{error?.message}</p>
        </MotionDiv>
      </AnimatedComponent>
    </section>
  )
}
