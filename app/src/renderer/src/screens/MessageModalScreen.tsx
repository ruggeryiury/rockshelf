import { LoadingIcon, SuccessIcon, ErrorIcon } from '@renderer/assets/icons'
import { animate, AnimatedDiv, mountMessageLocaleKey, TransComponent } from '@renderer/lib.exports'
import { useMessageModalScreenState } from '@renderer/stores/MessageModalScreen'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export function MessageModalScreen() {
  const { t } = useTranslation()
  const msgObject = useMessageModalScreenState((state) => state.msgObject)
  const isActivated = useMemo(() => msgObject !== null, [msgObject])
  const setMessageModalScreen = useMessageModalScreenState((state) => state.setMessageModalScreen)
  const [timeout, setNewTimeout] = useState<NodeJS.Timeout | null>(null)

  const i18nKey = useMemo(() => mountMessageLocaleKey(msgObject), [msgObject])

  useEffect(function InitMessageListener() {
    window.api.onMessage((_, message) => {
      if (import.meta.env.DEV) console.log('struct RendererMessageObject (MAIN) ["core/src/core/sendMessage.ts"]:', message)
      setMessageModalScreen({ msgObject: message })
    })
  })

  useEffect(
    function SetNewActiveTimeout() {
      if (timeout !== null) clearTimeout(timeout)
      if (msgObject) {
        if (msgObject.type !== 'loading' && msgObject.type !== 'debug') {
          const newTimeout = setTimeout(() => setMessageModalScreen({ msgObject: null }), msgObject.timeout || 4000)
          setNewTimeout(newTimeout)
        }
      }
    },
    [msgObject]
  )

  return (
    <AnimatedDiv
      condition={isActivated}
      {...animate({ opacity: true })}
      className={clsx('absolute! right-3 top-3 z-50 ml-auto w-[30%] max-w-[30%] flex-row! items-start border bg-black/90 p-2 backdrop-blur-md', msgObject && msgObject.type === 'warn' ? 'border-yellow-500' : msgObject && msgObject.type === 'error' ? 'border-red-500' : msgObject && msgObject.type === 'success' ? 'border-green-500' : '')}
      onClick={() => {
        if (msgObject && msgObject.type !== 'loading' && msgObject.type !== 'debug' && timeout !== null) {
          clearTimeout(timeout)
          setMessageModalScreen({ msgObject: null })
        }
      }}
    >
      {msgObject && (
        <>
          <div className="w-full flex-row! items-start">
            {msgObject.type === 'loading' && <LoadingIcon className="mt-0.5 mr-2 min-w-8 animate-spin text-lg" />}
            {msgObject.type === 'success' && <SuccessIcon className="mt-0.5 mr-2 min-w-8 text-lg text-green-500" />}
            {(msgObject.type === 'info' || msgObject.type === 'warn' || msgObject.type === 'error') && <ErrorIcon className={clsx('mt-0.5 mr-2 min-w-8 text-lg', msgObject.type === 'error' ? 'text-red-500' : msgObject.type === 'warn' ? 'text-yellow-500' : '')} />}
            <div className="w-full">
              <h1 className="mb-0.5 w-full border-b border-neutral-800 text-sm uppercase">{t(msgObject.type)}</h1>
              <p className="rounded-xs text-xs wrap-anywhere">{msgObject.type === 'debug' ? msgObject.code : <TransComponent i18nKey={i18nKey} values={msgObject.messageValues} />}</p>
            </div>
          </div>
        </>
      )}
    </AnimatedDiv>
  )
}
