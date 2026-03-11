import { animate, AnimatedSection } from '@renderer/lib.exports'
import { useMainScreenState } from '@renderer/stores/MainScreen.store'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

export function MainScreen({ children }: React.PropsWithChildren) {
  const { t } = useTranslation()

  const selectedNavigatorIndex = useMainScreenState((state) => state.selectedNavigatorIndex)
  const setMainScreen = useMainScreenState((state) => state.setMainScreen)

  const isActivated = useMainScreenState((state) => state.MainScreen)

  return (
    <AnimatedSection condition={isActivated} {...animate({ opacityInit: true })} id="MainScreen" className="h-full w-full flex-row! items-center">
      <div id='MainScreenNavigator' className="h-full w-[17.5%] min-w-[17.5%] border-r-2 border-white/10 bg-neutral-900">
        <button className={clsx('uppercase px-2 py-2 text-start text-sm! duration-100', selectedNavigatorIndex === 0 ? 'bg-neutral-400 text-neutral-800 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600')} onClick={() => setMainScreen({ selectedNavigatorIndex: 0 })}>
          {t('rockBand3Title')}
        </button>
        <button className={clsx('uppercase px-2 py-2 text-start text-sm! duration-100', selectedNavigatorIndex === 1 ? 'bg-neutral-400 text-neutral-800 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600')} onClick={() => setMainScreen({ selectedNavigatorIndex: 1 })}>
          {t('yourPackages')}
        </button>
        <button className={clsx('uppercase px-2 py-2 text-start text-sm! duration-100', selectedNavigatorIndex === 2 ? 'bg-neutral-400 text-neutral-800 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600')} onClick={() => setMainScreen({ selectedNavigatorIndex: 2 })}>
          {t('config')}
        </button>
      </div>
      <div id='MainScreenFrame' className="w-fill h-full" >{children}</div>
    </AnimatedSection>
  )
}
