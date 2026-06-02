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
          <div className="mb-3 h-[60%] w-full overflow-y-auto rounded-sm bg-neutral-950 p-8">
            <p className="font-mono text-sm wrap-break-word whitespace-break-spaces select-text">{err.stack}</p>
          </div>
          <button
            className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              await window.api.deleteUserConfigAndRestart(true)
            }}
          >
            {t('restartRockshelf')}
          </button>
        </>
      )}
    </AnimatedSection>
  )
}
