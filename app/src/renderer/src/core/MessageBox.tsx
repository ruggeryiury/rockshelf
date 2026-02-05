import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorIcon, LoadingIcon, SuccessIcon } from '@renderer/assets/icons'
import { AnimatedDiv, genAnim, mountMessageLocale, TransComponent } from '@renderer/lib'
import { useWindowState } from '@renderer/states/WindowState'

export function MessageBox() {
  const { t } = useTranslation()
  const msgObject = useWindowState((state) => state.msgObject)
  const [timeout, setNewTimeout] = useState<NodeJS.Timeout | null>(null)
  const setWindowState = useWindowState((state) => state.setWindowState)

  const i18nKey = useMemo(() => mountMessageLocale(msgObject), [msgObject])

  useEffect(function InitMessageListener() {
    window.api.listeners.onMessage((_, message) => {
      if (import.meta.env.DEV) console.log('struct RendererMessageObject (MAIN) ["core\\src\\lib\\electron-lib\\sendMessage.ts"]:', message)
      setWindowState({ msgObject: message })
    })
  })

  useEffect(
    function SetNewActiveTimeout() {
      if (timeout !== null) clearTimeout(timeout)
      if (msgObject) {
        if (msgObject.type !== 'loading') {
          const newTimeout = setTimeout(() => setWindowState({ msgObject: false }), msgObject.timeout || 4000)
          setNewTimeout(newTimeout)
        }
      }
    },
    [msgObject]
  )

  return (
    <section id="msgObject" className="absolute! h-full w-full">
      <AnimatedDiv
        condition={Boolean(msgObject)}
        {...genAnim({ opacity: true })}
        className={clsx('z-50 mt-4 mr-4 ml-auto w-[30%] max-w-[30%] flex-row! items-start border bg-black/90 p-2 backdrop-blur-md', msgObject && msgObject.type === 'warn' ? 'border-yellow-500' : msgObject && msgObject.type === 'error' ? 'border-red-500' : msgObject && msgObject.type === 'success' ? 'border-green-500' : '')}
        onClick={() => {
          if (msgObject && msgObject.type !== 'loading' && timeout !== null) {
            clearTimeout(timeout)
            setWindowState({ msgObject: false })
          }
        }}
      >
        {msgObject && (
          <>
            <div className="w-full flex-row! items-start">
              {msgObject.type === 'loading' && <LoadingIcon className="mt-0.5 mr-2 min-w-8 animate-spin text-lg" />}
              {msgObject.type === 'success' && <SuccessIcon className="mt-0.5 mr-2 min-w-8 text-lg text-green-500" />}
              {msgObject.type === 'info' || msgObject.type === 'warn' || (msgObject.type === 'error' && <ErrorIcon className={clsx('mt-0.5 mr-2 min-w-8 text-lg', msgObject.type === 'error' ? 'text-red-500' : msgObject.type === 'warn' ? 'text-yellow-500' : '')} />)}
              <div className="w-full">
                <h1 className="mb-0.5 w-full border-b border-neutral-800 text-sm!">{t(msgObject.type)}</h1>
                <p className="rounded-xs text-xs wrap-anywhere">
                  <TransComponent i18nKey={i18nKey} values={msgObject.messageValues} />
                </p>
              </div>
            </div>
          </>
        )}
      </AnimatedDiv>
    </section>
  )
}
