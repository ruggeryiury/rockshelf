import { useTranslation } from 'react-i18next'
import { useFirstTimeScreenState } from './FirstTimeScreen.state'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { animate, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import clsx from 'clsx'
import { BRAFlag, MEXFlag, USAFlag } from '@renderer/assets/images'

export function FirstTimeScreen() {
  const { i18n, t } = useTranslation()
  const active = useFirstTimeScreenState((x) => x.active)
  const devhdd0Path = useUserConfigState((x) => x.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((x) => x.rpcs3ExePath)
  const setUserConfigState = useUserConfigState((x) => x.setUserConfigState)
  const disableButtons = useWindowState((x) => x.disableButtons)
  const setWindowState = useWindowState((x) => x.setWindowState)
  return (
    <AnimatedSection condition={active} {...animate({ opacity: true })} id="FirstTimeScreen" className="absolute! z-3 h-full w-full bg-black/90 p-8 backdrop-blur-lg">
      <div className="mb-2 border-b border-white/25 pb-1">
        <h1 className="text-[2rem] uppercase font-pentatonicalt!">{t('firstTimeScreenWelcome')}</h1>
      </div>
      <p className="mb-4">
        <TransComponent i18nKey="firstTimeScreenText" />
      </p>
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="mr-auto text-[1.25rem] uppercase">{t('devhdd0Dir')}</h1>
        <p className={clsx('mr-2 text-neutral-600', devhdd0Path ? 'font-mono' : 'italic')}>{devhdd0Path || t('noPathSelected')}</p>
        <button
          disabled={disableButtons}
          onClick={async () => {
            setWindowState({ disableButtons: true })
            try {
              const selectedDevhdd0Path = await window.api.selectDevhdd0Dir()
              if (!selectedDevhdd0Path) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ devhdd0Path: selectedDevhdd0Path })
              setWindowState({ disableButtons: false })
            } catch (err) {
              if (err instanceof Error) setWindowState({})
            }
          }}
          className="rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
        >
          {t('select')}
        </button>
      </div>
      <p className="mb-4 text-xs! text-neutral-600 italic">
        <TransComponent i18nKey="devhdd0DirDesc" />
      </p>

      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="mr-auto text-[1.25rem] uppercase">{t('rpcs3Exe')}</h1>
        <p className={clsx('mr-2 text-neutral-600', rpcs3ExePath ? 'font-mono' : 'italic')}>{rpcs3ExePath || t('noPathSelected')}</p>
        <button
          disabled={disableButtons}
          onClick={async () => {
            setWindowState({ disableButtons: true })
            try {
              const selectedRPCS3Exe = await window.api.selectRPCS3Exe()
              if (!selectedRPCS3Exe) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ rpcs3ExePath: selectedRPCS3Exe })
              setWindowState({ disableButtons: false })
            } catch (err) {
              if (err instanceof Error) setWindowState({})
            }
          }}
          className="rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
        >
          {t('select')}
        </button>
      </div>
      <p className="mb-4 text-xs! text-neutral-600 italic">
        <TransComponent i18nKey="rpcs3ExeDesc" />
      </p>

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
    </AnimatedSection>
  )
}
