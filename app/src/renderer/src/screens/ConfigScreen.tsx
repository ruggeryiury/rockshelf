import { USAFlag, BRAFlag, MEXFlag } from '@renderer/assets/images'
import { animate, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useMainScreenState } from '@renderer/stores/MainScreen.store'
import { useMessageModalScreenState } from '@renderer/stores/MessageModalScreen'
import { useUserConfigState } from '@renderer/stores/UserConfig.store'
import { useWindowState } from '@renderer/stores/Window.store'
import clsx from 'clsx'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function ConfigScreen() {
  const { i18n, t } = useTranslation()

  const devhdd0Path = useUserConfigState((x) => x.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((x) => x.rpcs3ExePath)
  const disableButtons = useWindowState((x) => x.disableButtons)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setUserConfigState = useUserConfigState((x) => x.setUserConfigState)
  const setMessageModalScreen = useMessageModalScreenState((x) => x.setMessageModalScreen)
  const getUserConfigState = useUserConfigState((x) => x.getUserConfigState)

  const selectedNavigatorIndex = useMainScreenState((x) => x.selectedNavigatorIndex)
  const isActivated = useMemo(() => selectedNavigatorIndex === 2, [selectedNavigatorIndex])
  return (
    <AnimatedSection condition={isActivated} id="ConfigScreen" className="absolute! h-full w-full overflow-hidden p-6" {...animate({opacity: true})}>
      <div className="mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
        <h1 className='text-lg mb-1 uppercase'>{t('lang')}</h1>
        <p className="mb-3 text-neutral-600 italic">
          <TransComponent i18nKey="configLangDesc" />
        </p>
        <div className="flex-row! items-center">
          <button className={clsx('mr-2 flex-row! items-center rounded-xs px-2 py-1 font-sans! text-xs! duration-200 last:mr-0', i18n.language === 'en-US' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('en-US')}>
            <img src={USAFlag} width={12} className="mr-2" />
            <h1>{t('en-US')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs px-2 py-1 font-sans! text-xs! duration-200 last:mr-0', i18n.language === 'pt-BR' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('pt-BR')}>
            <img src={BRAFlag} width={12} className="mr-2" />
            <h1>{t('pt-BR')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs px-2 py-1 font-sans! text-xs! duration-200 last:mr-0', i18n.language === 'es-LA' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('es-LA')}>
            <img src={MEXFlag} width={12} className="mr-2" />
            <h1>{t('es-LA')}</h1>
          </button>
        </div>
      </div>
      <div className="group mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
        <h1 className='text-lg mb-1 uppercase'>{t('devhdd0Dir')}</h1>
        <p className="mb-4 text-neutral-600 italic">
          <TransComponent i18nKey="devhdd0DirDesc" />
        </p>
        <div className="mb-2 bg-neutral-900 px-3 py-1 duration-200 group-hover:bg-neutral-800">
          <p className="font-mono">{devhdd0Path}</p>
        </div>
        <button
          className="mb-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
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
              const newConfig = getUserConfigState()
              await window.api.saveUserConfigFile(newConfig)
              setWindowState({ disableButtons: false })
              setMessageModalScreen({ msgObject: { type: 'success', method: 'selectDevhdd0Dir', code: '' } })
            } catch (err) {
              if (err instanceof Error) setWindowState({ unhandledException: err })
            }
          }}
        >
          {t('change')}
        </button>
      </div>
      <div className="group mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
        <h1 className='text-lg mb-1 uppercase'>{t('rpcs3Exe')}</h1>
        <p className="mb-4 text-neutral-600 italic">
          <TransComponent i18nKey="rpcs3ExeDesc" />
        </p>
        <div className="mb-2 bg-neutral-900 px-3 py-1 duration-200 group-hover:bg-neutral-800">
          <p className="font-mono">{rpcs3ExePath}</p>
        </div>
        <button
          className="mb-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900 uppercase"
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
              const newConfig = getUserConfigState()
              await window.api.saveUserConfigFile(newConfig)
              setWindowState({ disableButtons: false })
              setMessageModalScreen({ msgObject: { type: 'success', method: 'changeRPCS3ExeFile', code: '' } })
            } catch (err) {
              if (err instanceof Error) setWindowState({ unhandledException: err })
            }
          }}
        >
          {t('change')}
        </button>
      </div>
    </AnimatedSection>
  )
}
