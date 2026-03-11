import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { animate, AnimatedDiv, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { BRAFlag, MEXFlag, USAFlag, wavesPattern } from '@renderer/assets/images'
import { useUserConfigState } from '@renderer/stores/UserConfig.store'
import { useWindowState } from '@renderer/stores/Window.store'
import { useFirstTimeScreenState } from '@renderer/stores/FirstTimeScreen.store'
import type { UserConfigObject } from 'rockshelf-core'
import { useInitScreenState } from '@renderer/stores/InitScreen.store'

export function FirstTimeScreen() {
  const { i18n, t } = useTranslation()
  const disableButtons = useWindowState((x) => x.disableButtons)
  const devhdd0Path = useUserConfigState((x) => x.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((x) => x.rpcs3ExePath)

  const setWindowState = useWindowState((x) => x.setWindowState)
  const setUserConfigState = useUserConfigState((x) => x.setUserConfigState)
  const setInitScreen = useInitScreenState((x) => x.setInitScreen)
  const setFirstTimeScreen = useFirstTimeScreenState((x) => x.setFirstTimeScreen)

  const isActivated = useFirstTimeScreenState((x) => x.FirstTimeScreen)

  return (
    <AnimatedSection id="WelcomeModal" condition={isActivated} {...animate({ opacity: true })} className="absolute! z-10 h-full w-full backdrop-blur-xs">
      <div className="absolute! inset-0 z-11 bg-black/95" />
      <div className={`animate-move-pattern absolute! inset-0 z-12 h-full w-full bg-size-[12rem] bg-center bg-repeat opacity-3`} style={{ backgroundImage: `url('${wavesPattern}')` }} />
      <div className="absolute! inset-0 z-13 h-full w-full bg-transparent px-12 py-8">
        <h1 className="border-default-white/50 mb-2 w-full border-b pb-1 text-2xl uppercase">{t('firstTimeScreenTitle')}</h1>
        <p className="mb-4">
          <TransComponent i18nKey="firstTimeScreenDesc" />
        </p>
        <div className="mb-2 flex-row! items-center border-b border-white/20 pb-1">
          <h2 className="mr-auto">
            <TransComponent i18nKey="devhdd0Dir" />
          </h2>
          <p className={clsx('mr-2 text-neutral-600', devhdd0Path ? 'font-mono' : 'italic')}>{devhdd0Path || t('noPathSelected')}</p>
          <button
            className="rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              try {
                const path = await window.api.selectDevhdd0Dir()
                if (!path) {
                  setWindowState({ disableButtons: false })
                  return
                }
                setUserConfigState({ devhdd0Path: path })
                setWindowState({ disableButtons: false })
              } catch (err) {
                if (err instanceof Error) setWindowState({ unhandledException: err })
              }
            }}
          >
            {t('select')}
          </button>
        </div>
        <p className="mb-4 text-neutral-600 italic">
          <TransComponent i18nKey="devhdd0DirDesc" />
        </p>
        <div className="mb-2 flex-row! items-center border-b border-white/20 pb-1">
          <h2 className="mr-auto">
            <TransComponent i18nKey="rpcs3Exe" />
          </h2>
          <p className={clsx('mr-2 text-neutral-600', rpcs3ExePath ? 'font-mono' : 'italic')}>{rpcs3ExePath || t('noPathSelected')}</p>
          <button
            className="rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              try {
                const path = await window.api.selectRPCS3Exe()
                if (!path) {
                  setWindowState({ disableButtons: false })
                  return
                }
                setUserConfigState({ rpcs3ExePath: path })
                setWindowState({ disableButtons: false })
              } catch (err) {
                if (err instanceof Error) setWindowState({ unhandledException: err })
              }
            }}
          >
            {t('select')}
          </button>
        </div>
        <p className="text-neutral-600 italic">
          <TransComponent i18nKey="rpcs3ExeDesc" />
        </p>
        <AnimatedDiv condition={Boolean(devhdd0Path && rpcs3ExePath)} {...animate({ height: true, scaleY: true, opacity: true })}>
          <div className="h-4 w-full" />
          <button
            className="w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const newConfig: Partial<UserConfigObject> = {
                devhdd0Path,
                rpcs3ExePath,
                mostPlayedDifficulty: 3,
                mostPlayedInstrument: 'band',
              }
              await window.api.saveUserConfigFile(newConfig)

              setInitScreen({ InitScreen: false })
              setFirstTimeScreen({ FirstTimeScreen: false })
              setWindowState({ disableButtons: false })
            }}
          >
            {t('continue')}
          </button>
        </AnimatedDiv>
        <div className="mt-auto h-4 w-full flex-row! items-center">
          <h2 className="mr-4 text-xs">{t('changeLang')}</h2>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', i18n.language === 'en-US' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('en-US')}>
            <img src={USAFlag} width={12} className="mr-2" />
            <h1>{t('en-US')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', i18n.language === 'pt-BR' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('pt-BR')}>
            <img src={BRAFlag} width={12} className="mr-2" />
            <h1>{t('pt-BR')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', i18n.language === 'es-ES' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('es-ES')}>
            <img src={MEXFlag} width={12} className="mr-2" />
            <h1>{t('es-LA')}</h1>
          </button>
        </div>
      </div>
    </AnimatedSection>
  )
}
