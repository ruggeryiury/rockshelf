import { useTranslation } from 'react-i18next'
import { useExportPackageModalState } from './ExportPackageModal.state'
import { useShallow } from 'zustand/shallow'
import { AnimatedDiv, AnimatedSection, TransComponent, animate, underscoreToUppercaseLetter } from '@renderer/lib.exports'
import { useMemo } from 'react'
import { useWindowState } from '@renderer/stores/Window.state'
import clsx from 'clsx'
import { VALIDATORS } from '@renderer/app/rockshelf.globals'

export function ExportPackageModal() {
  const { t } = useTranslation()

  const { selPKGToExport, destPath, resetExportPackageModalState, setExportPackageModalState, packageCreatorName, packageCreatorNameError } = useExportPackageModalState(useShallow((x) => ({ selPKGToExport: x.selPKGToExport, resetExportPackageModalState: x.resetExportPackageModalState, setExportPackageModalState: x.setExportPackageModalState, destPath: x.destPath, packageCreatorName: x.packageCreatorName, packageCreatorNameError: x.packageCreatorNameError })))
  const { packages, disableImg, disableButtons, setWindowState, rb3Stats } = useWindowState(useShallow((x) => ({ packages: x.packages, disableImg: x.disableImg, disableButtons: x.disableButtons, setWindowState: x.setWindowState, rb3Stats: x.rb3Stats })))

  const active = useMemo(() => (typeof packages === 'object' && selPKGToExport > -1 && selPKGToExport in packages.packages ? packages.packages[selPKGToExport] : null), [selPKGToExport, packages])

  return (
    <AnimatedSection id="ExportPackageModal" condition={selPKGToExport > -1} {...animate({ opacity: true })} className="absolute! z-6 h-full w-full items-center justify-center bg-black p-48">
      {active !== null && (
        <>
          <div className="w-full flex-row! rounded-sm border border-white/10 p-3">
            <img src={disableImg === selPKGToExport ? undefined : active.thumbnailSrc} className="mr-6 h-64 min-h-64 w-64 min-w-64 border-2 border-neutral-700" />
            <div className="w-full">
              <h1 className="text-xl text-green-700 uppercase">{t('exportPackage')}</h1>
              <p className="mb-2 border-b border-white/15 pb-2">{t('exportPackageDesc')}</p>
              <h2 className="font-pentatonic mb-2 text-3xl">{active.packageData.packageName}</h2>

              <div className="mb-4 flex-row! items-center">
                <div className="mr-2 h-full w-full justify-center rounded-xs border-neutral-800 bg-neutral-900 p-1 duration-100">
                  <p className={clsx(destPath !== null ? 'font-mono text-neutral-400' : 'text-neutral-600 italic')}>{destPath === null ? t('noPathSelected') : destPath}</p>
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

              <div className="mb-1 flex-row! items-center">
                {/* <h1 className="mr-auto text-base uppercase">{t('packageCreatorName')}</h1> */}
                <div className="mr-auto flex-row! items-center">
                  <h1 className="mr-2 uppercase">{t('packageCreatorName')}</h1>
                  <h2 className={clsx('mr-auto text-xs font-semibold', packageCreatorNameError !== null && 'text-red-500/80')}>{`${packageCreatorName.length}/255`}</h2>
                </div>
                <button
                  disabled={disableButtons}
                  className="mr-1 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={() => {
                    setExportPackageModalState({ packageCreatorName: '', packageCreatorNameError: null })
                  }}
                >
                  {t('blank')}
                </button>
                {typeof rb3Stats === 'object' && rb3Stats.userName !== null && (
                  <button
                    disabled={disableButtons}
                    className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    onClick={() => {
                      setExportPackageModalState({ packageCreatorName: rb3Stats.userName ?? '', packageCreatorNameError: null })
                    }}
                  >
                    {rb3Stats.userName}
                  </button>
                )}
              </div>
              <input
                value={packageCreatorName}
                className={clsx('rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900', packageCreatorNameError && 'border-red-500!')}
                maxLength={255}
                onChange={async (ev) => {
                  const value = VALIDATORS.packageCreatorName.safeParse(ev.target.value)

                  if (!value.success) {
                    setExportPackageModalState({ packageCreatorName: ev.target.value, packageCreatorNameError: value.error.issues[0].message })
                  } else setExportPackageModalState({ packageCreatorName: value.data, packageCreatorNameError: null })
                }}
              />
              <AnimatedDiv condition={packageCreatorNameError !== null} {...animate({ height: true, scaleY: true, opacity: true })}>
                <div className="h-2" />
                {packageCreatorNameError !== null && <p className="origin-top text-xs text-red-500 italic">{t(`inputErrorPackageCreatorName${underscoreToUppercaseLetter(packageCreatorNameError, true)}`)}</p>}
              </AnimatedDiv>
              <div className="mt-6 flex-row! items-center">
                <button
                  disabled={disableButtons || destPath === null}
                  className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    if (destPath !== null) {
                      try {
                        const aaa = await window.api.exportPackage(active.path, destPath, { creatorName: packageCreatorName })
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
