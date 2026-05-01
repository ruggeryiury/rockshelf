import clsx from 'clsx'
import { AnimatedDiv, AnimatedP, AnimatedSection, animate, getReadableBytesSize } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { PackageDetails } from './PackageDetails'
import { RPCS3SongPackagesDataExtra } from 'rockshelf-core'
import { useDialogScreenState } from './DialogScreen.state'
import { useShallow } from 'zustand/shallow'
import { MYPACKAGES_TABS, VERBOSE } from '@renderer/app/rockshelf.globals'

export function MyPackagesScreen() {
  const { t } = useTranslation()
  const { active, hoveredPKG, setMyPackagesScreenState, resetMyPackagesScreenState, myPackagesTab } = useMyPackagesScreenState(useShallow((x) => ({ active: x.active, hoveredPKG: x.hoveredPKG, setMyPackagesScreenState: x.setMyPackagesScreenState, resetMyPackagesScreenState: x.resetMyPackagesScreenState, myPackagesTab: x.myPackagesTab })))
  const { disableButtons, packages, setWindowState, disableImg } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, packages: x.packages, setWindowState: x.setWindowState, disableImg: x.disableImg })))
  const { setDialogScreenState } = useDialogScreenState(useShallow((x) => ({ setDialogScreenState: x.setDialogScreenState })))

  return (
    <>
      <AnimatedSection id="MyPackagesScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
        <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
          <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('myPackages')}</h1>
          <button
            disabled={disableButtons}
            className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              setWindowState({ disableButtons: true, packages: 'loading' })
              let newPackages: RPCS3SongPackagesDataExtra | false = false
              try {
                newPackages = await window.api.refreshPackagesData()
                if (VERBOSE.STRUCT) console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', newPackages)
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
              setWindowState({ disableButtons: false, packages: newPackages })
            }}
          >
            {t('refresh')}
          </button>
          <button
            disabled={disableButtons}
            className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              resetMyPackagesScreenState()
            }}
          >
            {t('goBack')}
          </button>
        </div>
        <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
          <button
            disabled={disableButtons}
            className={clsx(myPackagesTab === MYPACKAGES_TABS.PACKAGES ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
            onClick={() => {
              setMyPackagesScreenState({ myPackagesTab: MYPACKAGES_TABS.PACKAGES })
            }}
          >
            {t('packages')}
          </button>
          <button
            disabled={disableButtons}
            className={clsx(myPackagesTab === MYPACKAGES_TABS.FILTERS ? 'bg-cyan-500 text-black/90 hover:bg-cyan-400 active:bg-cyan-300' : 'hover:text-neutral-300 active:text-neutral-200', 'ml-auto h-full w-fit justify-center px-2 duration-200')}
            onClick={() => {
              setMyPackagesScreenState({ myPackagesTab: MYPACKAGES_TABS.FILTERS })
            }}
          >
            {t('filters')}
          </button>
        </div>
        {myPackagesTab === MYPACKAGES_TABS.PACKAGES && (
          <>
            <div className="h-full w-full overflow-y-auto">
              <AnimatedP condition={packages === 'loading'} {...animate({ opacity: true, duration: 0.1 })} className="absolute! pt-2 pl-2 text-xs">
                {t('loadingPackagesData')}
              </AnimatedP>
              <AnimatedDiv condition={typeof packages === 'object'} {...animate({ opacity: true, duration: 0.1 })} className="overflow-y-auto">
                {typeof packages === 'object' && (
                  <>
                    {packages.packages.map((pkg, packageI) => {
                      return (
                        <div className="flex-row!" key={`package__${pkg.contentsHash}`}>
                          <div
                            className="mb-1 w-full flex-row! rounded-sm border-2 border-white/5 p-2 duration-150 last:mb-0 hover:bg-white/5 active:bg-white/10"
                            onMouseOver={() => setMyPackagesScreenState({ hoveredPKG: packageI })}
                            onMouseLeave={() => setMyPackagesScreenState({ hoveredPKG: -1 })}
                            onClick={() => {
                              setWindowState({ disableButtons: true })
                              setMyPackagesScreenState({ selPKG: packageI })
                              setWindowState({ disableButtons: false })
                            }}
                          >
                            <img src={disableImg === packageI ? undefined : pkg.thumbnailSrc} className="mr-2 h-20 min-h-20 w-20 min-w-20 border-2 border-neutral-700" />
                            <div className="mr-auto">
                              <h2 className="font-pentatonic text-xl">{pkg.packageData.packageName}</h2>
                              <h3 className="mb-2 text-xs text-neutral-500 italic">
                                {t(pkg.songs.length === 1 ? 'songsCount' : 'songsCountPlural', { count: pkg.songs.length })} / {getReadableBytesSize(pkg.packageSize)}
                              </h3>
                              {pkg.official?.code !== 'rb3' && <p className="absolute! bottom-0 rounded-xs bg-neutral-950 px-2 py-0.5 font-mono text-xs whitespace-nowrap">{`${pkg.packageType === 'rb1' ? 'BLUS30050' : 'BLUS30463'}/${pkg.name}`}</p>}
                            </div>
                            <AnimatedDiv condition={hoveredPKG === packageI} {...animate({ opacity: true, duration: 0.1 })}>
                              {pkg.official?.code !== 'rb3' && (
                                <>
                                  <button
                                    disabled={disableButtons}
                                    className="mr-2 mb-1 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! uppercase duration-100 last:mr-0 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                                    onClick={async (ev) => {
                                      ev.stopPropagation()
                                      await window.api.openFolderInExplorer(pkg.path)
                                    }}
                                  >
                                    {t('openPackageFolder')}
                                  </button>
                                  <button
                                    disabled={disableButtons}
                                    className="mr-2 mb-1 w-full self-start rounded-xs border border-red-500 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! text-red-500 uppercase duration-100 last:mr-0 last:mb-0 hover:bg-red-950/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                                    onClick={async (ev) => {
                                      ev.stopPropagation()
                                      setDialogScreenState({ active: 'confirmDeletePackage', deletePackageIndex: packageI })
                                    }}
                                  >
                                    {t('deletePackage')}
                                  </button>
                                  {!pkg.official && (
                                    <>
                                      <button
                                        disabled={disableButtons}
                                        className="mr-2 mb-1 w-full self-start rounded-xs border border-green-600 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! text-green-600 uppercase duration-100 last:mr-0 last:mb-0 hover:bg-red-950/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                                        onClick={async (ev) => {
                                          ev.stopPropagation()
                                          setDialogScreenState({ active: 'confirmDeletePackage', deletePackageIndex: packageI })
                                        }}
                                      >
                                        {t('merge')}
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </AnimatedDiv>
                          </div>
                          <div className="h-full w-2" />
                        </div>
                      )
                    })}
                  </>
                )}
              </AnimatedDiv>
            </div>
          </>
        )}
      </AnimatedSection>
      <PackageDetails />
    </>
  )
}
