import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionDiv } from '@renderer/lib/motion'
import { usePopUpMessageState } from '@renderer/states/message'
import { useEffect, useState } from 'react'
import { ErrorIcon } from '@renderer/assets/icons'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { TransComponent } from '@renderer/lib/transComponents'

export function PopUpMessage() {
  const { t } = useTranslation()
  const msgObject = usePopUpMessageState((x) => x.message)
  const [timeout, setNewTimeout] = useState<NodeJS.Timeout | null>(null)
  const setPopUpMessageState = usePopUpMessageState((x) => x.setPopUpMessageState)

  useEffect(() => {
    window.api.listeners.onPopUpMessage((_, message) => {
      setPopUpMessageState({ message })
    })
  }, [])

  useEffect(() => {
    if (timeout !== null) clearTimeout(timeout)
    const newTimeout = setTimeout(() => setPopUpMessageState({ message: null }), 4000)
    setNewTimeout(newTimeout)
  }, [msgObject])

  return (
    <section id="PopUpMessages" className="absolute! h-full w-full">
      <AnimatedComponent condition={msgObject !== null}>
        <MotionDiv {...genAnimation({ opacity: true })} className={clsx('z-50 mt-4 mr-4 ml-auto w-fit max-w-[30%] flex-row! items-center border bg-black/90 p-4 backdrop-blur-md', msgObject?.type === 'warn' ? 'border-yellow-500' : msgObject?.type === 'error' ? 'border-red-500' : '')}>
          {msgObject && (
            <>
              {msgObject.type === 'warn' && <ErrorIcon className="mr-2 min-w-8 text-lg text-yellow-500" />}
              {msgObject.type === 'error' && <ErrorIcon className="mr-2 min-w-8 text-lg text-red-500" />}
              {/* <p className="text-xs wrap-anywhere">{t(`${msgObject.type}${msgObject.method.at(0)?.toUpperCase()}${msgObject.method.slice(1)}${msgObject.code.at(0)?.toUpperCase()}${msgObject.code.slice(1)}`, msgObject.messageValues)}</p> */}
              <p className="text-xs wrap-anywhere">
                <TransComponent i18nKey={`${msgObject.type}${msgObject.method.at(0)?.toUpperCase()}${msgObject.method.slice(1)}${msgObject.code.at(0)?.toUpperCase()}${msgObject.code.slice(1)}`} />
              </p>
            </>
          )}
        </MotionDiv>
      </AnimatedComponent>
    </section>
  )
}
