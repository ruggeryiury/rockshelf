import { ChevronRightIcon } from '@renderer/assets/icons'
import { AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'

export function ErrorScreen() {
  const { t } = useTranslation()
  const err = useWindowState((x) => x.err)
  return (
    <AnimatedSection id="ErrorScreen" condition={err !== null} className="absolute! z-50 h-full w-full justify-center bg-black p-8">
      {err !== null && (
        <>
          <h1 className="mb-1 border-b border-white/20 pb-1 text-3xl uppercase">{t('error')}</h1>
          <p className="mb-4">{t('errorScreenDesc')}</p>
          <div className="mb-4 h-[80%] overflow-y-auto rounded-sm bg-neutral-950 p-2 pr-6">
            <h1 className="uppercase">Message</h1>
            <p className="mb-2">{err.message}</p>

            {err.stack &&
              err.stack.length > 0 &&
              err.stack.map((val, i) => {
                return (
                  <div key={`errorStackTrace${i}`} className="mb-2 rounded-sm bg-neutral-900 p-1 last:mb-0">
                    <div className="flex-row! items-center">
                      <ChevronRightIcon className="mr-1 text-[0.5rem]" />
                      <p className="mr-auto font-mono!">{val.fnName}</p>
                      <p className="text-xs font-bold uppercase">
                        <TransComponent i18nKey="lineAndCol" values={{ line: val.line, col: val.col }} />
                      </p>
                    </div>
                    <p className="text-xs">{val.path.path}</p>
                  </div>
                )
              })}
          </div>
          <div>
            <h1 className="mb-2 border-b border-white/20 pb-1 uppercase">{t('actions')}</h1>
            <div className="flex-row! items-center">
              <button
                className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                onClick={async () => {
                  await window.api.win.restart()
                }}
              >
                {t('restartRockshelf')}
              </button>
            </div>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
