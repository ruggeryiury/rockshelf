import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionDiv } from '@renderer/lib/motion'
import { useErrorState } from '@renderer/states/error'
import { useEffect, useState } from 'react'
import { ErrorIcon, MessageSqrIcon } from '@renderer/assets/icons'

export function ErrorModal() {
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
    <section id="ErrorModals" className="absolute! h-full w-full">
      <AnimatedComponent condition={error !== null}>
        <MotionDiv {...genAnimation({ opacity: true })} className="z-50 mt-4 mr-4 ml-auto w-fit max-w-[40%] flex-row! items-center border p-4">
          {error?.type === 'warn' && <MessageSqrIcon className="mr-2 min-w-8 text-2xl" />}
          {error?.type === 'error' && <ErrorIcon className="mr-2 min-w-8 text-2xl" />}
          <p className="text-xs wrap-anywhere">{error?.message}</p>
        </MotionDiv>
      </AnimatedComponent>
    </section>
  )
}
