import clsx from 'clsx'
import { AnimatedDiv, AnimatedSection, animate, getReadableBytesSize } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { RPCS3SongPackagesDataExtra } from 'rockshelf-core'
import { useDialogScreenState } from './DialogScreen.state'
import { useShallow } from 'zustand/shallow'
import { MYPACKAGES_TABS, VERBOSE } from '@renderer/app/rockshelf.globals'
import { LoadingIcon } from '@renderer/assets/icons'
import { useEffect } from 'react'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useMergePackageModalState } from './MergePackageModal.state'

export function MyPackagesScreen() {
  const { t } = useTranslation()
  const { active, hoveredPKG, setMyPackagesScreenState, resetMyPackagesScreenState, myPackagesTab, packagesCatalog } = useMyPackagesScreenState(useShallow((x) => ({ active: x.active, hoveredPKG: x.hoveredPKG, setMyPackagesScreenState: x.setMyPackagesScreenState, resetMyPackagesScreenState: x.resetMyPackagesScreenState, myPackagesTab: x.myPackagesTab, packagesCatalog: x.packagesCatalog })))
  const { disableButtons, packages, setWindowState, disableImg } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, packages: x.packages, setWindowState: x.setWindowState, disableImg: x.disableImg })))
  const { setDialogScreenState } = useDialogScreenState(useShallow((x) => ({ setDialogScreenState: x.setDialogScreenState })))
  const { packagesCatalogSortBy, setUserConfigState, getUserConfigState } = useUserConfigState(useShallow((x) => ({ packagesCatalogSortBy: x.packagesCatalogSortBy, setUserConfigState: x.setUserConfigState, getUserConfigState: x.getUserConfigState })))
  const { setMergePackageModalState } = useMergePackageModalState(useShallow((x) => ({ setMergePackageModalState: x.setMergePackageModalState })))

  useEffect(
    function fetchCatalogObject() {
      const start = async () => {
        if (typeof packages === 'object' && packagesCatalog === false) {
          setMyPackagesScreenState({ packagesCatalog: 'loading' })
          setWindowState({ disableButtons: true })
          try {
            const newCatalog = await window.api.sortAndFilterSongPackages(packagesCatalogSortBy)
            if (VERBOSE.STRUCT) console.log('struct SongPackagesFilterGenericObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
            setMyPackagesScreenState({ packagesCatalog: newCatalog })
            setWindowState({ disableButtons: false })
          } catch (err) {
            if (err instanceof Error) setWindowState({ err })
          }
        }
      }

      void start()
    },
    [packages, packagesCatalog, packagesCatalogSortBy]
  )

  return (
    <>
      <AnimatedSection id="MyPackagesScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black p-8">
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

                if (newPackages) {
                  const newCatalog = await window.api.sortAndFilterSongPackages(packagesCatalogSortBy)
                  if (VERBOSE.STRUCT) console.log('struct SongPackagesFilterGenericObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
                  setMyPackagesScreenState({ packagesCatalog: newCatalog })
                  setWindowState({ packages: newPackages })
                }
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
              setWindowState({ disableButtons: false })
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
              {(packagesCatalog === 'loading' || packages === 'loading') && (
                <>
                  <div className="mt-2 flex-row! items-center">
                    <LoadingIcon className="mr-2 animate-spin" />
                    <p>{t('loadingPackagesData')}</p>
                  </div>
                </>
              )}
              {typeof packages === 'object' && typeof packagesCatalog === 'object' && (
                <>
                  {packagesCatalog.headers.map((header, headerI) => (
                    <div className="mb-1 w-full flex-row! duration-150 last:mb-0" key={`packTitleHeader${headerI}`}>
                      <div className="w-full">
                        <div className="sticky! top-0 z-100 mb-1 w-full flex-row! items-center rounded-b-sm bg-neutral-900 px-2 py-1">
                          <h1 className="mr-auto text-lg uppercase">{t(header.code)}</h1>
                          <p className="font-pentatonic text-neutral-500 uppercase">{t(header.indexes.length === 1 ? 'packagesCount' : 'packagesCountPlural', { count: header.indexes.length })}</p>
                        </div>
                        {header.indexes.map((packageIndex, packageIndexKey) => {
                          const pkg = packages.packages[packageIndex]

                          return (
                            <div className="flex-row!" key={`${packageIndexKey}package__${pkg.contentsHash}`}>
                              <div
                                className="mb-1 w-full flex-row! rounded-sm border-2 border-white/5 p-2 duration-150 last:mb-0 hover:bg-white/5 active:bg-white/10"
                                onMouseOver={() => setMyPackagesScreenState({ hoveredPKG: packageIndex })}
                                onMouseLeave={() => setMyPackagesScreenState({ hoveredPKG: -1 })}
                                onClick={() => {
                                  setWindowState({ disableButtons: true })
                                  setMyPackagesScreenState({ selPKG: packageIndex })
                                  setWindowState({ disableButtons: false })
                                }}
                              >
                                <img src={disableImg === packageIndex ? undefined : pkg.thumbnailSrc} className="mr-2 h-24 min-h-24 w-24 min-w-24 border-2 border-neutral-700" />
                                <div className="mr-auto w-full">
                                  <h2 className="font-pentatonic w-full text-[1.5rem]">{pkg.packageData.packageName}</h2>
                                  <h3 className="mb-2 text-sm text-neutral-500 italic">
                                    {t(pkg.songs.length === 1 ? 'songsCount' : 'songsCountPlural', { count: pkg.songs.length })} / {getReadableBytesSize(pkg.packageSize)}
                                  </h3>
                                  <div className="flex-row! items-center">
                                    <code className="mr-1 w-fit rounded-sm bg-neutral-900 px-1 py-0.5 font-semibold uppercase">{pkg.packageType}</code>
                                    {pkg.official?.code !== 'rb3' && <code className="w-fit rounded-sm bg-neutral-900 px-1 py-0.5">{pkg.name}</code>}
                                  </div>
                                </div>
                                <AnimatedDiv className="w-[15%] min-w-[15%]" condition={hoveredPKG === packageIndex} {...animate({ opacity: true, duration: 0.1 })}>
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
                                      {!pkg.official && (
                                        <>
                                          <button
                                            disabled={disableButtons}
                                            className="mr-2 mb-1 w-full self-start rounded-xs border border-green-500 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! text-green-500 uppercase duration-100 last:mr-0 last:mb-0 hover:bg-green-950/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                                            onClick={async (ev) => {
                                              ev.stopPropagation()
                                              setMergePackageModalState({ selPKG: packageIndex, index: -1 })
                                            }}
                                          >
                                            {t('mergePackage')}
                                          </button>
                                        </>
                                      )}
                                      <button
                                        disabled={disableButtons}
                                        className="mr-2 mb-1 w-full self-start rounded-xs border border-red-500 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! text-red-500 uppercase duration-100 last:mr-0 last:mb-0 hover:bg-red-950/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                                        onClick={async (ev) => {
                                          ev.stopPropagation()
                                          setDialogScreenState({ active: 'confirmDeletePackage', deletePackageIndex: packageIndex })
                                        }}
                                      >
                                        {t('deletePackage')}
                                      </button>
                                    </>
                                  )}
                                </AnimatedDiv>
                              </div>
                              <div className="h-full w-2" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </>
        )}
        {myPackagesTab === MYPACKAGES_TABS.FILTERS && (
          <>
            <div className="h-full w-full overflow-y-auto">
              <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                <h1 className="mb-1 uppercase">{t('sortBy')}</h1>
                <p className="mb-4 text-xs italic">{t('pkgSortByDesc')}</p>
                <div className="flex-row! items-center">
                  <button
                    disabled={disableButtons}
                    className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', packagesCatalogSortBy === 'name' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ packagesCatalogSortBy: 'name' })
                      const newConfig = getUserConfigState()
                      try {
                        await window.api.saveUserConfigFile(newConfig)
                        setMyPackagesScreenState({ packagesCatalog: false })
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ err })
                      }
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    {t('sortByName')}
                  </button>
                  <button
                    disabled={disableButtons}
                    className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', packagesCatalogSortBy === 'officialUnofficial' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ packagesCatalogSortBy: 'officialUnofficial' })
                      const newConfig = getUserConfigState()
                      try {
                        await window.api.saveUserConfigFile(newConfig)
                        setMyPackagesScreenState({ packagesCatalog: false })
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ err })
                      }
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    {t('sortByOfficialUnofficial')}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </AnimatedSection>
    </>
  )
}
