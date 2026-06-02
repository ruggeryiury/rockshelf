import { AnimatedDiv, AnimatedSection, TransComponent, animate, formatMillisecondsToTimeDuration, formatNumberWithDots, formatSongKeyString, rankCalculator, sleep, underscoreToUppercaseLetter } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeftIcon, ChevronRightIcon, DiamondIcon, LoadingIcon, PlaystationIcon, RPCS3Icon, WiiIcon, XboxIcon } from '@renderer/assets/icons'
import clsx from 'clsx'
import { useShallow } from 'zustand/shallow'
import { SONG_DETAILS_TABS, VERBOSE } from '@renderer/app/rockshelf.globals'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { bandIcon, guitarIcon, bassIcon, drumsIcon, keysIcon, vocalsIcon, proGuitarIcon, proBassIcon, proDrumsIcon, proKeysIcon, harm3Icon, diffDotOn, diffDotOff, diffDotDevil } from '@renderer/assets/images'
import { StarsInline } from '@renderer/components.exports'
import { useEditSongScreenState } from './EditSongScreen.state'

export function DiffIconInline({ diff, width, mr }: { diff: number; width?: number; mr?: 'auto' | number }) {
  const { t, i18n } = useTranslation()
  return (
    <div style={{ width: `${5.625 * (width || 1)}rem`, marginRight: mr === 'auto' || !mr ? 'auto' : `${mr}rem` }} className="w-22.5 max-w-22.5 flex-row! items-center last:mr-0" title={t(diff === -1 ? 'noPart' : `diff${diff}`)}>
      {diff > -1 && (
        <>
          <img src={diff === 6 ? diffDotDevil : diff >= 1 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 2 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 3 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 4 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 5 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
        </>
      )}
      {diff === -1 && (
        <h1 style={{ fontSize: `${i18n.language === 'pt-BR' ? 0.79 * (width || 1) : i18n.language === 'en-US' ? 1.05 * (width || 1) : 0.88 * (width || 1)}rem` }} className="uppercase">
          {t('noPart')}
        </h1>
      )}
    </div>
  )
}
export function SongDetails() {
  const { t } = useTranslation()
  const { selPKG, selSong, isArtworkLoading, artworkURL, songDetailsTab, songLeaderboards, setMyPackagesScreenState } = useMyPackagesScreenState(useShallow((x) => ({ selPKG: x.selPKG, selSong: x.selSong, isArtworkLoading: x.isArtworkLoading, artworkURL: x.artworkURL, setMyPackagesScreenState: x.setMyPackagesScreenState, songDetailsTab: x.songDetailsTab, songLeaderboards: x.songLeaderboards })))

  const { songsCatalogSortBy, mostPlayedInstrument } = useUserConfigState(useShallow((x) => ({ mostPlayedInstrument: x.mostPlayedInstrument, songsCatalogSortBy: x.songsCatalogSortBy })))

  const { disableButtons, setWindowState, packages, saveData, rb3Stats } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState, packages: x.packages, saveData: x.saveData, rb3Stats: x.rb3Stats })))

  const { startEditingSong } = useEditSongScreenState(useShallow((x) => ({ startEditingSong: x.startEditingSong })))

  const { setUserConfigState } = useUserConfigState(useShallow((x) => ({ setUserConfigState: x.setUserConfigState })))

  const packageDetails = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages ? packages.packages[selPKG] : null), [packages, selPKG])

  const songDetails = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages && selSong > -1 && packageDetails !== null && selSong in packageDetails.songs ? packageDetails.songs[selSong] : null), [packages, selPKG, selSong])

  const allTracksCount = useMemo(() => songDetails?.tracks_count.reduce<number>((prev, curr) => (curr ? prev + curr : prev), 0), [songDetails])

  const songSubGenre = useMemo(() => {
    if (songDetails) {
      if (songDetails.customsource?.sub_genre) return songDetails.customsource.sub_genre
      else if (songDetails.sub_genre) return songDetails.sub_genre
      else return null
    } else return null
  }, [songDetails])

  const songKey = useMemo(() => {
    if (songDetails) return formatSongKeyString(songDetails)
    return null
  }, [songDetails])

  const songsCount = useMemo(() => {
    return packageDetails?.songs.length ?? 0
  }, [packageDetails])

  const resetSongDetailsState = () => {
    setMyPackagesScreenState({ selSong: -1, isArtworkLoading: true, artworkURL: '', songDetailsTab: 0, songLeaderboards: false })
  }

  useEffect(
    function getArtworkFromSong() {
      const start = async () => {
        if (!packageDetails || !songDetails) return

        if (packageDetails.official?.code === 'rb3' || packageDetails.official?.code === 'rb1') {
          setMyPackagesScreenState({ isArtworkLoading: false, artworkURL: `artworks://${songDetails.songname}` })
          return
        }

        try {
          const artworkDataURL = await window.api.getSongArtworkDataURL(packageDetails, songDetails)
          if (artworkDataURL) setMyPackagesScreenState({ artworkURL: artworkDataURL, isArtworkLoading: false })
          else setMyPackagesScreenState({ artworkURL: packageDetails.thumbnailSrc, isArtworkLoading: false })
        } catch (err) {
          if (err instanceof Error) setWindowState({ err })
        }
      }

      void start()
    },
    [packages, selPKG, selSong]
  )

  useEffect(
    function fetchSongLeaderboardScores() {
      const start = async () => {
        if (songDetailsTab === SONG_DETAILS_TABS.LEADERBOARDS && songDetails !== null && typeof songDetails.song_id === 'number') {
          setMyPackagesScreenState({ songLeaderboards: 'loading' })
          const leaderboards = await window.api.getScoresFromGoCentral(songDetails.song_id, mostPlayedInstrument)
          if (VERBOSE.STRUCT) console.log('struct GoCentralLeaderboardResultObject [core/src/lib/rbtools/core/GoCentralAPI.ts]', leaderboards)
          setMyPackagesScreenState({ songLeaderboards: leaderboards })
        }
      }
      void start()
    },
    [songDetailsTab, songDetails, mostPlayedInstrument]
  )

  return (
    <AnimatedSection id="SongDetails" {...animate({ opacity: true })} condition={songDetails !== null} className="absolute! z-7 h-full max-h-full w-full max-w-full bg-black p-8">
      {packageDetails !== null && songDetails !== null && (
        <>
          <div className="mb-2 flex-row! items-start border-b border-white/25 pb-2">
            <div className={clsx('mr-2 h-32 min-h-32 w-32 min-w-32', isArtworkLoading && 'border border-neutral-800')}>
              <AnimatedDiv condition={isArtworkLoading} className="absolute! h-full w-full items-center justify-center bg-black">
                <LoadingIcon className="animate-spin text-xl" style={{ animationTimingFunction: '0.1s !important' }} />
              </AnimatedDiv>
              <img src={artworkURL || 'rbicons://website'} className="h-full w-full border-2 border-neutral-700" />
            </div>

            <div className="mr-auto h-full w-full">
              <h1 className="font-pentatonicalt! mb-2 text-[2rem]">
                {songDetails.name}
                <span className="ml-2 text-base">{formatMillisecondsToTimeDuration(songDetails.song_length)}</span>
              </h1>
              <div className="w-full flex-row! items-start">
                <div className="w-[75%] max-w-[75%]">
                  <h2 className="font-bold text-gray-300 uppercase">{t('artist')}</h2>
                  <p className="mb-1">{songDetails.artist}</p>
                  {songDetails.album_name ? <h2 className="font-bold text-gray-300 uppercase">{t('albumName')}</h2> : <h2 className="font-bold text-gray-300 uppercase">{t('yearReleased')}</h2>}
                  {songDetails.album_name ? (
                    <p className="mb-1">{songDetails.album_name}</p>
                  ) : (
                    <p className="mb-1">
                      {songDetails.year_released}
                      {songDetails.year_recorded ? ` (${songDetails.year_recorded})` : ''}
                    </p>
                  )}
                </div>
                <div className="w-[25%] max-w-[25%]">
                  <h2 className="font-bold text-gray-300 uppercase">{t('genre')}</h2>
                  <div className="mb-1 w-full flex-row! items-center">
                    <p className="">{t(songDetails.customsource?.genre || songDetails.genre)}</p>
                    {typeof songDetails.customsource?.genre === 'string' && <DiamondIcon className="relative top-[0.1rem] ml-1 rotate-45 cursor-help text-gray-700 duration-100 hover:text-gray-300" title={t('dxGenreOnly')} />}
                  </div>
                  {songDetails.album_name && (
                    <>
                      <h2 className="font-bold text-gray-300 uppercase">{t('yearReleased')}</h2>
                      <p className="mb-1">
                        {songDetails.year_released}
                        {songDetails.year_recorded ? ` (${songDetails.year_recorded})` : ''}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="ml-24">
              <button
                disabled={disableButtons}
                className="mb-1 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! text-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                onClick={async () => {
                  resetSongDetailsState()
                }}
              >
                {t('goBack')}
              </button>
              <div className="flex-row! items-center">
                <button
                  disabled={disableButtons || songDetailsTab === SONG_DETAILS_TABS.LEADERBOARDS}
                  className="w-1/2 items-center rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! text-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    if (selSong === 0) {
                      setMyPackagesScreenState({
                        selSong: songsCount - 1,
                      })
                    } else {
                      setMyPackagesScreenState({
                        selSong: selSong - 1,
                      })
                    }

                    await sleep(1000)
                    setWindowState({ disableButtons: false })
                  }}
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  disabled={disableButtons || songDetailsTab === SONG_DETAILS_TABS.LEADERBOARDS}
                  className="w-1/2 items-center rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! text-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    if (selSong === songsCount - 1) {
                      setMyPackagesScreenState({
                        selSong: 0,
                      })
                    } else {
                      setMyPackagesScreenState({
                        selSong: selSong + 1,
                      })
                    }

                    await sleep(1000)
                    setWindowState({ disableButtons: false })
                  }}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </div>
          <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
            <button
              disabled={disableButtons}
              className={clsx('flex-row! items-center', songDetailsTab === SONG_DETAILS_TABS.DETAILS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setMyPackagesScreenState({ songDetailsTab: SONG_DETAILS_TABS.DETAILS })
              }}
            >
              {t('details')}
            </button>
            <button
              disabled={disableButtons}
              className={clsx('flex-row! items-center', songDetailsTab === SONG_DETAILS_TABS.LEADERBOARDS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setMyPackagesScreenState({ songDetailsTab: SONG_DETAILS_TABS.LEADERBOARDS })
              }}
            >
              <img src={`rbicons://instrument-icons-${mostPlayedInstrument.toLowerCase()}`} className={clsx('mr-1 h-5 w-5', songDetailsTab === SONG_DETAILS_TABS.LEADERBOARDS ? 'opacity-100' : 'opacity-75')} />
              {t('leaderboards')}
            </button>
            {packageDetails?.official?.code !== 'rb3' && (
              <>
                <button
                  disabled={disableButtons}
                  className={clsx('flex-row! items-center', songDetailsTab === SONG_DETAILS_TABS.OPTIONS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
                  onClick={() => {
                    setMyPackagesScreenState({ songDetailsTab: SONG_DETAILS_TABS.OPTIONS })
                  }}
                >
                  {t('options')}
                </button>
              </>
            )}
          </div>
          {songDetailsTab === SONG_DETAILS_TABS.DETAILS && (
            <>
              <div className="h-full w-full overflow-y-auto">
                <div className="flex-row! flex-wrap items-start">
                  <div className="group w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="uppercase">{t('songEntryID')}</h1>
                    <p>{songDetails.id}</p>
                  </div>

                  <div className="group w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="uppercase">{t('internalName')}</h1>
                    <p>{String(songDetails.songname)}</p>
                  </div>

                  <div className="group w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="uppercase">{t('songID')}</h1>
                    <p>{String(songDetails.song_id)}</p>
                  </div>

                  <div className="group w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="uppercase">{t('gameOrigin')}</h1>
                    <div className="flex-row! items-center">
                      <p>{t(typeof rb3Stats === 'object' && rb3Stats.hasDeluxe && (songDetails.customsource?.game_origin || songDetails.game_origin).startsWith('ugc') ? `gameOriginDX__${songDetails.customsource?.game_origin || songDetails.game_origin}` : `gameOrigin__${songDetails.customsource?.game_origin || songDetails.game_origin}`)}</p>
                      {songDetails.customsource?.game_origin && <DiamondIcon className="relative top-[0.1rem] ml-1 rotate-45 cursor-help text-gray-700 duration-100 hover:text-gray-300" title={t('dxGameOriginOnly')} />}
                    </div>
                  </div>

                  <div className="group h-16 w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="mb-1 uppercase">{t('songRating')}</h1>
                    <div className="flex-row! items-center">
                      <div className={clsx('mr-1 rounded-xs px-1 py-0.5', songDetails.rating === 1 && 'bg-green-600 text-neutral-900', songDetails.rating === 2 && 'bg-yellow-500 text-neutral-900', (songDetails.rating === 3 || songDetails.rating === 4) && 'bg-red-500 text-neutral-900')}>
                        <h1>{t(songDetails.rating === 1 ? 'songRating1Small' : songDetails.rating === 2 ? 'songRating2Small' : songDetails.rating === 3 ? 'songRating3Small' : 'songRating4Small')}</h1>
                      </div>
                      <p>{t(songDetails.rating === 1 ? 'songRating1' : songDetails.rating === 2 ? 'songRating2' : songDetails.rating === 3 ? 'songRating3' : 'songRating4')}</p>
                    </div>
                  </div>

                  <div className="group h-16 w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="mb-1 uppercase">{t('author')}</h1>
                    <div className="flex-row! items-center">
                      {/* <p className={clsx(songDetails.author === undefined && 'text-neutral-500 italic')}>{songDetails.author !== undefined ? packageDetails.official !== undefined ? 'Harmonix' : songDetails.author : t('notSpecified')}</p> */}
                      <p className={clsx(!packageDetails.official && !songDetails.author && 'text-neutral-500 italic')}>{packageDetails.official && !songDetails.author ? 'Harmonix' : !packageDetails.official && !songDetails.author ? t('notSpecified') : songDetails.author}</p>
                    </div>
                  </div>

                  <div className="group w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="uppercase">{t('genre')}</h1>
                    <div className="flex-row! items-center">
                      <p>{t(`${songDetails.customsource?.genre || songDetails.genre}`)}</p>
                      {songDetails.customsource?.genre && <DiamondIcon className="relative top-[0.1rem] ml-1 rotate-45 cursor-help text-gray-700 duration-100 hover:text-gray-300" title={t('dxGameOriginOnly')} />}
                    </div>
                  </div>

                  <div className="group w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="uppercase">{t('subGenre')}</h1>
                    <div className="flex-row! items-center">
                      <p className={clsx(songSubGenre === null && 'text-neutral-500 italic')}>{t(songSubGenre ?? 'notSpecified')}</p>
                      {songDetails.customsource?.sub_genre && <DiamondIcon className="relative top-[0.1rem] ml-1 rotate-45 cursor-help text-gray-700 duration-100 hover:text-gray-300" title={t('dxGameOriginOnly')} />}
                    </div>
                  </div>

                  <div className="group h-16 w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="mb-1 uppercase">{t('vocalParts')}</h1>
                    <div className="flex-row! items-center">
                      <div className={clsx('mr-1 h-5 w-3 rounded-xs border border-neutral-600 last:mr-0', songDetails.vocal_parts >= 1 && 'bg-[#10a7dd]')} />
                      <div className={clsx('mr-1 h-5 w-3 rounded-xs border border-neutral-600 last:mr-0', songDetails.vocal_parts >= 2 && 'bg-[#9b4211]')} />
                      <div className={clsx('mr-1 h-5 w-3 rounded-xs border border-neutral-600 last:mr-0', songDetails.vocal_parts === 3 && 'bg-[#d48218]')} />
                      <p className="ml-1">{songDetails.vocal_parts}</p>
                    </div>
                  </div>

                  <div className="group h-16 w-1/2 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <h1 className="uppercase">{t('songKey')}</h1>
                    <div className="flex-row! items-center">
                      <p className={clsx(songKey === null && 'text-neutral-500 italic')}>{songKey ?? t('notSpecified')}</p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('audioTracks')}</h1>
                  {allTracksCount !== undefined && (
                    <p className="mb-1 text-xs italic">
                      <TransComponent i18nKey={allTracksCount === 1 ? 'tracksCount' : 'tracksCountPlural'} values={{ allTracksCount, multitrack: t(typeof songDetails.multitrack !== 'string' && !packageDetails?.official ? 'mtSingleTrack' : `mt${underscoreToUppercaseLetter(songDetails.multitrack || 'full', true)}`) }} />
                    </p>
                  )}
                  <div className="h-8 w-full flex-row! items-center">
                    {songDetails.tracks_count[0] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('drums')}>
                        {Array(songDetails.tracks_count[0])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`drumsAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#207818]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-drums-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[1] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('bass')}>
                        {Array(songDetails.tracks_count[1])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`bassAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#940000]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-bass-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[2] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('guitar')}>
                        {Array(songDetails.tracks_count[2])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`guitarAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#bfa00b]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-guitar-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[3] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('vocals2')}>
                        {Array(songDetails.tracks_count[3])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`vocalsAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#0561cb]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-vocals-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[4] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('keys')}>
                        {Array(songDetails.tracks_count[4])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`keysAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#ca6400]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-keys-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[5] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('backing')}>
                        {Array(songDetails.tracks_count[5])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`backingAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-black"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-backing" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[6] && songDetails.tracks_count[6] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('crowd')}>
                        {Array(songDetails.tracks_count[6])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`crowdAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-black"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-crowd" width={24} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {songDetails.loading_phrase && (
                  <>
                    <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                      <h1 className="mb-1 uppercase">{t('loadingPhrase')}</h1>
                      <p className="italic">{songDetails.loading_phrase}</p>
                    </div>
                  </>
                )}

                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('difficulties')}</h1>
                  <div className="mb-2 flex-row! items-center">
                    <img src="rbicons://instrument-icons-band" title={t('band')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={0} width={1.1} diff={rankCalculator('band', songDetails.rank_band)} />
                  </div>
                  <div className="flex-row! items-center">
                    <img src="rbicons://instrument-icons-guitar" title={t('guitar')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('guitar', songDetails.rank_guitar)} />
                    <img src="rbicons://instrument-icons-bass" title={t('bass')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('bass', songDetails.rank_bass)} />
                    <img src="rbicons://instrument-icons-drums" title={t('drums')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('drum', songDetails.rank_drum)} />
                    <img src="rbicons://instrument-icons-keys" title={t('keys')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('keys', songDetails.rank_keys)} />
                    <img src="rbicons://instrument-icons-vocals" title={t('vocals')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={0} width={1.1} diff={rankCalculator('vocals', songDetails.rank_vocals)} />
                  </div>
                  <div className="flex-row! items-center">
                    <img src="rbicons://instrument-icons-proGuitar" title={t('proGuitar')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('real_guitar', songDetails.rank_real_guitar)} />
                    <img src="rbicons://instrument-icons-proBass" title={t('proBass')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('real_bass', songDetails.rank_real_bass)} />
                    <img src="rbicons://instrument-icons-proDrums" title={t('proDrums')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('drum', songDetails.rank_drum)} />
                    <img src="rbicons://instrument-icons-proKeys" title={t('proKeys')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={1.2} width={1.1} diff={rankCalculator('real_keys', songDetails.rank_real_keys)} />
                    <img src={songDetails.vocal_parts === 2 ? 'rbicons://instrument-icons-harm2' : 'rbicons://instrument-icons-harmonies'} title={t(songDetails.vocal_parts === 2 ? 'harm2' : 'harm3')} className="mr-1 h-6 w-6" />
                    <DiffIconInline mr={0} width={1.1} diff={songDetails.vocal_parts <= 1 ? -1 : rankCalculator('vocals', songDetails.rank_vocals)} />
                  </div>
                </div>
              </div>
            </>
          )}
          {songDetailsTab === SONG_DETAILS_TABS.LEADERBOARDS && (
            <>
              <div className="h-full w-full overflow-y-auto">
                <div className="mb-2 flex-row! items-center">
                  <button
                    title={t('band')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'band' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'band' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'band' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={bandIcon} width={24} />
                  </button>
                  <button
                    title={t('guitar')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'guitar' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'guitar' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'guitar' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={guitarIcon} width={24} />
                  </button>
                  <button
                    title={t('bass')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'bass' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'bass' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'bass' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={bassIcon} width={24} />
                  </button>

                  <button
                    title={t('drums')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'drums' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'drums' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'drums' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={drumsIcon} width={24} />
                  </button>
                  <button
                    title={t('keys')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'keys' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'keys' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'keys' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={keysIcon} width={24} />
                  </button>
                  <button
                    title={t('vocals')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'vocals' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'vocals' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'vocals' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={vocalsIcon} width={24} />
                  </button>
                  <button
                    title={t('proGuitar')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proGuitar' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'proGuitar' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proGuitar' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={proGuitarIcon} width={24} />
                  </button>
                  <button
                    title={t('proBass')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proBass' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'proBass' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proBass' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={proBassIcon} width={24} />
                  </button>

                  <button
                    title={t('proDrums')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proDrums' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'proDrums' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proDrums' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={proDrumsIcon} width={24} />
                  </button>
                  <button
                    title={t('proKeys')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'proKeys' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'proKeys' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'proKeys' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={proKeysIcon} width={24} />
                  </button>
                  <button
                    title={t('harmonies')}
                    disabled={disableButtons}
                    className={clsx('mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', mostPlayedInstrument === 'harmonies' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setUserConfigState({ mostPlayedInstrument: 'harmonies' })
                      await window.api.saveUserConfigFile({ mostPlayedInstrument: 'harmonies' })
                      if (typeof saveData === 'object') {
                        const newInstrScores = await window.api.rpcs3GetInstrumentScores(saveData)
                        if (VERBOSE.STRUCT) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrScores)
                        setWindowState({ instrumentScores: newInstrScores })
                      }
                      setMyPackagesScreenState({ songsCatalog: false })
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    <img src={harm3Icon} width={24} />
                  </button>
                </div>
                {songLeaderboards === 'loading' && (
                  <>
                    <div className="flex-row! items-center">
                      <LoadingIcon className="mr-1 animate-spin" />
                      <p>{t('loadingSongLeaderboards')}</p>
                    </div>
                  </>
                )}
                {typeof songLeaderboards === 'object' && (
                  <>
                    {songLeaderboards.scores === false && <h1 className="font-open!">{t('noScoresForSong', { instrument: t(songLeaderboards.instrument) })}</h1>}
                    {songLeaderboards.scores !== false &&
                      songLeaderboards.scores.map((score, scoreIndex) => {
                        return (
                          <div key={`score${scoreIndex}`} className={clsx('font-pentatonic mr-4 mb-1 flex-row! items-center rounded-sm border border-neutral-700 px-2 py-1 last:mb-0', scoreIndex === 0 && 'bg-linear-to-b from-yellow-500 to-yellow-600 text-neutral-950', scoreIndex === 1 && 'bg-linear-to-b from-neutral-400 to-neutral-500 text-neutral-950', scoreIndex === 2 && 'bg-linear-to-b from-[#CD7F32] to-[#a6472d] text-neutral-950')}>
                            <h1 className="mr-1 text-xs">{scoreIndex + 1}</h1>
                            <h2 className="mr-2 text-lg">{score.name}</h2>
                            {songLeaderboards.instrument !== 'band' &&
                              (() => {
                                switch (score.platform) {
                                  case 'rpcs3':
                                  default:
                                    return <RPCS3Icon className="h-3.5 w-3.5" title="RPCS3" />
                                  case 'ps3':
                                    return <PlaystationIcon className="text-lg" title="PlayStation® 3" />
                                  case 'wii':
                                    return <WiiIcon className="h-6 w-6" title="Nintendo® Wii" />
                                  case 'xbox':
                                    return <XboxIcon className="text-sm" title="Xbox® 360" />
                                }
                              })()}
                            <h2 className="mr-2 ml-auto font-mono text-base font-bold">{formatNumberWithDots(score.score)}</h2>
                            <div className={clsx('mr-2 rounded-xs bg-neutral-800 px-1 py-0.5', scoreIndex >= 0 && scoreIndex <= 2 ? 'text-neutral-200' : '')}>
                              {(() => {
                                switch (score.difficulty) {
                                  case 4:
                                  default:
                                    return 'X'
                                  case 3:
                                    return 'H'
                                  case 2:
                                    return 'M'
                                  case 1:
                                    return 'E'
                                }
                              })()}
                            </div>
                            <h3 className="mr-2 w-10">{`${score.scorePercent}%`}</h3>
                            <StarsInline width={1.2} stars={score.stars} />
                          </div>
                        )
                      })}
                  </>
                )}
              </div>
            </>
          )}

          {songDetailsTab === SONG_DETAILS_TABS.OPTIONS && (
            <>
              <div className="h-full w-full overflow-y-auto">
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <h1 className="mb-1 uppercase">{t('audioTracks')}</h1>
                  {allTracksCount !== undefined && (
                    <p className="mb-1 text-xs italic">
                      <TransComponent i18nKey={allTracksCount === 1 ? 'tracksCount' : 'tracksCountPlural'} values={{ allTracksCount, multitrack: t(typeof songDetails.multitrack !== 'string' && !packageDetails?.official ? 'mtSingleTrack' : `mt${underscoreToUppercaseLetter(songDetails.multitrack || 'full', true)}`) }} />
                    </p>
                  )}
                  <div className="mb-4 h-8 w-full flex-row! items-center">
                    {songDetails.tracks_count[0] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('drums')}>
                        {Array(songDetails.tracks_count[0])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`drumsAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#207818]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-drums-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[1] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('bass')}>
                        {Array(songDetails.tracks_count[1])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`bassAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#940000]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-bass-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[2] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('guitar')}>
                        {Array(songDetails.tracks_count[2])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`guitarAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#bfa00b]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-guitar-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[3] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('vocals2')}>
                        {Array(songDetails.tracks_count[3])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`vocalsAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#0561cb]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-vocals-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[4] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('keys')}>
                        {Array(songDetails.tracks_count[4])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`keysAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-[#ca6400]"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-keys-color" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[5] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('backing')}>
                        {Array(songDetails.tracks_count[5])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`backingAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-black"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-backing" width={24} />
                        </div>
                      </div>
                    )}
                    {songDetails.tracks_count[6] && songDetails.tracks_count[6] > 0 && (
                      <div className="relative! h-full flex-row! rounded-sm border border-transparent duration-200 hover:border-neutral-300" title={t('crowd')}>
                        {Array(songDetails.tracks_count[6])
                          .fill(0)
                          .map((_, arrIndex) => {
                            return <div key={`crowdAudio${arrIndex}`} className="h-full w-12 rounded-sm border border-neutral-800/80 bg-black"></div>
                          })}
                        <div className="absolute! h-full w-full items-center justify-center">
                          <img src="rbicons://instrument-icons-crowd" width={24} />
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="mb-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    onClick={async (ev) => {
                      setWindowState({ disableButtons: true })
                      if (packageDetails) {
                        try {
                          await window.api.extractMultitrackOrSongAudioFromSong(packageDetails, songDetails)
                        } catch (err) {
                          if (err instanceof Error) setWindowState({ err })
                        }
                      }
                      setWindowState({ disableButtons: false })
                    }}
                  >
                    {t(typeof songDetails.multitrack !== 'string' && !packageDetails?.official ? 'extractSongAudioTrack' : 'extractTracks')}
                  </button>
                </div>
                {packageDetails?.official === undefined && (
                  <>
                    <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                      <h1 className="mb-1 uppercase">{t('editSong')}</h1>
                      <p className="mb-2 text-xs italic">
                        <TransComponent i18nKey="editSongDesc" />
                      </p>
                      <button
                        disabled={disableButtons}
                        className="mr-2 mb-1 w-fit self-start rounded-xs border border-green-500 bg-neutral-900 px-1 py-0.5 text-xs! text-green-500 uppercase duration-100 last:mr-0 last:mb-0 hover:bg-green-950/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        onClick={async () => {
                          // setWindowState({ disableButtons: true })

                          startEditingSong(songDetails)

                          // setWindowState({ disableButtons: false })
                        }}
                      >
                        {t('editSong')}
                      </button>
                    </div>
                    <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                      <h1 className="mb-1 uppercase">{t('deleteSong')}</h1>
                      <p className="mb-2 text-xs italic">
                        <TransComponent i18nKey="deleteSongDesc" />
                      </p>
                      <button
                        disabled={disableButtons}
                        className="mr-2 mb-1 w-fit self-start rounded-xs border border-red-500 bg-neutral-900 px-1 py-0.5 text-xs! text-red-500 uppercase duration-100 last:mr-0 last:mb-0 hover:bg-red-950/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        onClick={async () => {
                          setWindowState({ disableButtons: true })
                          try {
                            const newPackages = await window.api.batchDeleteSongs(selPKG, [songDetails.songname])
                            if (VERBOSE.STRUCT) console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', newPackages)
                            if (newPackages) {
                              const newCatalog = await window.api.sortAndFilterSongsFromPackage(selPKG, songsCatalogSortBy, { instrument: mostPlayedInstrument })
                              if (!newCatalog) return
                              if (VERBOSE.STRUCT) {
                                if (newCatalog.type !== 'difficulty' && newCatalog.type !== 'artist') console.log('struct DTACatalogGenericObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
                                else if (newCatalog.type === 'artist') console.log('struct DTACatalogByArtistObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
                                else console.log('struct DTACatalogByDifficultyObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
                              }
                              resetSongDetailsState()
                              setMyPackagesScreenState({ songsCatalog: newCatalog })
                              setWindowState({ packages: newPackages })
                            }
                          } catch (err) {
                            if (err instanceof Error) setWindowState({ err })
                          }
                          setWindowState({ disableButtons: false })
                        }}
                      >
                        {t('deleteSong')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
    </AnimatedSection>
  )
}
