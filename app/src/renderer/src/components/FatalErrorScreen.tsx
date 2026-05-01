import { AnimatedSection } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'

export function FatalErrorScreen() {
  const { t } = useTranslation()
  const err = useWindowState((x) => x.err)
  return (
    <AnimatedSection id="FatalErrorScreen" condition={err !== null} className="absolute! z-1000 h-full w-full justify-center bg-black p-8">
      {err !== null && (
        <>
          <h1 className="mb-4 text-3xl uppercase">{t('fatalError')}</h1>
          <p className="mb-4">{t('fatalErrorDesc')}</p>
          <div className="h-[60%] w-full overflow-y-auto rounded-sm bg-neutral-950 p-8">
            <p className="font-mono text-sm whitespace-break-spaces wrap-break-word select-text">{err.stack}</p>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
