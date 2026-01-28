import { RockBand3 } from '@renderer/core'
import { useWindowState } from '@renderer/states/WindowState'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

export function MainScreen() {
  const { t } = useTranslation()

  const mainWindowSelectionIndex = useWindowState((state) => state.mainWindowSelectionIndex)

  const setWindowState = useWindowState((state) => state.setWindowState)
  return (
    <section id="MainScreen" className="h-full w-full flex-row! items-center">
      <div className="h-full w-[20%] min-w-[20%] border-r-2 border-white/10 bg-neutral-900">
        <button className={clsx('py-2 duration-100', mainWindowSelectionIndex === 0 ? 'bg-neutral-400 text-neutral-800 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600')} onClick={() => setWindowState({ mainWindowSelectionIndex: 0 })}>
          {t('rockBand3Title')}
        </button>
        <button className={clsx('py-2 duration-100', mainWindowSelectionIndex === 1 ? 'bg-neutral-400 text-neutral-800 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600')} onClick={() => setWindowState({ mainWindowSelectionIndex: 1 })}>
          {t('rockBand3Title')}
        </button>
      </div>
      <div className="w-fill h-full">
        <RockBand3 />
      </div>
    </section>
  )
}
