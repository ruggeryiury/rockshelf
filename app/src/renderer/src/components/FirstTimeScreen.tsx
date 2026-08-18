import { useTranslation } from 'react-i18next'
import { useFirstTimeScreenState } from './FirstTimeScreen.state'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { animate, AnimatedButton, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import clsx from 'clsx'
import { ARGFlag, BRAFlag, COLFlag, FCAFlag, MEXFlag, USAFlag } from '@renderer/assets/images'
import { useLogoScreenState } from './LogoScreen.state'
import { useShallow } from 'zustand/shallow'
import { useMessageBoxState } from './MessageBox.state'
import { STRUCT_LOG } from '@renderer/app/rockshelf.globals'

export function FirstTimeScreen() {
  const { i18n, t } = useTranslation()
  const { active } = useFirstTimeScreenState(useShallow((x) => ({ active: x.active })))
  const { devhdd0Path, rpcs3ExePath, setUserConfigState } = useUserConfigState(useShallow((x) => ({ devhdd0Path: x.devhdd0Path, rpcs3ExePath: x.rpcs3ExePath, setUserConfigState: x.setUserConfigState })))
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { setFirstTimeScreenState } = useFirstTimeScreenState(useShallow((x) => ({ setFirstTimeScreenState: x.setFirstTimeScreenState })))
  const { setLogoScreenState } = useLogoScreenState(useShallow((x) => ({ setLogoScreenState: x.setLogoScreenState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))

  return (
    <AnimatedSection id="FirstTimeScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-3 h-full w-full bg-black p-8">
      <div className="mb-2 border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! text-[2rem] uppercase">{t('firstTimeScreenWelcome')}</h1>
      </div>
      <p className="mb-8 text-xs">
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
              const selectedDevhdd0Path = await window.api.selector.devhdd0()
              if (!selectedDevhdd0Path) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ devhdd0Path: selectedDevhdd0Path })
              setWindowState({ disableButtons: false })
            } catch (err) {
              if (err instanceof Error) setWindowState({ err })
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
              const selectedRPCS3Exe = await window.api.selector.rpcs3Exe()
              if (!selectedRPCS3Exe) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ rpcs3ExePath: selectedRPCS3Exe })
              setWindowState({ disableButtons: false })
            } catch (err) {
              if (err instanceof Error) setWindowState({ err })
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
      <AnimatedButton
        condition={Boolean(devhdd0Path) && Boolean(rpcs3ExePath)}
        disabled={disableButtons}
        {...animate({ opacity: true, height: true, scaleY: true })}
        onClick={async () => {
          setWindowState({ disableButtons: true })
          setMessageBoxState({ message: { type: 'loading', code: 'firstTimeData' } })
          try {
            const userConfigStatus = await window.api.userConfig.save({
              devhdd0Path,
              rpcs3ExePath,
            })
            if (STRUCT_LOG) console.log('struct UserConfigObject ["core/src/core/api/UserDataAPI.ts"]:', userConfigStatus)
            setUserConfigState({ ...userConfigStatus })

            const initialState = await window.api.data.getInitialState()
            if (STRUCT_LOG) console.log('struct InitialStateObject ["core/src/core/api/DataSyncAPI.ts"]:', initialState)

            setWindowState({
              ...initialState,
              disableButtons: false,
            })

            setMessageBoxState({ message: null })
            setLogoScreenState({ active: false })
            setFirstTimeScreenState({ active: false })
          } catch (err) {
            if (err instanceof Error) setWindowState({ err })
          }
        }}
        className="w-fit origin-top rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
      >
        {t('continue')}
      </AnimatedButton>

      <div className="mt-auto h-4 w-full flex-row! items-center">
        <h2 className="mr-4 text-xs">{t('changeLang')}</h2>
        <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', i18n.language === 'en-US' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('en-US')}>
          <img src={USAFlag} width={12} className="mr-2" />
          <h1>{t('en-US')}</h1>
        </button>
        <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', i18n.language === 'pt-BR' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('pt-BR')}>
          <img src={BRAFlag} width={12} className="mr-2" />
          <h1>{t('pt-BR')}</h1>
        </button>
        <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', i18n.language === 'es-419' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('es-419')}>
          <img src={ARGFlag} width={12} className="mr-2" />
          <img src={COLFlag} width={12} className="mr-2" />
          <img src={MEXFlag} width={12} className="mr-2" />
          <h1>{t('es-419')}</h1>
        </button>
        {/* <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', i18n.language === 'fr-CA' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('fr-CA')}>
          <img src={FCAFlag} width={12} className="mr-2" />
          <h1>{t('fr-CA')}</h1>
        </button> */}
      </div>
    </AnimatedSection>
  )
}
