import { AnimatedSection, animate } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useEffect, useMemo } from 'react'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useShallow } from 'zustand/shallow'
import { LoadingIcon } from '@renderer/assets/icons'
import clsx from 'clsx'

export function StarsInline({ stars }: { stars: number }) {
  return (
    <div className="flex-row! items-center">
      <img className="mr-0.5 w-4" src={stars >= 1 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className="mr-0.5 w-4" src={stars >= 2 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className="mr-0.5 w-4" src={stars >= 3 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className="mr-0.5 w-4" src={stars >= 4 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
      <img className="w-4" src={stars >= 5 ? (stars === 6 ? 'rbicons://rb4-stars-gold' : 'rbicons://rb4-stars') : 'rbicons://rb4-stars-out'} />
    </div>
  )
}

export function PackageDetails() {
  const { t } = useTranslation()
  const { selPKG, catalog, setMyPackagesScreenState, catalogSortBy, packageDetailsTab } = useMyPackagesScreenState(useShallow((x) => ({ selPKG: x.selPKG, catalog: x.catalog, setMyPackagesScreenState: x.setMyPackagesScreenState, catalogSortBy: x.catalogSortBy, packageDetailsTab: x.packageDetailsTab })))
  const { disableButtons, saveData, packages, instrumentScores, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, saveData: x.saveData, packages: x.packages, instrumentScores: x.instrumentScores, setWindowState: x.setWindowState })))
  const mostPlayedInstrument = useUserConfigState((x) => x.mostPlayedInstrument)
  const active = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages ? packages.packages[selPKG] : null), [selPKG, packages])

  useEffect(
    function fetchCatalogObject() {
      const start = async () => {
        if (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages && catalog === false) {
          setMyPackagesScreenState({ catalog: 'loading' })
          setWindowState({ disableButtons: true })
          try {
            const newCatalog = await window.api.getDTACatalog(selPKG, catalogSortBy)
            if (newCatalog.type === 'title' && import.meta.env.DEV) console.log('struct DTACatalogByTitleObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
            else if (newCatalog.type === 'genre' && import.meta.env.DEV) console.log('struct DTACatalogByGenreObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
            setMyPackagesScreenState({ catalog: newCatalog })
            setWindowState({ disableButtons: false })
          } catch (err) {
            if (err instanceof Error) setWindowState({ err })
          }
        }
      }

      start()
    },
    [packages, selPKG, catalog, catalogSortBy]
  )

  return (
    <AnimatedSection id="PackageDetails" condition={active !== null && catalog !== false} {...animate({ opacity: true })} className="absolute! z-5 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      {active !== null && catalog !== false && (
        <>
          <div className="flex-row! items-center border-b border-white/15 pb-2">
            <div>
              <img src={active.thumbnailSrc} className="mr-2 h-18 min-h-18 w-18 min-w-18" />
              {typeof instrumentScores === 'object' && <img title={t(instrumentScores.instrument)} src={`instrumenticons://${instrumentScores.instrument.toLowerCase()}`} className="absolute! -right-[0.3rem] -bottom-[0.3rem] mr-2 h-6 w-6 opacity-95" />}
            </div>

            <div className="mr-auto h-full">
              <h1 className="font-pentatonicalt! text-[2rem]">{active.packageData.packageName}</h1>
              <p>{t(active.songs.length === 1 ? 'songCount' : 'songCountPlural', { count: active.songs.length })}</p>
            </div>
            <button
              disabled={disableButtons}
              className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                setMyPackagesScreenState({ selPKG: -1, catalog: false, packageDetailsTab: 0 })
              }}
            >
              {t('goBack')}
            </button>
          </div>
          <div className="mb-2 h-8 min-h-8 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
            <button
              disabled={disableButtons}
              className={clsx(packageDetailsTab === 0 ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setMyPackagesScreenState({ packageDetailsTab: 0 })
              }}
            >
              {t('songs')}
            </button>
            <button
              disabled={disableButtons}
              className={clsx(packageDetailsTab === 1 ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setMyPackagesScreenState({ packageDetailsTab: 1 })
              }}
            >
              {t('options')}
            </button>
          </div>
          {packageDetailsTab === 0 && (
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
                    {(catalog.type === 'title' || catalog.type === 'genre') &&
                      catalog.headers.map(
                        (header, headerI) =>
                          header.songsIndexes.length > 0 && (
                            <div className="mb-1 w-full flex-row! duration-150 last:mb-0" key={`titleHeader${headerI}`}>
                              <div className="w-full">
                                <div className="sticky! top-0 z-100 mb-1 w-full flex-row! items-center rounded-b-sm bg-neutral-900 px-2 py-1">
                                  <h1 className="mr-auto text-xl uppercase">{t(header.code)}</h1>
                                  <p className="font-pentatonic text-neutral-500 uppercase">{t(header.songsIndexes.length === 1 ? 'songCount' : 'songCountPlural', { count: header.songsIndexes.length })}</p>
                                </div>
                                {header.songsIndexes.map((songI) => {
                                  const song = active.songs[songI]
                                  return (
                                    <div
                                      className="mb-0.5 w-full flex-row! items-center rounded-sm border-2 border-white/5 p-2 last:mb-1 hover:bg-white/5 active:bg-white/10"
                                      key={`song${songI}`}
                                      onClick={async () => {
                                        setMyPackagesScreenState({ selSong: songI })
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
                                                <StarsInline stars={0} />
                                              </div>
                                            )
                                          else {
                                            const perc = instrScore.topScoreDifficulty === 0 ? instrScore.percentEasy : instrScore.topScoreDifficulty === 1 ? instrScore.percentMedium : instrScore.topScoreDifficulty === 2 ? instrScore.percentHard : instrScore.percentExpert
                                            const stars = instrScore.topScoreDifficulty === 0 ? instrScore.starsEasy : instrScore.topScoreDifficulty === 1 ? instrScore.starsMedium : instrScore.topScoreDifficulty === 2 ? instrScore.starsHard : instrScore.starsExpert
                                            return (
                                              <div className="flex-row! items-center">
                                                <h1 className="mr-2">{`${perc}%`}</h1>
                                                <StarsInline stars={stars} />
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
                          )
                      )}
                  </div>
                </>
              )}
            </>
          )}
          {packageDetailsTab === 1 && (
            <div className="h-full w-full overflow-y-auto">
              <div className='hover:bg-white/5 duration-100 p-4'>
                <h1 className='uppercase'>{t('sortBy')}</h1>
              <p className="mb-2">{t('sortByDesc')}</p>
              <div className="flex-row! items-center">
                <button
                  disabled={disableButtons}
                  className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'title' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                  onClick={async () => {
                    setMyPackagesScreenState({ catalogSortBy: 'title', catalog: false })
                  }}
                >
                  {t('sortByTitle')}
                </button>
                <button
                  disabled={disableButtons}
                  className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', catalogSortBy === 'genre' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                  onClick={async () => {
                    setMyPackagesScreenState({ catalogSortBy: 'genre', catalog: false })
                  }}
                >
                  {t('sortByGenre')}
                </button>
              </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatedSection>
  )
}
