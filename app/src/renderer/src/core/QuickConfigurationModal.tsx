import { GoBackToRightIcon } from '@renderer/assets/icons'
import { AnimatedDiv, genAnim } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import { useWindowState } from '@renderer/states/WindowState'
import { useTranslation } from 'react-i18next'

export function QuickConfigurationModal() {
  const { t } = useTranslation()

  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
  const disableButtons = useWindowState((state) => state.disableButtons)

  const setRendererState = useRendererState((state) => state.setRendererState)
  const setWindowState = useWindowState((state) => state.setWindowState)

  const condition = useRendererState((state) => state.QuickConfigurationModal)
  return (
    <AnimatedDiv id="QuickConfigurationModal" condition={condition} className="absolute! h-full w-full bg-black/90 p-6 backdrop-blur-sm" {...genAnim({ right: true })}>
      <div className="mb-2 w-full flex-row! items-center">
        <h1 className="mr-auto text-3xl">{t('installQuickConfigurations')}</h1>
        <button
          disabled={disableButtons}
          className="rounded-xs bg-white/5 p-1 text-neutral-500 duration-100 hover:bg-white/10 hover:text-neutral-400 active:bg-white/15 active:text-neutral-300"
          title={t('goBack')}
          onClick={() => {
            setRendererState({ QuickConfigurationModal: false })
          }}
        >
          <GoBackToRightIcon className="text-xl" />
        </button>
      </div>
      <p className="mr-8 mb-4 ml-2 text-neutral-600 italic">{t('installQuickConfigurationsDesc')}</p>
      <button
        className="mb-2 ml-2 w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
        onClick={async (ev) => {
          setWindowState({ disableButtons: true })
          await window.api.rpcs3.installQuickConfig(rpcs3ExePath, 'recommended')
          setWindowState({ disableButtons: false })
        }}
      >
        {t('recommended')}
      </button>
      <button
        className="mb-2 ml-2 w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
        onClick={async (ev) => {
          setWindowState({ disableButtons: true })
          await window.api.rpcs3.installQuickConfig(rpcs3ExePath, 'minimum')
          setWindowState({ disableButtons: false })
        }}
      >
        {t('minimum')}
      </button>
      <button
        className="mb-2 ml-2 w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
        onClick={async (ev) => {
          setWindowState({ disableButtons: true })
          await window.api.rpcs3.installQuickConfig(rpcs3ExePath, 'potato')
          setWindowState({ disableButtons: false })
        }}
      >
        {t('potato')}
      </button>
    </AnimatedDiv>
  )
}
