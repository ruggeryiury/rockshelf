import { AnimatedSection } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.store'
import { useTranslation } from 'react-i18next'

export function UnhandledExceptionScreen() {
  const { t } = useTranslation()
  const unhandledException = useWindowState((x) => x.unhandledException)
  const isActivated = unhandledException !== null
  return (
    <AnimatedSection id="UnhandledExceptionScreen" condition={isActivated} className="absolute! z-1000 h-full w-full items-center justify-center bg-black">
      {isActivated && (
        <div className="absolute! inset-0 z-13 h-full w-full bg-transparent px-12 py-8">
          <h1 className="border-default-white/50 mb-2 w-full border-b pb-1 text-2xl uppercase">{t('unhandledExceptionTitle')}</h1>
          <p className="mb-4">{t('unhandledExceptionDesc')}</p>
          <h1 className="mb-2 uppercase">{t('errorDetails') + ':'}</h1>
          <div className="rounded-sm bg-neutral-900 p-4">
            <p className="font-mono  break-all whitespace-pre-wrap">{unhandledException.stack}</p>
          </div>
        </div>
      )}
    </AnimatedSection>
  )
}
