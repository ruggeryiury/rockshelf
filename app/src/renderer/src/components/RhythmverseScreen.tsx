import clsx from 'clsx'
import { AnimatedSection, animate } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'
import { useRhythmverseScreenState } from './RhythmverseScreen.state'
import { RHYTHMVERSE_SCREEN_TABS, VERBOSE } from '@renderer/app/rockshelf.globals'
import { useMessageBoxState } from './MessageBox.state'
import { DiffIconInline } from './SongDetails'
import { LoadingIcon } from '@renderer/assets/icons'

export function RhythmverseScreen() {
  const { t } = useTranslation()
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { resetRhythmverseScreenState, searchField, setRhythmverseScreenState, active, selectedTab, searchResults } = useRhythmverseScreenState(useShallow((x) => ({ resetRhythmverseScreenState: x.resetRhythmverseScreenState, searchField: x.searchField, setRhythmverseScreenState: x.setRhythmverseScreenState, active: x.active, selectedTab: x.selectedTab, searchResults: x.searchResults })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))

  return (
    <AnimatedSection id="RhythmverseScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      <div className="mb-2 flex-row! border-b border-white/25 pb-1">
        <div className="mr-auto">
          <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('browseRhythmverse')}</h1>
        </div>
        <div className="absolute! right-0 flex-row!">
          <button
            disabled={disableButtons}
            className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              resetRhythmverseScreenState()
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
      </div>
      {selectedTab === RHYTHMVERSE_SCREEN_TABS.BROWSE && (
        <>
          <form>
            <div className="mb-4 w-full flex-row! items-center rounded-sm border border-neutral-900 bg-neutral-800 px-3 py-1">
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
                  if (searchField.length <= 3) {
                    setMessageBoxState({ message: { type: 'error', code: 'rhythmverseSearchFieldTooSmall' } })
                    setWindowState({ disableButtons: false })
                    return
                  }
                  const newSearchResults = await window.api.fetchRhythmverseData('text', searchField)
                  if (VERBOSE.STRUCT) console.log('struct ProcessedRhythmverseObject ["core/src/lib/rbtools/core/RhythmverseAPI.ts"]:', newSearchResults)
                  setRhythmverseScreenState({ searchResults: newSearchResults })
                  setWindowState({ disableButtons: false })
                }}
              >
                {t('search')}
              </button>
            </div>
          </form>
          <div className="h-full w-full overflow-y-auto">
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
                    return (
                      <div className="group flex-row! items-center rounded-xs p-2 duration-200 hover:bg-white/5" key={`rhythmverseResultsSong${songI}`}>
                        {/* <div className="mr-4 mb-2 flex-row! items-center rounded-sm border p-2 last:mb-0"> */}
                        <img
                          src={song.album_art}
                          className="mr-2 h-20 min-h-20 w-20 min-w-20 border-2 border-neutral-700"
                          onError={(ev) => {
                            ev.currentTarget.onerror = null
                            ev.currentTarget.src = 'rbicons://rockshelf'
                          }}
                        />
                        <div className="h-full">
                          <h1 className="text-xl">{song.name || ''}</h1>
                          <h2 className="text-xs text-neutral-500 italic">{song.artist || ''}</h2>
                          <div className="mt-auto">
                            <div className="flex-row! items-center">
                              <img src="rbicons://instrument-icons-guitar" title={t('guitar')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_guitar || -1} />
                              <img src="rbicons://instrument-icons-bass" title={t('bass')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_bass || -1} />
                              <img src="rbicons://instrument-icons-drums" title={t('drums')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_drum || -1} />
                              <img src="rbicons://instrument-icons-keys" title={t('keys')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_keys || -1} />
                              <img src="rbicons://instrument-icons-vocals" title={t('vocals')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_vocals || -1} />
                            </div>
                            <div className="flex-row! items-center">
                              <img src="rbicons://instrument-icons-proGuitar" title={t('proGuitar')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_real_guitar || -1} />
                              <img src="rbicons://instrument-icons-proBass" title={t('proBass')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_real_bass || -1} />
                              <img src="rbicons://instrument-icons-proDrums" title={t('proDrums')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_drum || -1} />
                              <img src="rbicons://instrument-icons-proKeys" title={t('proKeys')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_real_keys || -1} />
                              <img src={song.vocal_parts === 2 ? 'rbicons://instrument-icons-harm2' : 'rbicons://instrument-icons-harmonies'} title={t(song.vocal_parts === 2 ? 'harm2' : 'harm3')} className="mr-1 h-4 w-4" />
                              <DiffIconInline width={0.8} diff={song.rank_vocals || -1} />
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
    </AnimatedSection>
  )
}
