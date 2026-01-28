import { RockBand3 } from '@renderer/core'
import { useWindowState } from '@renderer/states/WindowState'
import { useTranslation } from 'react-i18next'

export function MainScreen() {
  const { t } = useTranslation()
  const setWindowState = useWindowState((state) => state.setWindowState)
  return (
    <section id="MainScreen" className="h-full w-full flex-row! items-center">
      <div className="h-full w-[20%] border-r-2 border-white/10 bg-neutral-900 p-3">
        <button className="rounded-xs bg-neutral-800 py-0.5 hover:bg-neutral-700" onClick={() => setWindowState({ mainWindowSelectionIndex: 0 })}>
          {t('rockBand3Title')}
        </button>
      </div>
      <div className="w-fill h-full">
        <RockBand3 />
      </div>
    </section>
  )
}
