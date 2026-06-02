import { AnimatedSection, TransComponent, animate } from '@renderer/lib.exports'
import { useQuickConfigScreenState } from './QuickConfigScreen.state'
import { useShallow } from 'zustand/shallow'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { HighRankIcon, LowerRankIcon, MiddleRankIcon } from '@renderer/assets/icons'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'

export function QuickConfigScreen() {
  const { t } = useTranslation()
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { rpcs3ExePath } = useUserConfigState(useShallow((x) => ({ rpcs3ExePath: x.rpcs3ExePath })))
  const { active, resetQuickConfigScreenState } = useQuickConfigScreenState(useShallow((x) => ({ active: x.active, resetQuickConfigScreenState: x.resetQuickConfigScreenState })))
  return (
    <AnimatedSection id="QuickConfigScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black p-8">
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('installQuickConfigurations')}</h1>
        <button
          disabled={disableButtons}
          className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            resetQuickConfigScreenState()
          }}
        >
          {t('goBack')}
        </button>
      </div>
      <div className="h-full w-full overflow-y-auto">
        <div className="h-full w-full flex-row! items-center py-8">
          <button
            className="mr-2 h-full w-1/3 items-center rounded-sm border border-neutral-600 p-6 duration-100 last:mr-0 hover:bg-white/5 active:bg-white/15"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              try {
                await window.api.installQuickConfig(rpcs3ExePath, 'potato')
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
              setWindowState({ disableButtons: false })
            }}
          >
            <LowerRankIcon className="text-[15rem]" />
            <h1 className="mb-2 text-xl">{t('potatoQuickConfig')}</h1>
            <p className="font-open mb-auto normal-case">
              <TransComponent i18nKey="potatoQuickConfigText" />
            </p>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('operationalSystem')}: ${t('minimumConfigOS')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('processor')}: ${t('minimumConfigProcessor')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('ram')}: ${t('minimumConfigRAM')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('graphicsCard')}: ${t('potatoConfigGPU')}`}</p>
            </div>
          </button>

          <button
            className="mr-2 h-full w-1/3 items-center rounded-sm border border-neutral-600 p-6 duration-100 last:mr-0 hover:bg-white/5 active:bg-white/15"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              try {
                await window.api.installQuickConfig(rpcs3ExePath, 'potato')
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
              setWindowState({ disableButtons: false })
            }}
          >
            <MiddleRankIcon className="text-[15rem]" />
            <h1 className="mb-auto text-xl">{t('minimumQuickConfig')}</h1>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('operationalSystem')}: ${t('minimumConfigOS')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('processor')}: ${t('minimumConfigProcessor')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('ram')}: ${t('minimumConfigRAM')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('graphicsCard')}: ${t('minimumConfigGPU')}`}</p>
            </div>
          </button>

          <button
            className="mr-2 h-full w-1/3 items-center rounded-sm border border-neutral-600 p-6 duration-100 last:mr-0 hover:bg-white/5 active:bg-white/15"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              try {
                await window.api.installQuickConfig(rpcs3ExePath, 'potato')
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
              setWindowState({ disableButtons: false })
            }}
          >
            <HighRankIcon className="text-[15rem]" />
            <h1 className="mb-auto text-xl">{t('recommendedQuickConfig')}</h1>

            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('operationalSystem')}: ${t('recommendedConfigOS')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('processor')}: ${t('recommendedConfigProcessor')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('ram')}: ${t('recommendedConfigRAM')}`}</p>
            </div>
            <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
              <p className="font-open normal-case">{`${t('graphicsCard')}: ${t('recommendedConfigGPU')}`}</p>
            </div>
          </button>
        </div>
      </div>
    </AnimatedSection>
  )
}
