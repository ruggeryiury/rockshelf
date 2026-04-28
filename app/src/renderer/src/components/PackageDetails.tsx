import { AnimatedDiv, AnimatedSection, TransComponent, animate, getReadableBytesSize, uppercaseFirstLetter } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useEffect, useMemo } from 'react'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useShallow } from 'zustand/shallow'
import { LoadingIcon } from '@renderer/assets/icons'
import clsx from 'clsx'
import { bandIcon, guitarIcon, bassIcon, drumsIcon, keysIcon, vocalsIcon, proGuitarIcon, proBassIcon, proDrumsIcon, proKeysIcon, harm3Icon } from '@renderer/assets/images'
import { useMessageBoxState } from './MessageBox.state'
import { useRBIconsSelectorState } from './RBIconsSelector.state'
import { useImageCropScreenState } from './ImageCropScreen.state'
import { PACKAGE_DETAILS_TABS } from '@renderer/app/rockshelf'

export function StarsInline({ stars, width }: { stars: number; width?: number }) {
  return (
    <div className="flex-row! items-center">
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 1 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 2 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 3 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 4 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className={`mr-0.5 last:mr-0`} style={{ width: `${width || 4}rem` }} src={stars >= 5 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
    </div>
  )
}

export function PackageDetails() {
  const { t } = useTranslation()
  const { selPKG, catalog, setMyPackagesScreenState, catalogSortBy, packageDetailsTab, editPackageName, editPackageEdited } = useMyPackagesScreenState(useShallow((x) => ({ selPKG: x.selPKG, catalog: x.catalog, setMyPackagesScreenState: x.setMyPackagesScreenState, catalogSortBy: x.catalogSortBy, packageDetailsTab: x.packageDetailsTab, editPackageName: x.editPackageName, editPackageEdited: x.editPackageEdited })))
  const { disableButtons, saveData, packages, rb3Stats, setWindowState, disableImg } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, saveData: x.saveData, packages: x.packages, rb3Stats: x.rb3Stats, setWindowState: x.setWindowState, disableImg: x.disableImg })))
  const { mostPlayedInstrument, setUserConfigState } = useUserConfigState(useShallow((x) => ({ mostPlayedInstrument: x.mostPlayedInstrument, setUserConfigState: x.setUserConfigState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { setRBIconsSelectorState } = useRBIconsSelectorState(useShallow((x) => ({ setRBIconsSelectorState: x.setRBIconsSelectorState })))
  const { setImageCropScreenState } = useImageCropScreenState(useShallow((x) => ({ setImageCropScreenState: x.setImageCropScreenState })))
  const active = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages ? packages.packages[selPKG] : null), [selPKG, packages])

  useEffect(
    function fetchCatalogObject() {
      const start = async () => {
        if (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages && catalog === false) {
          setMyPackagesScreenState({ catalog: 'loading' })
          setWindowState({ disableButtons: true })
          try {
            const newCatalog = await window.api.getDTAFilteringFromPackage(selPKG, catalogSortBy, { instrument: mostPlayedInstrument })
            if (!newCatalog) return
            if (import.meta.env.DEV) {
              if (newCatalog.type !== 'difficulty' && newCatalog.type !== 'artist') console.log('struct DTACatalogGenericObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
              else if (newCatalog.type === 'artist') console.log('struct DTACatalogByArtistObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
              else console.log('struct DTACatalogByDifficultyObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
            }
            setMyPackagesScreenState({ catalog: newCatalog })
            setWindowState({ disableButtons: false })
          } catch (err) {
            if (err instanceof Error) setWindowState({ err })
          }
        }
      }

      start()
    },
    [packages, selPKG, catalog, catalogSortBy, mostPlayedInstrument]
  )

  useEffect(
    function resetEditPackageState() {
      if (typeof active === 'object' && active && packageDetailsTab === PACKAGE_DETAILS_TABS.OPTIONS) {
        setMyPackagesScreenState({ editPackageName: active.packageData.packageName, editPackageEdited: false })
      }
    },
    [packageDetailsTab]
  )

  useEffect(
    function warnNonSavedChangesOnPackageEdit() {
      if (packageDetailsTab !== PACKAGE_DETAILS_TABS.OPTIONS && editPackageEdited) setMessageBoxState({ message: { type: 'warn', code: 'nonSavedChangesOnEditPackage' } })
    },
    [packageDetailsTab]
  )

  return (
    <AnimatedSection id="PackageDetails" condition={active !== null && catalog !== false} {...animate({ opacity: true })} className="absolute! z-5 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      {active !== null && catalog !== false && (
        <>
          <div className="flex-row! items-center border-b border-white/15 pb-2">
            <img src={disableImg === selPKG ? undefined : active.thumbnailSrc} className="mr-2 h-32 min-h-32 w-32 min-w-32 border-2 border-neutral-700" />

            <div className="mr-auto h-full">
              <h1 className="font-pentatonicalt! text-[2rem]">{active.packageData.packageName}</h1>
              <p>{t(active.songs.length === 1 ? 'songsCount' : 'songsCountPlural', { count: active.songs.length })}</p>
              <p>{t('sortText', { sortType: t(`sort${uppercaseFirstLetter(catalogSortBy)}`) })}</p>
            </div>
            <button
              disabled={disableButtons}
              className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                setMyPackagesScreenState({ selPKG: -1, catalog: false, packageDetailsTab: 0, editPackageName: '', editPackageEdited: false, isArtworkLoading: true, artworkURL: '' })
              }}
            >
              {t('goBack')}
            </button>
          </div>
          <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
            <button
              disabled={disableButtons}
              className={clsx(packageDetailsTab === PACKAGE_DETAILS_TABS.SONGS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setMyPackagesScreenState({ packageDetailsTab: PACKAGE_DETAILS_TABS.SONGS })
              }}
            >
              {t('songs')}
            </button>
            <button
              disabled={disableButtons}
              className={clsx(packageDetailsTab === PACKAGE_DETAILS_TABS.DETAILS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setMyPackagesScreenState({ packageDetailsTab: PACKAGE_DETAILS_TABS.DETAILS })
              }}
            >
              {t('details')}
            </button>
            {active.official?.code !== 'rb3' && (
              <>
                <button
                  disabled={disableButtons}
                  className={clsx(packageDetailsTab === PACKAGE_DETAILS_TABS.OPTIONS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
                  onClick={() => {
                    setMyPackagesScreenState({ packageDetailsTab: PACKAGE_DETAILS_TABS.OPTIONS })
                  }}
                >
                  {t('options')}
                </button>
              </>
            )}

            <button
              disabled={disableButtons}
              className={clsx(packageDetailsTab === PACKAGE_DETAILS_TABS.FILTERS ? 'bg-cyan-500 text-black/90 hover:bg-cyan-400 active:bg-cyan-300' : 'hover:text-neutral-300 active:text-neutral-200', 'ml-auto h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setMyPackagesScreenState({ packageDetailsTab: PACKAGE_DETAILS_TABS.FILTERS })
              }}
            >
              {t('filters')}
            </button>
          </div>
          {packageDetailsTab === PACKAGE_DETAILS_TABS.SONGS && (
            <>
              {active !== null && catalog === 'loading' && (
                <>
                  <div className="flex-row! items-center">
                    <LoadingIcon className="mr-1 animate-spin" />
                    <p>{t('loadingSongSorting')}</p>
                  </div>
                </>
              )}
              {typeof catalog === 'object' && (
                <>
                  <div className="h-full w-full overflow-y-auto">
                    {catalog.type !== 'artist' &&
                      catalog.headers.map((header, headerI) => (
                        <div className="mb-1 w-full flex-row! duration-150 last:mb-0" key={`titleHeader${headerI}`}>
                          <div className="w-full">
                            <div className="sticky! top-0 z-100 mb-1 w-full flex-row! items-center rounded-b-sm bg-neutral-900 px-2 py-1">
                              <h1 className="mr-auto text-lg uppercase">{catalog.type === 'yearReleased' ? header.name : t(header.code)}</h1>
                              <p className="font-pentatonic text-neutral-500 uppercase">{t(header.songsIndexes.length === 1 ? 'songsCount' : 'songsCountPlural', { count: header.songsIndexes.length })}</p>
                            </div>
                            {header.songsIndexes.map((songIndex, songIndexKey) => {
                              const song = active.songs[songIndex]
                              return (
                                <div
                                  className="mb-0.5 w-full flex-row! items-center rounded-sm border-2 border-white/5 p-2 last:mb-1 hover:bg-white/5 active:bg-white/10"
                                  key={`song${songIndex}_${songIndexKey}`}
                                  onClick={async () => {
                                    setMyPackagesScreenState({ selSong: songIndex })
                                  }}
                                >
                                  <h2 className="font-pentatonic mr-2">{song.name}</h2>
                                  <h2 className="mr-auto text-xs text-neutral-600 italic">{song.artist}</h2>
                                  {typeof saveData === 'object' &&
                                    (() => {
                                      const score = saveData.scores.find((val) => val.song_id === song.song_id)
                                      const instrScore = score?.[mostPlayedInstrument]
                                      if (!instrScore)
                                        return (
                                          <div className="flex-row! items-center">
                                            <h1 className="mr-2">{`0%`}</h1>
                                            <StarsInline stars={0} width={1.2} />
                                          </div>
                                        )
                                      else {
                                        const perc = instrScore.topScoreDifficulty === 0 ? instrScore.percentEasy : instrScore.topScoreDifficulty === 1 ? instrScore.percentMedium : instrScore.topScoreDifficulty === 2 ? instrScore.percentHard : instrScore.percentExpert
                                        const stars = instrScore.topScoreDifficulty === 0 ? instrScore.starsEasy : instrScore.topScoreDifficulty === 1 ? instrScore.starsMedium : instrScore.topScoreDifficulty === 2 ? instrScore.starsHard : instrScore.starsExpert
                                        return (
                                          <div className="flex-row! items-center">
                                            <h1 className="mr-2">{`${perc}%`}</h1>
                                            <StarsInline stars={stars} width={1.2} />
                                          </div>
                                        )
                                      }
                                    })()}
                                </div>
                              )
                            })}
                          </div>
                          <div className="h-full w-2" />
                        </div>
                      ))}
                    {catalog.type === 'artist' &&
                      catalog.headers.map((header) => (
                        <div className="mb-1 w-full flex-row! duration-150 last:mb-0" key={`artist_${header.code}`}>
                          <div className="w-full">
                            <div className="sticky! top-0 z-100 mb-1 w-full flex-row! items-center rounded-b-sm bg-neutral-900 px-2 py-1">
                              <h1 className="mr-auto text-lg uppercase">{header.name}</h1>
                              <p className="font-pentatonic text-neutral-500 uppercase">{t(header.songsCount === 1 ? 'songsCount' : 'songsCountPlural', { count: header.songsCount })}</p>
                            </div>
                            {header.albums.map((album) => {
                              return (
                                <div className="mb-1 w-full flex-row! duration-150 last:mb-0" key={`artist___album_${album.code}`}>
                                  <div className="w-full">
                                    <div className="sticky! top-7.25 z-99 mb-1 w-full flex-row! items-center bg-cyan-950 px-2 py-1">
                                      <h1 className="mr-auto text-lg uppercase">{album.name}</h1>
                                      <p className="font-pentatonic text-neutral-500 uppercase">{t(album.songsIndexes.length === 1 ? 'songsCount' : 'songsCountPlural', { count: album.songsIndexes.length })}</p>
                                    </div>

                                    {album.songsIndexes.map((songIndex, songIndexKey) => {
                                      const song = active.songs[songIndex]
                                      return (
                                        <div
                                          className="mb-0.5 w-full flex-row! items-center rounded-sm border-2 border-white/5 p-2 last:mb-1 hover:bg-white/5 active:bg-white/10"
                                          key={`song${songIndex}_${songIndexKey}`}
                                          onClick={async () => {
                                            setMyPackagesScreenState({ selSong: songIndex })
                                          }}
                                        >
                                          <h2 className="font-pentatonic mr-auto">{song.name}</h2>
                                          {/* <h2 className="mr-auto text-xs text-neutral-600 italic">{song.artist}</h2> */}
                                          {typeof saveData === 'object' &&
                                            (() => {
                                              const score = saveData.scores.find((val) => val.song_id === song.song_id)
                                              const instrScore = score?.[mostPlayedInstrument]
                                              if (!instrScore)
                                                return (
                                                  <div className="flex-row! items-center">
                                                    <h1 className="mr-2">{`0%`}</h1>
                                                    <StarsInline stars={0} width={1.2} />
                                                  </div>
                                                )
                                              else {
                                                const perc = instrScore.topScoreDifficulty === 0 ? instrScore.percentEasy : instrScore.topScoreDifficulty === 1 ? instrScore.percentMedium : instrScore.topScoreDifficulty === 2 ? instrScore.percentHard : instrScore.percentExpert
                                                const stars = instrScore.topScoreDifficulty === 0 ? instrScore.starsEasy : instrScore.topScoreDifficulty === 1 ? instrScore.starsMedium : instrScore.topScoreDifficulty === 2 ? instrScore.starsHard : instrScore.starsExpert
                                                return (
                                                  <div className="flex-row! items-center">
                                                    <h1 className="mr-2">{`${perc}%`}</h1>
                                                    <StarsInline stars={stars} width={1.2} />
                                                  </div>
                                                )
                                              }
                                            })()}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                            {header.songsIndexes.map((songIndex, songIndexKey) => {
                              const song = active.songs[songIndex]
                              return (
                                <div
                                  className="mb-0.5 w-full flex-row! items-center rounded-sm border-2 border-white/5 p-2 last:mb-1 hover:bg-white/5 active:bg-white/10"
                                  key={`song${songIndex}_${songIndexKey}`}
                                  onClick={async () => {
                                    setMyPackagesScreenState({ selSong: songIndex })
                                  }}
                                >
                                  <h2 className="font-pentatonic mr-auto">{song.name}</h2>
                                  {/* <h2 className="mr-auto text-xs text-neutral-600 italic">{song.artist}</h2> */}
                                  {typeof saveData === 'object' &&
                                    (() => {
                                      const score = saveData.scores.find((val) => val.song_id === song.song_id)
                                      const instrScore = score?.[mostPlayedInstrument]
                                      if (!instrScore)
                                        return (
                                          <div className="flex-row! items-center">
                                            <h1 className="mr-2">{`0%`}</h1>
                                            <StarsInline stars={0} width={1.2} />
                                          </div>
                                        )
                                      else {
                                        const perc = instrScore.topScoreDifficulty === 0 ? instrScore.percentEasy : instrScore.topScoreDifficulty === 1 ? instrScore.percentMedium : instrScore.topScoreDifficulty === 2 ? instrScore.percentHard : instrScore.percentExpert
                                        const stars = instrScore.topScoreDifficulty === 0 ? instrScore.starsEasy : instrScore.topScoreDifficulty === 1 ? instrScore.starsMedium : instrScore.topScoreDifficulty === 2 ? instrScore.starsHard : instrScore.starsExpert
                                        return (
                                          <div className="flex-row! items-center">
                                            <h1 className="mr-2">{`${perc}%`}</h1>
                                            <StarsInline stars={stars} width={1.2} />
                                          </div>
                                        )
                                      }
                                    })()}
                                </div>
                              )
                            })}
                          </div>
                          <div className="h-full w-2" />
                        </div>
                      ))}
                  </div>
                </>
              )}
            </>
          )}

          {packageDetailsTab === PACKAGE_DETAILS_TABS.DETAILS && (
            <>
              <div className="h-full w-full overflow-y-auto">
                {active.official?.code !== 'rb3' && (
                  <>
                    <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                      <h1 className="mb-1 uppercase">{t('packagePath')}</h1>
                      <p className="mb-4 font-mono text-xs italic">{active.path}</p>
                      <div className="flex-row! items-center">
                        <button
                          disabled={disableButtons}
                          className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                          onClick={async () => {
                            await window.api.openFolderInExplorer(active.path)
                          }}
                        >
                          {t('openPackageFolder')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('packageSize')}</h1>
                  <p className="text-xs italic">{getReadableBytesSize(active.packageSize)}</p>
                </div>
                {active.official?.code !== 'rb3' && (
                  <>
                    <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                      <h1 className="mb-1 uppercase">{t('encDecStatus')}</h1>
                      <p className="text-xs italic">{t(`encDec${uppercaseFirstLetter(active.packageData.encryptionStatus)}`)}</p>
                      <AnimatedDiv condition={typeof rb3Stats === 'object' && !rb3Stats.hasDeluxe && active.packageData.encryptionStatus === 'decrypted'}>
                        <div className="h-2 w-full" />
                        <p className="text-xs text-red-500 italic">{t('decryptedPackageWODeluxeWarningText')}</p>
                      </AnimatedDiv>
                    </div>
                    <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                      <h1 className="mb-1 uppercase">{t('packageHash')}</h1>
                      <p className="mb-4 font-mono text-xs italic">{active.contentsHash}</p>
                      <button
                        disabled={disableButtons}
                        className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(active.contentsHash)
                            setMessageBoxState({ message: { type: 'info', code: 'packageHashCopiedToClipboard' } })
                          } catch (err) {
                            setMessageBoxState({ message: { type: 'error', code: 'packageHashCopiedToClipboard' } })
                          }
                        }}
                      >
                        {t('copyHash')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {packageDetailsTab === PACKAGE_DETAILS_TABS.OPTIONS && (
            <>
              <div className="h-full w-full overflow-y-auto">
                <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('packageName')}</h1>
                  <p className="mb-4 text-xs italic">
                    <TransComponent i18nKey="changePackageNameDesc" />
                  </p>
                  <input className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" value={editPackageName} onChange={(ev) => setMyPackagesScreenState({ editPackageEdited: true, editPackageName: ev.target.value })} minLength={1} maxLength={64} />
                </div>

                {/* <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('packageFolderName')}</h1>
                  <p className="mb-4 text-xs italic">
                    <TransComponent i18nKey="packageFolderNameDesc" />
                  </p>
                  <input className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" value={packageFolderName} onChange={(ev) => setCreateNewPackageScreenState({ packageFolderName: ev.target.value })} minLength={1} maxLength={64} />
                </div> */}

                <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('packageThumbnail')}</h1>
                  <p className="mb-4 text-xs italic">
                    <TransComponent i18nKey="changePackageThumbnailDesc" />
                  </p>
                  <div className="flex-row! items-center">
                    <button
                      disabled={disableButtons}
                      className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        try {
                          const imgStats = await window.api.loadImageForCrop(active.path)
                          if (imgStats) {
                            setImageCropScreenState({ imgPath: imgStats.path, imgDataURL: imgStats.dataURL, func: 'packageDetails' })
                            setMessageBoxState({ message: null })
                          }
                        } catch (err) {
                          if (err instanceof Error) setWindowState({ err })
                        }
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      {t('selectImgFile')}
                    </button>
                    <button
                      disabled={disableButtons}
                      className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      onClick={async () => {
                        setRBIconsSelectorState({ active: 'editPackage' })
                      }}
                    >
                      {t('selectRBIcons')}
                    </button>
                  </div>
                </div>

                <AnimatedDiv condition={editPackageEdited} {...animate({ opacity: true })}>
                  <button
                    className="mb-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    onClick={async (ev) => {
                      setWindowState({ disableButtons: true })
                      try {
                        const newPackages = await window.api.editPackageData(selPKG, { packageName: editPackageName })
                        console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', newPackages)

                        if (newPackages) setWindowState({ packages: newPackages })
                        setMyPackagesScreenState({ editPackageEdited: false })
                        setMessageBoxState({ message: { type: 'success', code: 'savePackageEditing' } })
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ err })
                      }
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    {t('save')}
                  </button>
                </AnimatedDiv>
              </div>
            </>
          )}

          {packageDetailsTab === PACKAGE_DETAILS_TABS.FILTERS && (
            <>
              <div className="h-full w-full overflow-y-auto">
                <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('sortBy')}</h1>
                  <p className="mb-4 text-xs italic">{t('sortByDesc')}</p>
                  <div className="flex-row! items-center">
                    <button
                      disabled={disableButtons}
                      className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'title' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setMyPackagesScreenState({ catalogSortBy: 'title', catalog: false })
                      }}
                    >
                      {t('sortByTitle')}
                    </button>
                    <button
                      disabled={disableButtons}
                      className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'artist' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setMyPackagesScreenState({ catalogSortBy: 'artist', catalog: false })
                      }}
                    >
                      {t('sortByArtist')}
                    </button>
                    <button
                      disabled={disableButtons}
                      className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'genre' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setMyPackagesScreenState({ catalogSortBy: 'genre', catalog: false })
                      }}
                    >
                      {t('sortByGenre')}
                    </button>
                    <button
                      disabled={disableButtons}
                      className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'decade' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setMyPackagesScreenState({ catalogSortBy: 'decade', catalog: false })
                      }}
                    >
                      {t('sortByDecade')}
                    </button>
                    <button
                      disabled={disableButtons}
                      className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'yearReleased' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setMyPackagesScreenState({ catalogSortBy: 'yearReleased', catalog: false })
                      }}
                    >
                      {t('sortByYearReleased')}
                    </button>
                    <button
                      disabled={disableButtons}
                      className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'difficulty' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setMyPackagesScreenState({ catalogSortBy: 'difficulty', catalog: false })
                      }}
                    >
                      <img className="mr-1 w-4" src={`instrumenticons://${mostPlayedInstrument}`} />
                      {t('sortByDifficulty')}
                    </button>
                  </div>
                </div>
                <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('instrument')}</h1>
                  <p className="mb-4 text-xs italic">
                    <TransComponent i18nKey="instrumentDesc" />
                  </p>
                  <div className="flex-row! items-center">
                    <button
                      title={t('band')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'band' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'band' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'band' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={bandIcon} width={24} />
                    </button>
                    <button
                      title={t('guitar')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'guitar' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'guitar' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'guitar' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={guitarIcon} width={24} />
                    </button>
                    <button
                      title={t('bass')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'bass' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'bass' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'bass' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={bassIcon} width={24} />
                    </button>

                    <button
                      title={t('drums')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'drums' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'drums' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'drums' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={drumsIcon} width={24} />
                    </button>
                    <button
                      title={t('keys')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'keys' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'keys' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'keys' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={keysIcon} width={24} />
                    </button>
                    <button
                      title={t('vocals')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'vocals' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'vocals' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'vocals' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={vocalsIcon} width={24} />
                    </button>
                    <button
                      title={t('proGuitar')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proGuitar' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'proGuitar' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proGuitar' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={proGuitarIcon} width={24} />
                    </button>
                    <button
                      title={t('proBass')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proBass' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'proBass' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proBass' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={proBassIcon} width={24} />
                    </button>

                    <button
                      title={t('proDrums')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proDrums' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'proDrums' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proDrums' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={proDrumsIcon} width={24} />
                    </button>
                    <button
                      title={t('proKeys')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proKeys' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'proKeys' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proKeys' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={proKeysIcon} width={24} />
                    </button>
                    <button
                      title={t('harmonies')}
                      disabled={disableButtons}
                      className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 font-sans! text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'harmonies' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        setUserConfigState({ mostPlayedInstrument: 'harmonies' })
                        await window.api.saveUserConfigFile({ mostPlayedInstrument: 'harmonies' })
                        if (typeof saveData === 'object') {
                          const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                          console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                          setWindowState({ instrumentScores: newInstrScores })
                        }
                        setMyPackagesScreenState({ catalog: false })
                        setWindowState({ disableButtons: false })
                      }}
                    >
                      <img src={harm3Icon} width={24} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </AnimatedSection>
  )
}
