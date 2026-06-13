import { AnimatedSection, animate } from '@renderer/lib.exports'
import { useTranslation } from 'react-i18next'
import { useAboutScreenState } from './AboutScreen.state'
import { useShallow } from 'zustand/shallow'
import { useWindowState } from '@renderer/stores/Window.state'
import { APP_VERSION } from '@renderer/app/rockshelf.globals'
import { aloquendiar, carlmylo, ganso, mrbean, ruggy } from '@renderer/assets/images'

export function AboutScreen() {
  const { t } = useTranslation()
  const { active, resetAboutScreenState } = useAboutScreenState(useShallow((x) => ({ active: x.active, resetAboutScreenState: x.resetAboutScreenState })))
  const { disableButtons } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons })))
  return (
    <AnimatedSection id="AboutScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black p-8">
      <div className="h-full w-full overflow-y-auto">
        <div className="mb-4 flex-row! items-center">
          <img src="rbicons://website" className="mr-2 h-12 w-12 rounded-sm" />
          <div className="mr-auto">
            <h1 className="text-xl uppercase">{t('appTitle')}</h1>
            <h2 className="">{t('appDesc')}</h2>
          </div>
          <button
            disabled={disableButtons}
            className="mb-1 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! text-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              resetAboutScreenState()
            }}
          >
            {t('close')}
          </button>
        </div>

        <h3 className="font-pentatonic mb-2 border-b border-white/25 pb-1 uppercase">{t('buildInfo')}</h3>
        <div className="mb-4 last:mb-0">
          <p>Rockshelf: v{APP_VERSION}</p>
          <p>Electron: v{window.electron.process.versions.electron}</p>
          <p>Node: v{window.electron.process.versions.node}</p>
          <p>Chromium: v{window.electron.process.versions.chrome}</p>
        </div>

        <h3 className="font-pentatonic mb-2 border-b border-white/25 pb-1 uppercase">{t('creator')}</h3>
        <div className="mb-4 flex-row! items-center last:mb-0">
          <img src={ruggy} className="mr-2 h-12 w-12 rounded-sm" />
          <div>
            <h1 className="mb-1 text-lg">Ruggy</h1>
            <div className="flex-row! items-center"></div>
          </div>
        </div>

        <h3 className="font-pentatonic mb-2 border-b border-white/25 pb-1 uppercase">{t('translationRevTeam')}</h3>
        <div className="mb-4 last:mb-0">
          <div className="mb-1 flex-row! items-center">
            <img src={ganso} className="mr-2 h-14 w-14 rounded-sm" />
            <div>
              <h1 className="text-lg">Ganso</h1>
              <p>{`${t('pt-BR')}`}</p>
            </div>
          </div>
          <div className="mb-1 flex-row! items-center">
            <img src={carlmylo} className="mr-2 h-14 w-14 rounded-sm" />
            <div>
              <h1 className="text-lg">CarlMylo</h1>
              <p>{`${t('en-US')} - ${t('es-419')}`}</p>
            </div>
          </div>
          <div className="mb-1 flex-row! items-center">
            <img src={aloquendiar} className="mr-2 h-14 w-14 rounded-sm" />
            <div>
              <h1 className="text-lg">Aloquendiar (Axo)</h1>
              <p>{`${t('es-419')}`}</p>
            </div>
          </div>
          <div className="mb-1 flex-row! items-center">
            <img src={mrbean} className="mr-2 h-14 w-14 rounded-sm" />
            <div>
              <h1 className="text-lg">MrBean</h1>
              <p>{`${t('fr-CA')}`}</p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  )
}
