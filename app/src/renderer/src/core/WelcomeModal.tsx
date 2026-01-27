import { AnimatedDiv, AnimatedSection, genAnim, TransComponent } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { BRAFlag, SPNFlag, USAFlag, wavesPattern } from '@renderer/assets/images'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/states/WindowState'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import clsx from 'clsx'
import { UserConfigObj } from 'rockshelf-core/lib'

export function WelcomeModal() {
  const { t, i18n } = useTranslation()

  const disabledButtons = useWindowState((state) => state.disableButtons)
  const setWindowState = useWindowState((state) => state.setWindowState)

  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
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
          <p className={clsx('mr-2 text-neutral-600', devhdd0Path ? 'font-mono' : 'italic')}>{devhdd0Path || t('noPathSelected')}</p>
          <button
            className="rounded-xs bg-neutral-900 px-1 py-0.5 text-sm! duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
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
          <p className={clsx('mr-2 text-neutral-600', rpcs3ExePath ? 'font-mono' : 'italic')}>{rpcs3ExePath || t('noPathSelected')}</p>
          <button
            className="rounded-xs bg-neutral-900 px-1 py-0.5 text-sm! duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disabledButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const path = await window.api.rpcs3.selectRPCS3Exe(i18n.language)
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
        <AnimatedDiv condition={Boolean(devhdd0Path && rpcs3ExePath)} {...genAnim({ height: true, scaleY: true, opacity: true })}>
          <div className="h-4 w-full" />
          <button
            className="w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-sm! duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disabledButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const newConfig: Partial<UserConfigObj> = {
                devhdd0Path,
                rpcs3ExePath,
                lang: i18n.language,
                mostPlayedDifficulty: 3,
                mostPlayedInstrument: 'band',
              }
              setWindowState({ disableButtons: false })
            }}
          >
            {t('continue')}
          </button>
        </AnimatedDiv>
        <div className="mt-auto h-4 w-full flex-row! items-center">
          <h2 className="mr-4 text-xs">{t('changeLang')}</h2>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs px-2 py-1 font-sans! text-xs! duration-200 last:mr-0', i18n.language === 'en-US' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('en-US')}>
            <img src={USAFlag} width={12} className="mr-2" />
            <h1>{t('en-US')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs px-2 py-1 font-sans! text-xs! duration-200 last:mr-0', i18n.language === 'pt-BR' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('pt-BR')}>
            <img src={BRAFlag} width={12} className="mr-2" />
            <h1>{t('pt-BR')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs px-2 py-1 font-sans! text-xs! duration-200 last:mr-0', i18n.language === 'es-ES' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('es-ES')}>
            <img src={SPNFlag} width={12} className="mr-2" />
            <h1>{t('es-ES')}</h1>
          </button>
        </div>
      </div>
    </AnimatedSection>
  )
}
