import { useTranslation } from 'react-i18next'
import { useExportPackageModalState } from './ExportPackageModal.state'
import { useShallow } from 'zustand/shallow'
import { AnimatedSection, animate } from '@renderer/lib.exports'
import { useMemo } from 'react'
import { useWindowState } from '@renderer/stores/Window.state'
import clsx from 'clsx'

export function ExportPackageModal() {
  const { t } = useTranslation()

  const { selPKGToExport, destPath, resetExportPackageModalState, setExportPackageModalState } = useExportPackageModalState(useShallow((x) => ({ selPKGToExport: x.selPKGToExport, resetExportPackageModalState: x.resetExportPackageModalState, setExportPackageModalState: x.setExportPackageModalState, destPath: x.destPath })))
  const { packages, disableImg, disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ packages: x.packages, disableImg: x.disableImg, disableButtons: x.disableButtons, setWindowState: x.setWindowState })))

  const active = useMemo(() => (typeof packages === 'object' && selPKGToExport > -1 && selPKGToExport in packages.packages ? packages.packages[selPKGToExport] : null), [selPKGToExport, packages])

  return (
    <AnimatedSection id="ExportPackageModal" condition={selPKGToExport > -1} {...animate({ opacity: true })} className="absolute! z-6 h-full w-full items-center justify-center bg-black p-48">
      {active !== null && (
        <>
          <div className="w-full flex-row! rounded-sm border border-white/10 p-3">
            <img src={disableImg === selPKGToExport ? undefined : active.thumbnailSrc} className="mr-6 h-64 min-h-64 w-64 min-w-64 border-2 border-neutral-700" />
            <div className="w-full">
              <h1 className="text-xl text-green-700 uppercase">{t('exportPackage')}</h1>
              <h2 className="font-pentatonic mb-4 text-3xl">{active.packageData.packageName}</h2>
              <div className="mb-4 flex-row! items-center">
                <div className="mr-2 h-full w-full justify-center rounded-xs border-neutral-800 bg-neutral-900 p-1 duration-100">
                  <p className={clsx(destPath !== null ? 'font-mono text-neutral-400' : 'italic text-neutral-600')}>{destPath === null ? t('noPathSelected') : destPath}</p>
                </div>
                <button
                  disabled={disableButtons}
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    try {
                      const exportPackagePath = await window.api.selectPathToSaveRB3File()
                      if (!exportPackagePath) {
                        setWindowState({ disableButtons: false })
                        return
                      }
                      setExportPackageModalState({ destPath: exportPackagePath })
                      setWindowState({ disableButtons: false })
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ err })
                    }
                  }}
                  className="rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                >
                  {t('select')}
                </button>
              </div>
              <div className="flex-row! items-center">
                <button
                  disabled={disableButtons || destPath === null}
                  className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    if (destPath !== null) {
                      try {
                        const aaa = await window.api.exportPackage(active.path, destPath, { author: 'Homerras' })
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ err })
                      }
                    }
                  }}
                >
                  {t('export')}
                </button>
                <button
                  disabled={disableButtons}
                  className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    resetExportPackageModalState()
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
