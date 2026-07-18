import { AnimatedSection, animate } from '@renderer/lib.exports'
import { useEditAllSongsScreenState } from './EditAllSongsScreen.state'
import { useShallow } from 'zustand/shallow'
import { useMemo } from 'react'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'

export function EditAllSongsScreen() {
  const { t } = useTranslation()
  const { selectedPackage, setEditAllSongsScreenState } = useEditAllSongsScreenState(useShallow((x) => ({ selectedPackage: x.selectedPackage, setEditAllSongsScreenState: x.setEditAllSongsScreenState })))
  const { packages, disableButtons } = useWindowState(useShallow((x) => ({ packages: x.packages, disableButtons: x.disableButtons })))

  const active = useMemo(() => typeof packages === 'object' && selectedPackage > -1 && selectedPackage in packages.packages && packages.packages[selectedPackage], [packages, selectedPackage])
  return (
    <AnimatedSection id="EditAllSongsScreen" condition={typeof active === 'object'} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black p-8">
      {active && (
        <>
          <div className="flex-row! items-center border-b border-white/15 pb-2">
            <img src={active.thumbnailSrc || 'rbicons://website'} className="mr-2 h-32 min-h-32 w-32 min-w-32 border-2 border-neutral-700" />

            <div className="mr-auto h-full">
              <h1 className="font-pentatonicalt! mb-2 text-[2rem]">{t('editingPackageTitle', { packageName: active.packageData.packageName })}</h1>
            </div>
            <button
              disabled={disableButtons}
              className="ml-6 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                setEditAllSongsScreenState({ selectedPackage: -1 })
              }}
            >
              {t('goBack')}
            </button>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
