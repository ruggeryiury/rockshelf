import { AnimatedSection, genAnim, TransComponent } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { wavesPattern } from '@renderer/assets/images'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/states/WindowState'
import { useUserConfigState } from '@renderer/states/UserConfigState'

export function WelcomeModal() {
  const { t } = useTranslation()

  const disabledButtons = useWindowState((state) => state.disableButtons)
  const setWindowState = useWindowState((state) => state.setWindowState)

  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const setUserConfigState = useUserConfigState((state) => state.setUserConfigState)

  const condition = useRendererState((state) => state.WelcomeModal)
  return (
    <AnimatedSection id="WelcomeModal" condition={condition} {...genAnim({ opacity: true })} className="absolute! z-10 h-full w-full backdrop-blur-xs">
      <div className={'absolute! inset-0 z-11 bg-black/95'} />
      <div className={`animate-move-pattern absolute! inset-0 z-12 h-full w-full bg-size-[12rem] bg-center bg-repeat opacity-2`} style={{ backgroundImage: `url('${wavesPattern}')` }} />
      <div className="absolute! inset-0 z-13 h-full w-full bg-transparent px-12 py-8">
        <h1 className="border-default-white/50 mb-2 w-full border-b pb-1 text-3xl">{t('welcomeScreenTitle')}</h1>
        <p className="mb-4 text-base!">
          <TransComponent i18nKey="welcomeScreenDescription" />
        </p>

        <div className="mb-2 flex-row! items-center border-b border-white/20 pb-1">
          <h2 className="mr-auto">
            <TransComponent i18nKey="devhdd0Folder" />
          </h2>
          <button
            className="rounded-xs bg-neutral-900 p-1 duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disabledButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const path = await window.api.rpcs3.selectDevhdd0Folder()
              if (!path) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ devhdd0Path: path })
              setWindowState({ disableButtons: false })
            }}
          >
            {t('select')}
          </button>
        </div>
        <p className="mb-4 text-neutral-600 italic">
          <TransComponent i18nKey="devhdd0FolderDescription" />
        </p>

        <div className="mb-2 flex-row! items-center border-b border-white/20 pb-1">
          <h2 className="mr-auto">
            <TransComponent i18nKey="rpcs3Exe" />
          </h2>
          <button
            className="rounded-xs bg-neutral-900 p-1 duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disabledButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const path = await window.api.rpcs3.selectRPCS3Exe()
              if (!path) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ rpcs3ExePath: path })
              setWindowState({ disableButtons: false })
            }}
          >
            {t('select')}
          </button>
        </div>
        <p className="text-neutral-600 italic">
          <TransComponent i18nKey="rpcs3ExeDescription" />
        </p>
      </div>
    </AnimatedSection>
  )
}
