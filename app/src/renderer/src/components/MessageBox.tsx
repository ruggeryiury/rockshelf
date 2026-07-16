import { animate, AnimatedDiv, AnimatedSection, calculatePercentageAsString, mountMessageBoxLocaleKey, TransComponent } from '@renderer/lib.exports'
import { useMessageBoxState } from './MessageBox.state'
import { useEffect, useMemo } from 'react'
import { ErrorIcon, LoadingIcon, SuccessIcon } from '@renderer/assets/icons'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'

export function MessageBox() {
  const { t } = useTranslation()
  const { message, setMessageBoxState, timeout } = useMessageBoxState(useShallow((x) => ({ message: x.message, setMessageBoxState: x.setMessageBoxState, timeout: x.timeout })))
  const active = useMemo(() => message !== null, [message])

  const i18nKey = useMemo(() => mountMessageBoxLocaleKey(message), [message])
  const progressPercentage = useMemo(() => message && message.type === 'progressBar' && message.progress && (message.progress.percentage || calculatePercentageAsString(message.progress.count as number, message.progress.total as number)), [message])

  useEffect(
    function SetNewActiveTimeout() {
      if (timeout !== null) clearTimeout(timeout)
      if (message) {
        if (message.type !== 'loading' && message.type !== 'debug' && message.type !== 'progressBar') {
          const newTimeout = setTimeout(() => setMessageBoxState({ message: null }), message.timeout || 4000)
          setMessageBoxState({ timeout: newTimeout })
        }
      }
    },
    [message]
  )
  return (
    <AnimatedSection
      id="MessageBox"
      condition={active}
      {...animate({ opacity: true })}
      className={clsx('absolute! bottom-5 z-50 ml-auto w-full flex-row! items-start border-y border-white/25 bg-black p-3 px-18', message && message.type === 'warn' ? 'border-yellow-500' : message && message.type === 'error' ? 'border-red-500' : message && message.type === 'success' ? 'border-green-500' : '')}
      onClick={() => {
        if (message && message.type !== 'loading' && message.type !== 'debug' && message.type !== 'progressBar' && timeout !== null) {
          clearTimeout(timeout)
          setMessageBoxState({ message: null })
        }
      }}
    >
      {message && (
        <>
          <div className="w-full flex-row! items-start">
            {(message.type === 'loading' || message.type === 'progressBar') && <LoadingIcon className="mt-0.5 mr-2 min-w-8 animate-spin text-xl" />}
            {message.type === 'success' && <SuccessIcon className="mt-0.5 mr-2 min-w-8 text-xl text-green-500" />}
            {(message.type === 'info' || message.type === 'warn' || message.type === 'error') && <ErrorIcon className={clsx('mt-0.5 mr-2 min-w-8 text-xl', message.type === 'error' ? 'text-red-500' : message.type === 'warn' ? 'text-yellow-500' : '')} />}
            <div className="w-full">
              <h1 className="mb-1 w-full border-b border-neutral-800 pb-1 text-lg uppercase">{t(message.type === 'progressBar' ? 'loading' : message.type)}</h1>
              <p className="text-base wrap-anywhere">{message.type === 'debug' ? message.code : <TransComponent i18nKey={i18nKey} values={message.messageValues} />}</p>
              <AnimatedDiv condition={message.type === 'progressBar' && message.progress !== undefined} {...animate({ scaleY: true, height: true, opacity: true })}>
                {message.type === 'progressBar' && message.progress !== undefined && (
                  <>
                    <div className="h-2 w-full" />
                    <div className="flex-row! items-center">
                      {typeof progressPercentage === 'string' && (
                        <div className="mr-2 h-5 w-lg rounded-sm border border-neutral-600">
                          <div className="h-full bg-linear-to-r from-cyan-600 to-cyan-500" style={{ width: progressPercentage }} />
                        </div>
                      )}
                      <p className="text-nowrap">
                        {message.progress.count}/{message.progress.total} ({progressPercentage})
                      </p>
                    </div>
                  </>
                )}
              </AnimatedDiv>
            </div>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
