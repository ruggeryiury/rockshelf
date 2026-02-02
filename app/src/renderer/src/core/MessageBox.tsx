import { ErrorIcon } from '@renderer/assets/icons'
import { AnimatedDiv, genAnim, TransComponent } from '@renderer/lib'
import { useWindowState } from '@renderer/states/WindowState'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

export function MessageBox() {
  const { t } = useTranslation()
  const messageBox = useWindowState((state) => state.messageBox)
  const [timeout, setNewTimeout] = useState<NodeJS.Timeout | null>(null)
  const setWindowState = useWindowState((state) => state.setWindowState)

  const i18nKey = useMemo(() => (messageBox ? `${messageBox.type}${messageBox.method.at(0)?.toUpperCase()}${messageBox.method.slice(1)}${messageBox.code.at(0)?.toUpperCase()}${messageBox.code.slice(1)}` : ''), [messageBox])

  useEffect(() => {
    window.api.listeners.onMessage((_, message) => {
      if (import.meta.env.DEV) console.log('Received message in MessageBox:', message)
      setWindowState({ messageBox: message })
    })
  })

  useEffect(() => {
    if (timeout !== null) clearTimeout(timeout)
    if (messageBox !== null) {
      const newTimeout = setTimeout(() => setWindowState({ messageBox: null }), messageBox.timeout || 4000)
      setNewTimeout(newTimeout)
    }
  }, [messageBox])

  return (
    <section id="MessageBox" className="absolute! h-full w-full">
      <AnimatedDiv
        condition={Boolean(messageBox)}
        {...genAnim({ opacity: true })}
        className={clsx('z-50 mt-4 mr-4 ml-auto w-fit max-w-[30%] flex-row! items-start border bg-black/90 p-2 backdrop-blur-md', messageBox?.type === 'warn' ? 'border-yellow-500' : messageBox?.type === 'error' ? 'border-red-500' : '')}
        onClick={() => {
          if (messageBox && timeout !== null) {
            clearTimeout(timeout)
            setWindowState({ messageBox: null })
          }
        }}
      >
        {messageBox && (
          <>
            <div className="flex-row! items-start">
              <ErrorIcon className={clsx('mt-0.5 mr-2 min-w-8 text-lg', messageBox.type === 'error' ? 'text-red-500' : messageBox.type === 'warn' ? 'text-yellow-500' : messageBox.type === 'success' ? 'text-green-500' : '')} />
              <div>
                <h1 className="mb-0.5 border-b border-neutral-800 text-sm!">{t(messageBox.type)}</h1>
                <p className="rounded-xs text-xs wrap-anywhere">
                  <TransComponent i18nKey={i18nKey} values={messageBox.messageValues} />
                </p>
              </div>
            </div>
          </>
        )}
      </AnimatedDiv>
    </section>
  )
}
