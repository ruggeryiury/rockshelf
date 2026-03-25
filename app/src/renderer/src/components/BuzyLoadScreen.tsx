import { AnimatedButton, AnimatedSection } from '@renderer/lib.exports'
import { animate } from '@renderer/lib.exports'
import { useBuzyLoadScreenState } from './BuzyLoadScreen.state'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckedCircleIcon, LoadingIcon } from '@renderer/assets/icons'
import { useWindowState } from '@renderer/stores/Window.state'

export function BuzyLoadScreen() {
  const { t } = useTranslation()
  const active = useBuzyLoadScreenState((x) => x.active)
  const step = useBuzyLoadScreenState((x) => x.step)
  const isCompleted = useBuzyLoadScreenState((x) => x.isCompleted)
  const setBuzyLoadScreenState = useBuzyLoadScreenState((x) => x.setBuzyLoadScreenState)
  const resetBuzyLoadScreenState = useBuzyLoadScreenState((x) => x.resetBuzyLoadScreenState)
  const setWindowState = useWindowState((x) => x.setWindowState)

  const condition = useMemo(() => active !== null, [active])

  return (
    <AnimatedSection id="BuzyLoadScreen" condition={condition} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      {active && (
        <>
          <div className="mb-6 flex-row! items-center border-b border-white/25 pb-1">
            <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t(active.title)}</h1>
          </div>
          {active.steps !== null &&
            active.steps.map((activeSteps, activeStepsIndex) => {
              return (
                <div key={`active.steps${activeStepsIndex}`} className="mb-4 flex-row! items-center">
                  {activeStepsIndex === step && <LoadingIcon className="h-4 w-4 animate-spin" />}
                  {activeStepsIndex < step && <CheckedCircleIcon className="h-4 w-4 text-green-500" />}
                  {activeStepsIndex > step && <div className="h-4 w-4" />}
                  <h2 className="ml-2 text-base">
                    {t(activeSteps)}
                    {activeStepsIndex === step ? '...' : ''}
                  </h2>
                </div>
              )
            })}
          <AnimatedButton
            condition={isCompleted}
            {...animate({ opacity: true })}
            className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              if (Array.isArray(active.onCompleted)) {
                for (const fn of active.onCompleted) {
                  switch (fn) {
                    case 'refreshRB3Stats':
                    default: {
                      const rb3Stats = await window.api.rpcs3GetRB3Stats()
                      if (import.meta.env.DEV) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', rb3Stats)
                      setWindowState({ rb3Stats })
                    }
                  }
                }
              }
              resetBuzyLoadScreenState()
            }}
          >
            {t('close')}
          </AnimatedButton>
        </>
      )}
    </AnimatedSection>
  )
}
