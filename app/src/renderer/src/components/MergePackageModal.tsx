import { AnimatedDiv, AnimatedSection, animate } from '@renderer/lib.exports'
import { useMergePackageModalState } from './MergePackageModal.state'
import { useShallow } from 'zustand/shallow'
import { useEffect, useMemo, useRef } from 'react'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { ChevronDownIcon } from '@renderer/assets/icons'
import { useMessageBoxState } from './MessageBox.state'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'

export function MergePackageModal() {
  const { t } = useTranslation()
  const { packages, disableImg, disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ packages: x.packages, disableImg: x.disableImg, disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { selPKG, index, isPackageDropdownEnabled, setMergePackageModalState, resetMergePackageModalState } = useMergePackageModalState(useShallow((x) => ({ selPKG: x.selPKG, index: x.index, isPackageDropdownEnabled: x.isPackageDropdownEnabled, setMergePackageModalState: x.setMergePackageModalState, resetMergePackageModalState: x.resetMergePackageModalState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { setMyPackagesScreenState } = useMyPackagesScreenState(useShallow((x) => ({ setMyPackagesScreenState: x.setMyPackagesScreenState })))

  const active = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages ? packages.packages[selPKG] : null), [selPKG, packages])
  const filteredPackages = useMemo(
    () =>
      typeof packages === 'object' &&
      active !== null &&
      packages.packages
        .map((pkg, pkgIndex) => ({ ...pkg, index: pkgIndex }))
        .sort((a, b) => a.packageData.packageName.toLowerCase().localeCompare(b.packageData.packageName.toLowerCase()))
        .filter((pkg) => !pkg.official && pkg.contentsHash !== active.contentsHash),
    [packages, selPKG]
  )
  const selectedPackage = useMemo(() => (typeof packages === 'object' && index > -1 && index in packages.packages ? packages.packages[index] : null), [packages, index])

  const selectorDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (selectorDivRef.current && selectorDivRef.current.contains(event.target as Node | null)) {
        return
      }

      if (isPackageDropdownEnabled) setMergePackageModalState({ isPackageDropdownEnabled: false })
    }

    document.addEventListener('mousedown', handleGlobalClick)
    return () => document.removeEventListener('mousedown', handleGlobalClick)
  }, [selectorDivRef, isPackageDropdownEnabled])

  return (
    <AnimatedSection id="MergePackageModal" condition={active !== null} {...animate({ opacity: true })} className="absolute! z-5 h-full w-full items-center justify-center bg-black p-48">
      {active !== null && (
        <>
          <div className="w-full flex-row! rounded-sm border border-white/10 p-3">
            <img src={disableImg === selPKG ? undefined : active.thumbnailSrc} className="mr-6 h-64 min-h-64 w-64 min-w-64 border-2 border-neutral-700" />
            <div className="w-full">
              <h1 className="text-xl text-green-700 uppercase">{t('merge')}</h1>
              <h2 className="font-pentatonic mb-4 text-3xl">{active.packageData.packageName}</h2>

              <h1 className="mb-1 text-xl uppercase">{t('mergeIntoText')}</h1>
              <div className="mb-6 w-full" ref={selectorDivRef}>
                <button onClick={() => setMergePackageModalState({ isPackageDropdownEnabled: !isPackageDropdownEnabled })} className={clsx('w-full flex-row! items-start border border-white/10 p-1 text-start hover:border-white/20 active:border-white/45', isPackageDropdownEnabled ? 'rounded-t-sm' : 'rounded-sm')}>
                  {index === -1 && (
                    <div className="flex-row! items-center">
                      <div className="mr-2 h-9 min-h-9 w-9 min-w-9 bg-transparent" />
                      <h1 className="text-start text-neutral-500">{t('noPackageSelected')}</h1>
                    </div>
                  )}
                  {selectedPackage !== null && (
                    <div className="flex-row!">
                      <img src={selectedPackage.thumbnailSrc} className="mr-2 h-9 min-h-9 w-9 min-w-9" />
                      <div>
                        <h1 className="text-start normal-case">{selectedPackage.packageData.packageName}</h1>
                        <p className="text-start font-mono normal-case">{selectedPackage.path.split('game\\')[1]}</p>
                      </div>
                    </div>
                  )}

                  <ChevronDownIcon className={clsx('ml-auto self-center text-xl', isPackageDropdownEnabled && 'rotate-90')} />
                </button>
                <AnimatedDiv condition={isPackageDropdownEnabled && filteredPackages !== false} {...animate({ opacity: true })} className="absolute! top-full z-11 max-h-64 min-h-64 w-full origin-top overflow-y-auto rounded-b-sm border border-white/10 bg-black/90 p-1">
                  {filteredPackages !== false &&
                    filteredPackages.map((pkg) => {
                      return (
                        <button
                          className={clsx('flex-row! items-center p-2 normal-case! duration-100', index === pkg.index ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'hover:bg-white/10')}
                          key={`pkgMerge${pkg.index}`}
                          onClick={() => {
                            setMergePackageModalState({ index: pkg.index, isPackageDropdownEnabled: false })
                          }}
                        >
                          <img src={pkg.thumbnailSrc} className="mr-2 h-9 min-h-9 w-9 min-w-9" />
                          <div>
                            <h1 className="text-start">{pkg.packageData.packageName}</h1>
                            <p className="text-start font-mono normal-case">{pkg.path.split('game\\')[1]}</p>
                          </div>
                        </button>
                      )
                    })}
                </AnimatedDiv>
              </div>
              <div className="flex-row! items-center">
                <button
                  disabled={disableButtons || index < 0}
                  className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    if (typeof packages === 'object') {
                      setWindowState({ disableButtons: true })
                      setMessageBoxState({ message: { type: 'loading', code: 'mergePackages', messageValues: { toBeMergedPackageName: packages.packages[selPKG].packageData.packageName, mainPackageName: packages.packages[index].packageData.packageName } } })

                      try {
                        const newPackages = await window.api.mergePackages(selPKG, index)
                        if (newPackages) {
                          resetMergePackageModalState()
                          setMyPackagesScreenState({ packagesCatalog: false })
                          setWindowState({ packages: newPackages })
                          setMessageBoxState({ message: { type: 'success', code: 'mergePackages' } })
                        }
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ err })
                      }

                      setWindowState({ disableButtons: false })
                    }
                  }}
                >
                  {t('merge')}
                </button>
                <button
                  disabled={disableButtons}
                  className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    resetMergePackageModalState()
                  }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
