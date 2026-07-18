import clsx from 'clsx'
import { AnimatedDiv, AnimatedSection, animate, htmlEntityDecode } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'
import { useRhythmverseScreenState } from './RhythmverseScreen.state'
import { RHYTHMVERSE_SCREEN_TABS, STRUCT_LOG } from '@renderer/app/rockshelf.globals'
import { DiffIconInline } from './SongDetails'
import { CheckedBoxIcon, ChevronLeftIcon, ChevronRightIcon, LoadingIcon, UncheckedBoxIcon } from '@renderer/assets/icons'
import { useCallback, useMemo } from 'react'

export function RhythmverseScreen() {
  const { t } = useTranslation()
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { searchField, setRhythmverseScreenState, active, selectedTab, searchResults, downloadedSongs, fullBand, multitrack, page, records, sortBy, sortOrder, source, pitchedVocals } = useRhythmverseScreenState(useShallow((x) => ({ searchField: x.searchField, setRhythmverseScreenState: x.setRhythmverseScreenState, active: x.active, selectedTab: x.selectedTab, searchResults: x.searchResults, downloadedSongs: x.downloadedSongs, fullBand: x.fullBand, page: x.page, multitrack: x.multitrack, records: x.records, sortBy: x.sortBy, sortOrder: x.sortOrder, source: x.source, pitchedVocals: x.pitchedVocals })))

  const totalPages = useMemo(() => typeof searchResults === 'object' && Math.ceil(searchResults.records.total_filtered / records), [searchResults])

  return (
    <AnimatedSection id="RhythmverseScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black p-8">
      <div className="mb-2 flex-row! border-b border-white/25 pb-1">
        <div className="mr-auto">
          <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('browseRhythmverse')}</h1>
        </div>
        <div className="absolute! right-0 flex-row!">
          <button
            disabled={disableButtons}
            className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              setRhythmverseScreenState({ active: false, searchField: '', searchResults: false })
            }}
          >
            {t('goBack')}
          </button>
        </div>
      </div>
      <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
        <button
          disabled={disableButtons}
          className={clsx(selectedTab === RHYTHMVERSE_SCREEN_TABS.BROWSE ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setRhythmverseScreenState({ selectedTab: RHYTHMVERSE_SCREEN_TABS.BROWSE })
          }}
        >
          {t('browse')}
        </button>
        <button
          disabled={disableButtons}
          className={clsx(selectedTab === RHYTHMVERSE_SCREEN_TABS.DOWNLOADED_SONGS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setRhythmverseScreenState({ selectedTab: RHYTHMVERSE_SCREEN_TABS.DOWNLOADED_SONGS })
          }}
        >
          {t('downloadedSongs')}
        </button>

        <button
          disabled={disableButtons}
          className={clsx(selectedTab === RHYTHMVERSE_SCREEN_TABS.FILTERS ? 'bg-cyan-500 text-black/90 hover:bg-cyan-400 active:bg-cyan-300' : 'hover:text-neutral-300 active:text-neutral-200', 'ml-auto h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setRhythmverseScreenState({ selectedTab: RHYTHMVERSE_SCREEN_TABS.FILTERS })
          }}
        >
          {t('filters')}
        </button>
      </div>
      {selectedTab === RHYTHMVERSE_SCREEN_TABS.BROWSE && (
        <>
          <form>
            <div className="mb-4 flex-row! items-center">
              <div className="mr-2 w-full flex-row! items-center rounded-sm border border-neutral-900 bg-neutral-800 px-3 py-1">
                <p className="mr-2">{`${t('search')}:`}</p>
                <input value={searchField} onChange={(ev) => setRhythmverseScreenState({ searchField: ev.target.value })} className="mr-4 w-full border-b border-transparent hover:border-neutral-700 focus:border-neutral-500 active:border-neutral-400" />
                <button
                  type="submit"
                  disabled={disableButtons}
                  className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async (ev) => {
                    ev.preventDefault()
                    ev.stopPropagation()
                    setWindowState({ disableButtons: true })
                    setRhythmverseScreenState({ searchResults: 'loading' })

                    try {
                      const newSearchResults = await window.api.fetchRhythmverseData(searchField, 'text', { fullBand, multitrack, page: 1, pitchedVocals, records, sortBy, sortOrder, source })
                      if (STRUCT_LOG) console.log('struct ProcessedRhythmverseObject ["core/src/lib/rbtools/core/RhythmverseAPI.ts"]:', newSearchResults)
                      setRhythmverseScreenState({ searchResults: newSearchResults, page: 1 })
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ err })
                    }
                    setWindowState({ disableButtons: false })
                  }}
                >
                  {t('search')}
                </button>
              </div>
              <div className="h-fill flex-row! items-center rounded-sm border border-neutral-900 bg-neutral-800 px-3 py-1">
                <p className="mr-1 font-semibold">
                  {typeof searchResults !== 'object' ? 0 : page}/{typeof searchResults !== 'object' ? 0 : totalPages}
                </p>
                <button
                  disabled={disableButtons || typeof searchResults !== 'object' || page === 1}
                  className="w-1/2 items-center rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! text-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async (ev) => {
                    ev.preventDefault()
                    ev.stopPropagation()
                    setWindowState({ disableButtons: true })
                    setRhythmverseScreenState({ searchResults: 'loading' })
                    const newPage = page - 1

                    try {
                      const newSearchResults = await window.api.fetchRhythmverseData(searchField, 'text', { fullBand, multitrack, page: page - 1, pitchedVocals, records, sortBy, sortOrder, source })
                      if (STRUCT_LOG) console.log('struct ProcessedRhythmverseObject ["core/src/lib/rbtools/core/RhythmverseAPI.ts"]:', newSearchResults)
                      setRhythmverseScreenState({ searchResults: newSearchResults, page: newPage })
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ err })
                    }
                    setWindowState({ disableButtons: false })
                  }}
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  disabled={disableButtons || typeof searchResults !== 'object' || totalPages === page}
                  className="w-1/2 items-center rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! text-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async (ev) => {
                    ev.preventDefault()
                    ev.stopPropagation()
                    setWindowState({ disableButtons: true })
                    setRhythmverseScreenState({ searchResults: 'loading' })
                    const newPage = page + 1

                    try {
                      const newSearchResults = await window.api.fetchRhythmverseData(searchField, 'text', { fullBand, multitrack, page: page + 1, pitchedVocals, records, sortBy, sortOrder, source })
                      if (STRUCT_LOG) console.log('struct ProcessedRhythmverseObject ["core/src/lib/rbtools/core/RhythmverseAPI.ts"]:', newSearchResults)
                      setRhythmverseScreenState({ searchResults: newSearchResults, page: newPage })
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ err })
                    }
                    setWindowState({ disableButtons: false })
                  }}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </form>
          <div className="h-full w-full">
            {searchResults === 'loading' && (
              <div className="flex-row! items-center">
                <LoadingIcon className="mr-1 min-w-6 animate-spin" />
                <p>{t('searchingRhythmverse')}</p>
              </div>
            )}
            {typeof searchResults === 'object' && (
              <>
                {searchResults.songs.length === 0 && <p>{t('rhythmverseNoResultsReturned')}</p>}
                {searchResults.songs.length > 0 &&
                  searchResults.songs.map((song, songI) => {
                    const isHostedOnRhythmverse = song.file_download_url.startsWith('https://rhythmverse.co')
                    return (
                      <div className="group mb-2 h-1/4 flex-row! items-center rounded-sm border border-neutral-900 px-4 duration-200 last:mb-0 hover:bg-white/5" key={`rhythmverseResultsSong${songI}`}>
                        <img
                          src={song.album_art}
                          className="mr-2 h-24 min-h-24 w-24 min-w-24 border-2 border-neutral-700"
                          onError={(ev) => {
                            ev.currentTarget.onerror = null
                            ev.currentTarget.src = 'rbicons://rockshelf'
                          }}
                        />
                        <div className="h-full w-full flex-row! items-center">
                          <div className="mr-auto">
                            <h1 className="text-lg">{htmlEntityDecode(song.name || '')}</h1>
                            <h2 className="mb-2 text-sm text-neutral-500 italic">
                              {htmlEntityDecode(song.artist || '')}
                              {song.album_name ? <> &bull; {htmlEntityDecode(song.album_name)}</> : ''}
                            </h2>
                            <div className="mt-auto">
                              <div className="w-fit flex-row! items-center">
                                <img src="rbicons://instrument-icons-guitar" title={t('guitar')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_guitar === undefined ? -1 : song.rank_guitar} />
                                <img src="rbicons://instrument-icons-bass" title={t('bass')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_bass === undefined ? -1 : song.rank_bass} />
                                <img src="rbicons://instrument-icons-drums" title={t('drums')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_drum === undefined ? -1 : song.rank_drum} />
                                <img src="rbicons://instrument-icons-keys" title={t('keys')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_keys === undefined ? -1 : song.rank_keys} />
                                <img src="rbicons://instrument-icons-vocals" title={t('vocals')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_vocals ?? -1} />
                              </div>
                              <div className="w-fit flex-row! items-center">
                                <img src="rbicons://instrument-icons-proGuitar" title={t('proGuitar')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_real_guitar ?? -1} />
                                <img src="rbicons://instrument-icons-proBass" title={t('proBass')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_real_bass ?? -1} />
                                <img src="rbicons://instrument-icons-proDrums" title={t('proDrums')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_drum ?? -1} />
                                <img src="rbicons://instrument-icons-proKeys" title={t('proKeys')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_real_keys ?? -1} />
                                <img src={song.vocal_parts === 2 ? 'rbicons://instrument-icons-harm2' : 'rbicons://instrument-icons-harmonies'} title={t(song.vocal_parts === 2 ? 'harm2' : 'harm3')} className="mr-1 h-6 w-6" />
                                <DiffIconInline width={1.0} diff={song.rank_vocals ?? -1} />
                              </div>
                            </div>
                          </div>
                          <div className="h-full w-1/5 min-w-1/5 self-start py-4">
                            <button
                              className="mr-2 mb-1 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! uppercase duration-100 last:mr-0 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                              onClick={async () => {
                                await window.api.openExternalLink(song.song_url)
                              }}
                            >
                              {t('openLinkOnRhythmverse')}
                            </button>
                            <button
                              className="mr-2 mb-auto w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! uppercase duration-100 last:mr-0 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                              onClick={async () => {
                                if (isHostedOnRhythmverse) {
                                } else {
                                  await window.api.openExternalLink(song.file_download_url)
                                }
                              }}
                            >
                              {isHostedOnRhythmverse ? t('download') : t('downloadExternal')}
                            </button>

                            <div className="mb-1 flex-row! items-center">
                              <img src="rbicons://instrument-icons-download" title={t('sortByDownloads')} className="mr-1 h-4 min-h-4 w-4 min-w-4 cursor-help!" />
                              <p className="font-bold">{song.downloads}</p>
                            </div>
                            <div className="flex-row! items-center">
                              <img
                                src={song.author_avatar}
                                title={song.author}
                                onError={(ev) => {
                                  ev.currentTarget.onerror = null
                                  ev.currentTarget.style.display = 'none'
                                }}
                                className="mr-1 h-4 min-h-4 w-4 min-w-4 border border-neutral-800"
                              />
                              <p
                                className="hover:cursor-pointer hover:underline"
                                title={t('clickToAccessUserSongfiles')}
                                onClick={async () => {
                                  await window.api.openExternalLink(song.author_url)
                                }}
                              >
                                {song.author || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </>
            )}
          </div>
        </>
      )}
      {selectedTab === RHYTHMVERSE_SCREEN_TABS.DOWNLOADED_SONGS && (
        <>
          <div className="mb-4 w-full flex-row! items-center rounded-sm border border-neutral-900 bg-neutral-800 px-3 py-1"></div>
        </>
      )}
      {selectedTab === RHYTHMVERSE_SCREEN_TABS.FILTERS && (
        <div className="h-full w-full overflow-y-auto">
          <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
            <h1 className="mb-1 uppercase">{t('sortBy')}</h1>
            <p className="mb-4 text-xs italic">{t('rhythmverseSortByDesc')}</p>
            <div className="flex-row! items-center">
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortBy === 'updateDate' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortBy: 'updateDate' })
                }}
              >
                {t('sortByUpdateDate')}
              </button>
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortBy === 'title' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortBy: 'title' })
                }}
              >
                {t('sortByTitle')}
              </button>
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortBy === 'artist' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortBy: 'artist' })
                }}
              >
                {t('sortByArtist')}
              </button>
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortBy === 'length' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortBy: 'length' })
                }}
              >
                {t('sortBySongLength')}
              </button>
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortBy === 'author' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortBy: 'author' })
                }}
              >
                {t('sortByAuthor')}
              </button>
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortBy === 'releaseDate' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortBy: 'releaseDate' })
                }}
              >
                {t('sortByReleaseDate')}
              </button>
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortBy === 'downloads' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortBy: 'downloads' })
                }}
              >
                {t('sortByDownloads')}
              </button>
            </div>
          </div>

          <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
            <h1 className="mb-1 uppercase">{t('sortOrder')}</h1>
            <p className="mb-4 text-xs italic">{t('rhythmverseSortOrderDesc')}</p>
            <div className="flex-row! items-center">
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortOrder === 'asc' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortOrder: 'asc' })
                }}
              >
                {t('sortAsc')}
              </button>
              <button
                disabled={disableButtons}
                className={clsx('font-pentatonic mr-2 flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200 last:mr-0', sortOrder === 'desc' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                onClick={async () => {
                  setRhythmverseScreenState({ sortOrder: 'desc' })
                }}
              >
                {t('sortDesc')}
              </button>
            </div>
          </div>

          <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
            <div className="flex-row! items-center">
              <button
                className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                onClick={async () => {
                  setRhythmverseScreenState({ fullBand: !fullBand })
                }}
              >
                {fullBand ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
              </button>
              <h1 className="mb-1 uppercase">{t('fullBandOnly')}</h1>
            </div>
            <p className="text-xs italic">{t('rhythmverseFullBandOnlyDesc')}</p>
          </div>

          <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
            <div className="flex-row! items-center">
              <button
                className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                onClick={async () => {
                  setRhythmverseScreenState({ multitrack: !multitrack })
                }}
              >
                {multitrack ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
              </button>
              <h1 className="mb-1 uppercase">{t('multitrackOnly')}</h1>
            </div>
            <p className="text-xs italic">{t('rhythmverseMultitrackOnlyDesc')}</p>
          </div>

          <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
            <div className="flex-row! items-center">
              <button
                className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                onClick={async () => {
                  setRhythmverseScreenState({ pitchedVocals: !pitchedVocals })
                }}
              >
                {pitchedVocals ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
              </button>
              <h1 className="mb-1 uppercase">{t('pitchedVocalsOnly')}</h1>
            </div>
            <p className="text-xs italic">{t('rhythmversePitchedVocalsOnlyDesc')}</p>
          </div>
        </div>
      )}
    </AnimatedSection>
  )
}
