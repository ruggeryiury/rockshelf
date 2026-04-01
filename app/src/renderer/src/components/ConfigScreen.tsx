import { AnimatedSection, TransComponent, animate } from '@renderer/lib.exports'
import { useConfigScreenState } from './ConfigScreen.state'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useMessageBoxState } from './MessageBox.state'
import { RockBand3Data } from 'rbtools/lib'
import clsx from 'clsx'
import { BRAFlag, MEXFlag, USAFlag, ARGFlag, BOLFlag, COLFlag, PARYFlag, PERUFlag, URUFlag, VEZFlag } from '@renderer/assets/images'

export function ConfigScreen() {
  const { i18n, t } = useTranslation()
  const active = useConfigScreenState((x) => x.active)
  const resetConfigScreenState = useConfigScreenState((x) => x.resetConfigScreenState)
  const devhdd0Path = useUserConfigState((x) => x.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((x) => x.rpcs3ExePath)
  const disableButtons = useWindowState((x) => x.disableButtons)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setUserConfigState = useUserConfigState((x) => x.setUserConfigState)
  const getUserConfigState = useUserConfigState((x) => x.getUserConfigState)
  const setMessageBoxState = useMessageBoxState((x) => x.setMessageBoxState)
  return (
    <AnimatedSection id="ConfigScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('configurations')}</h1>
        <button
          disabled={disableButtons}
          className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            resetConfigScreenState()
          }}
        >
          {t('goBack')}
        </button>
      </div>
      <div className="group mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
        <h1 className="mb-1 uppercase">{t('devhdd0Dir')}</h1>
        <p className="mb-4 text-xs italic">
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
              const newRB3Stats = (await window.api.rpcs3GetRB3Stats()) as RockBand3Data
              setWindowState({ disableButtons: false, rb3Stats: newRB3Stats })
              setMessageBoxState({ message: { type: 'success', method: 'selectDevhdd0Dir', code: '' } })
            } catch (err) {
              if (err instanceof Error) setWindowState({ err })
            }
          }}
        >
          {t('change')}
        </button>
      </div>
      <div className="group mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
        <h1 className="mb-1 uppercase">{t('rpcs3Exe')}</h1>
        <p className="mb-4 text-xs italic">
          <TransComponent i18nKey="rpcs3ExeDesc" />
        </p>
        <div className="mb-2 bg-neutral-900 px-3 py-1 duration-200 group-hover:bg-neutral-800">
          <p className="font-mono">{rpcs3ExePath}</p>
        </div>
        <button
          className="mb-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
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
              setMessageBoxState({ message: { type: 'success', method: 'changeRPCS3ExeFile', code: '' } })
            } catch (err) {
              if (err instanceof Error) setWindowState({ err })
            }
          }}
        >
          {t('change')}
        </button>
      </div>
      <div className="group mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
        <h1 className="mb-1 uppercase">{t('changeLang')}</h1>
        <p className="mb-4 text-xs italic">
          <TransComponent i18nKey="changeLangDesc" />
        </p>
        <div className="flex-row! items-center">
          <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', i18n.language === 'en-US' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('en-US')}>
            <img src={USAFlag} width={12} className="mr-2" />
            <h1>{t('en-US')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', i18n.language === 'pt-BR' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('pt-BR')}>
            <img src={BRAFlag} width={12} className="mr-2" />
            <h1>{t('pt-BR')}</h1>
          </button>
          <button className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', i18n.language === 'es-419' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('es-419')}>
            <img src={ARGFlag} width={12} className="mr-2" />
            <img src={BOLFlag} width={12} className="mr-2" />
            <img src={COLFlag} width={12} className="mr-2" />
            <img src={MEXFlag} width={12} className="mr-2" />
            <img src={PERUFlag} width={12} className="mr-2" />
            <img src={PARYFlag} width={12} className="mr-2" />
            <img src={URUFlag} width={12} className="mr-2" />
            <img src={VEZFlag} width={12} className="mr-2" />
            <h1>{t('es-419')}</h1>
          </button>
        </div>
      </div>
    </AnimatedSection>
  )
}
