import { animate, AnimatedDiv, AnimatedSection } from '@renderer/lib.exports'
import { useDialogScreenState } from './DialogScreen.state'
import { useTranslation } from 'react-i18next'
import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { useWindowState } from '@renderer/stores/Window.state'
import { LoadingIcon } from '@renderer/assets/icons'
import { useShallow } from 'zustand/shallow'
import { useMessageBoxState } from './MessageBox.state'
import { InstrumentScoreData } from 'rockshelf-core/rbtools'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { VERBOSE } from '@renderer/app/rockshelf.globals'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'

function DialogButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx('mr-2 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 last:mr-0 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900', className)} {...props}>
      {children}
    </button>
  )
}

export function DialogScreen() {
  const { t } = useTranslation()
  const { active, deletePackageIndex, isLoadingAction, setDialogScreenState, resetDialogScreenState } = useDialogScreenState(useShallow((x) => ({ active: x.active, deletePackageIndex: x.deletePackageIndex, isLoadingAction: x.isLoadingAction, setDialogScreenState: x.setDialogScreenState, resetDialogScreenState: x.resetDialogScreenState })))
  const { setMyPackagesScreenState } = useMyPackagesScreenState(useShallow((x) => ({ setMyPackagesScreenState: x.setMyPackagesScreenState })))
  const { disableButtons, packages, saveData, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, packages: x.packages, saveData: x.saveData, setWindowState: x.setWindowState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { packagesCatalogSortBy } = useUserConfigState(useShallow((x) => ({ packagesCatalogSortBy: x.packagesCatalogSortBy })))

  return (
    <AnimatedSection id="DialogScreen" condition={active !== null} {...animate({ opacity: true })} className="absolute! z-40 h-full w-full items-center justify-center bg-black p-16">
      {active !== null && (
        <>
          <h1 className="mb-2 text-center text-[2rem] uppercase">{t(`${active}Title`)}</h1>
          <p className="font-pentatonic text-center text-lg">
            {t(
              // Is confirmDeletePackage
              active === 'confirmDeletePackage' && deletePackageIndex > -1 && typeof packages === 'object' && packages && deletePackageIndex in packages.packages
                ? `${active}Text${packages.packages![deletePackageIndex].songsCount === 1 ? '' : 'Plural'}`
                : // Else
                  `${active}Text`,

              // Is confirmDeletePackage
              active === 'confirmDeletePackage' && deletePackageIndex > -1 && typeof packages === 'object' && packages && deletePackageIndex in packages.packages
                ? { pkgName: packages.packages![deletePackageIndex].packageData.packageName, songsCount: packages.packages![deletePackageIndex].songsCount }
                : // Else
                  {}
            )}
          </p>
        </>
      )}
      <div className="mt-8 flex-row! items-center">
        {(() => {
          if (!active) return null
          if (active === 'corruptedUserConfig') {
            return (
              <DialogButton
                onClick={async () => {
                  setDialogScreenState({ isLoadingAction: true })
                  setWindowState({ disableButtons: true })
                  try {
                    await window.api.deleteUserConfigAndRestart()
                  } catch (err) {
                    if (err instanceof Error) setWindowState({ err })
                  }
                }}
                disabled={disableButtons}
              >
                {t('deleteUserConfigData')}
              </DialogButton>
            )
          } else if (active === 'corruptedPackagesCache') {
            return (
              <DialogButton
                onClick={async () => {
                  setDialogScreenState({ isLoadingAction: true })
                  setWindowState({ disableButtons: true })
                  try {
                    const newPackagesData = await window.api.rpcs3GetPackagesData(true)
                    resetDialogScreenState()
                    setWindowState({ packages: newPackagesData, disableButtons: false })
                  } catch (err) {
                    if (err instanceof Error) setWindowState({ err })
                  }
                }}
                disabled={disableButtons}
              >
                {t('recreatePackagesCacheFile')}
              </DialogButton>
            )
          } else if (active === 'parsingErrorsOnPackagesDTA') {
            return (
              <div className="items-center">
                {typeof packages === 'object' && (
                  <>
                    <h2 className="mb-2">{t('affectedPackages')}</h2>
                    {packages.parsingErrors.length > 0 &&
                      packages.parsingErrors.map((packagePath, packagePathI) => {
                        return (
                          <p className="mb-2 bg-neutral-950 px-2 py-1 font-mono" key={`parsingErrorPath${packagePathI}`}>
                            {packagePath}
                          </p>
                        )
                      })}
                  </>
                )}
                <div className="mt-4 flex-row! items-center">
                  <DialogButton
                    onClick={async () => {
                      resetDialogScreenState()
                    }}
                    disabled={disableButtons}
                  >
                    {t('ok')}
                  </DialogButton>
                </div>
              </div>
            )
          } else if (active === 'confirmDeletePackage' && deletePackageIndex > -1 && typeof packages === 'object' && packages && deletePackageIndex in packages.packages) {
            // const pkg = packages.packages[deletePackageIndex]
            return (
              <>
                <DialogButton
                  onClick={async () => {
                    try {
                      setWindowState({ disableButtons: true })
                      const newPackages = await window.api.deletePackage(deletePackageIndex)
                      if (VERBOSE.STRUCT) console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', newPackages)
                      const newCatalog = await window.api.sortAndFilterSongPackages(packagesCatalogSortBy)
                      if (VERBOSE.STRUCT) console.log('struct SongPackagesFilterGenericObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
                      let newInstrumentScores: false | InstrumentScoreData = false
                      if (typeof saveData === 'object') newInstrumentScores = await window.api.rpcs3GetInstrumentScores(saveData)
                      setMyPackagesScreenState({ packagesCatalog: newCatalog })
                      setWindowState({ packages: newPackages, instrumentScores: newInstrumentScores })
                      setMessageBoxState({ message: { type: 'success', code: 'deletePackage' } })
                      resetDialogScreenState()
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ err })
                    }

                    setWindowState({ disableButtons: false })
                  }}
                  disabled={disableButtons}
                >
                  {t('yes')}
                </DialogButton>
                <DialogButton
                  onClick={async () => {
                    resetDialogScreenState()
                  }}
                  disabled={disableButtons}
                >
                  {t('no')}
                </DialogButton>
              </>
            )
          } else return null
        })()}
      </div>
      <AnimatedDiv condition={isLoadingAction} {...animate({ opacity: true, height: true, scaleY: true })} className="origin-top">
        <div className="h-2 w-full" />
        <LoadingIcon className="animate-spin text-xl" />
      </AnimatedDiv>
    </AnimatedSection>
  )
}
