import { USAFlag, BRAFlag, SPNFlag } from '@renderer/assets/images'
import { AnimatedDiv, genAnim, TransComponent } from '@renderer/lib'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import { useWindowState } from '@renderer/states/WindowState'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

export function ConfigurationScreen() {
  const { i18n, t } = useTranslation()
  const mainWindowSelectionIndex = useWindowState((state) => state.mainWindowSelectionIndex)
  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
  const disableButtons = useWindowState((state) => state.disableButtons)

  const setWindowState = useWindowState((state) => state.setWindowState)
  const setUserConfigState = useUserConfigState((state) => state.setUserConfigState)
  const getUserConfigState = useUserConfigState((state) => state.getUserConfigState)
  return (
    <>
      <AnimatedDiv id="ConfigurationScreen" condition={mainWindowSelectionIndex === 1} {...genAnim({ opacity: true, duration: 0.1 })} className="absolute! h-full w-full overflow-hidden p-6">
        <div className="mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
          <h1>{t('lang')}</h1>
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
            <button className={clsx('mr-2 flex-row! items-center rounded-xs px-2 py-1 font-sans! text-xs! duration-200 last:mr-0', i18n.language === 'es-ES' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} onClick={() => i18n.changeLanguage('es-ES')}>
              <img src={SPNFlag} width={12} className="mr-2" />
              <h1>{t('es-ES')}</h1>
            </button>
          </div>
        </div>
        <div className="group mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
          <h1>{t('devhdd0Folder')}</h1>
          <p className="mb-4 text-neutral-600 italic">
            <TransComponent i18nKey="devhdd0FolderDesc" />
          </p>
          <div className="mb-2 bg-neutral-900 px-3 py-1 duration-200 group-hover:bg-neutral-800">
            <p className="font-mono">{devhdd0Path}</p>
          </div>
          <button
            className="mb-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const path = await window.api.rpcs3.selectDevhdd0Folder()
              if (!path) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ devhdd0Path: path })
              const newConfig = getUserConfigState()
              await window.api.fs.userConfig.saveUserConfig(newConfig)
              setWindowState({ disableButtons: false, msgObject: { type: 'success', method: 'changeDevhdd0Folder', code: 'success', module: 'dom' } })
            }}
          >
            {t('change')}
          </button>
        </div>
        <div className="group mb-2 rounded-xs p-3 duration-200 last:mb-0 hover:bg-white/5">
          <h1>{t('rpcs3Exe')}</h1>
          <p className="mb-4 text-neutral-600 italic">
            <TransComponent i18nKey="rpcs3ExeDesc" />
          </p>
          <div className="mb-2 bg-neutral-900 px-3 py-1 duration-200 group-hover:bg-neutral-800">
            <p className="font-mono">{rpcs3ExePath}</p>
          </div>
          <button
            className="mb-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const path = await window.api.rpcs3.selectRPCS3Exe()
              if (!path) {
                setWindowState({ disableButtons: false })
                return
              }
              setUserConfigState({ rpcs3ExePath: path })
              const newConfig = getUserConfigState()
              await window.api.fs.userConfig.saveUserConfig(newConfig)
              setWindowState({ disableButtons: false, msgObject: { type: 'success', method: 'changeRPCS3ExeFile', code: 'success', module: 'dom' } })
            }}
          >
            {t('change')}
          </button>
        </div>
      </AnimatedDiv>
    </>
  )
}
