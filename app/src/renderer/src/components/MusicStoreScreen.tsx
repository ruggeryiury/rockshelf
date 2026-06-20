import { animate, AnimatedSection } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'
import { useMusicStoreScreenState } from './MusicStoreScreen.state'

export function MusicStoreScreen() {
  const { t } = useTranslation()
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { active, setMusicStoreScreenState } = useMusicStoreScreenState(useShallow((x) => ({ active: x.active, setMusicStoreScreenState: x.setMusicStoreScreenState })))

  return (
    <AnimatedSection condition={active} id="MusicStoreScreen" {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black p-8">
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('musicStore')}</h1>
        <button
          disabled={disableButtons}
          className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            setMusicStoreScreenState({ active: false })
          }}
        >
          {t('goBack')}
        </button>
      </div>
    </AnimatedSection>
  )
}
