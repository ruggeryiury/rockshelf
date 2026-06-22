import clsx from 'clsx'
import zod from 'zod'
import { useShallow } from 'zustand/shallow'
import { useEditSongScreenState } from './EditSongScreen.state'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/stores/Window.state'
import { AnimatedDiv, AnimatedSection, TransComponent, animate, formatMillisecondsToTimeDuration, rankCalculator, sleep, underscoreToUppercaseLetter } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useEffect, useMemo, useRef } from 'react'
import { CheckedBoxIcon, ChevronDownIcon, ChevronUpIcon, DiamondIcon, UncheckedBoxIcon } from '@renderer/assets/icons'
import { DTA_STRUCT, EDIT_SONG_SCREEN_DROPDOWNS, EDIT_SONG_SCREEN_TABS, GAME_ORIGIN_HEADERS } from '@renderer/app/rockshelf.globals'

export function EditSongScreen() {
  const { t } = useTranslation()

  const { hasUnsavedChanges, isEditingSong, resetEditSongScreenState, setEditSongScreenState, editSongScreenTab, songEntryID, songEntryIDError, master, fake, songname, songnameError, songID, songIDError, multitrack, rhythmPart, unpitchedVocals, convert, doubleKick, reductionsStatus, name, artist, albumArt, genre, subGenre, author, loadingPhrase, songRating, dropdownActivated, dxGenre, enableDXGenre, dxGameOrigin, enableDXGameOrigin, yearReleased, yearReleasedEdit, yearRecorded, yearRecordedEdit } = useEditSongScreenState(useShallow((x) => x))

  const { disableButtons, packages } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState, packages: x.packages })))

  const { selPKG, selSong, artworkURL } = useMyPackagesScreenState(useShallow((x) => ({ selPKG: x.selPKG, selSong: x.selSong, isArtworkLoading: x.isArtworkLoading, artworkURL: x.artworkURL, setMyPackagesScreenState: x.setMyPackagesScreenState, songDetailsTab: x.songDetailsTab, songLeaderboards: x.songLeaderboards })))

  const packageDetails = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages ? packages.packages[selPKG] : null), [packages, selPKG])

  const songDetails = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages && selSong > -1 && packageDetails !== null && selSong in packageDetails.songs ? packageDetails.songs[selSong] : null), [packages, selPKG, selSong])

  const currentYear = useMemo(() => new Date().getFullYear(), [])

  const active = useMemo(() => songDetails !== null && selSong > -1 && isEditingSong !== false, [songDetails, selSong, isEditingSong])

  // const formattedSongLength = useMemo(() => formatMillisecondsToTimeDuration(songLength), [songLength])
  const genreSelectorDivRef = useRef<HTMLDivElement>(null)
  const gameOriginSelectorDivRef = useRef<HTMLDivElement>(null)

  const yearReleasedEditInputRef = useRef<HTMLInputElement>(null)
  const yearRecordedEditInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      let triggerEvent = false
      if (dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GENRE) {
        if (genreSelectorDivRef.current?.contains(event.target as Node | null)) return
        triggerEvent = true
      } else if (dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GAME_ORIGIN) {
        if (gameOriginSelectorDivRef.current?.contains(event.target as Node | null)) return
        triggerEvent = true
      }

      if (triggerEvent && dropdownActivated > -1) setEditSongScreenState({ dropdownActivated: -1 })
    }

    document.addEventListener('mousedown', handleGlobalClick)
    return () => document.removeEventListener('mousedown', handleGlobalClick)
  }, [dropdownActivated, genreSelectorDivRef, gameOriginSelectorDivRef])

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (yearReleasedEdit !== null) {
        if (yearReleasedEditInputRef.current?.contains(event.target as Node | null)) return

        setEditSongScreenState({ yearReleased: zod.coerce.number().parse(yearReleasedEdit.length === 0 ? yearReleased : yearReleasedEdit), yearReleasedEdit: null })
      }
    }

    document.addEventListener('mousedown', handleGlobalClick)
    return () => document.removeEventListener('mousedown', handleGlobalClick)
  }, [yearReleasedEdit])

  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      if (yearRecordedEdit !== null) {
        if (yearRecordedEditInputRef.current?.contains(event.target as Node | null)) return

        setEditSongScreenState({ yearRecorded: zod.coerce.number().parse(yearRecordedEdit.length === 0 ? yearRecorded : yearRecordedEdit), yearRecordedEdit: null })
      }
    }

    document.addEventListener('mousedown', handleGlobalClick)
    return () => document.removeEventListener('mousedown', handleGlobalClick)
  }, [yearRecordedEdit])

  return (
    <AnimatedSection id="EditSongScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black p-8">
      {songDetails !== null && packageDetails !== null && isEditingSong === true && (
        <>
          <div className="flex-row! items-center border-b border-white/15 pb-2">
            <img src={artworkURL || 'rbicons://website'} className="mr-2 h-32 min-h-32 w-32 min-w-32 border-2 border-neutral-700" />

            <div className="mr-auto h-full">
              <h1 className="font-pentatonicalt! mb-2 text-[2rem]">{t('editingSongTitle', { songName: songDetails.name })}</h1>
            </div>
            <button
              disabled={disableButtons}
              className="ml-6 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                resetEditSongScreenState()
              }}
            >
              {t('goBack')}
            </button>
          </div>
          <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
            <button
              disabled={disableButtons}
              className={clsx('flex-row! items-center', (songEntryIDError || songnameError || songIDError) && editSongScreenTab === EDIT_SONG_SCREEN_TABS.SONG_ENTRY ? 'bg-red-500 text-black/90' : songEntryIDError || songnameError || songIDError ? 'text-red-500 hover:text-red-400 active:text-red-300' : editSongScreenTab === EDIT_SONG_SCREEN_TABS.SONG_ENTRY ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setEditSongScreenState({ editSongScreenTab: EDIT_SONG_SCREEN_TABS.SONG_ENTRY })
              }}
            >
              {t('songEntry')}
            </button>
            <button
              disabled={disableButtons}
              className={clsx('flex-row! items-center', editSongScreenTab === EDIT_SONG_SCREEN_TABS.METADATA ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setEditSongScreenState({ editSongScreenTab: EDIT_SONG_SCREEN_TABS.METADATA })
              }}
            >
              {t('metadata')}
            </button>
            <button
              disabled={disableButtons}
              className={clsx('flex-row! items-center', editSongScreenTab === EDIT_SONG_SCREEN_TABS.INSTRUMENT_DATA ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setEditSongScreenState({ editSongScreenTab: EDIT_SONG_SCREEN_TABS.INSTRUMENT_DATA })
              }}
            >
              {t('instrumentData')}
            </button>
            <button
              disabled={disableButtons}
              className={clsx('flex-row! items-center', editSongScreenTab === EDIT_SONG_SCREEN_TABS.TECHNICAL_DATA ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setEditSongScreenState({ editSongScreenTab: EDIT_SONG_SCREEN_TABS.TECHNICAL_DATA })
              }}
            >
              {t('technicalData')}
            </button>
            <button
              disabled={disableButtons}
              className={clsx('flex-row! items-center', editSongScreenTab === EDIT_SONG_SCREEN_TABS.DELUXE_AND_MAGMA ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
              onClick={() => {
                setEditSongScreenState({ editSongScreenTab: EDIT_SONG_SCREEN_TABS.DELUXE_AND_MAGMA })
              }}
            >
              <DiamondIcon className="relative top-[0.15rem] mr-1 rotate-45 duration-100" />
              {t('deluxeAndMagma')}
            </button>
          </div>
          <div className="h-full w-full overflow-y-auto">
            {/* 
              // region HEADER: Song Entry
              */}
            {editSongScreenTab === EDIT_SONG_SCREEN_TABS.SONG_ENTRY && (
              <>
                {/* 
              // region Song Entry ID
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-2 uppercase">{t('songEntryID')}</h1>
                    <h2 className={clsx('mr-auto text-xs font-semibold', songEntryIDError !== null && 'text-red-500/80')}>{`${songEntryID.length}/64`}</h2>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ songEntryID: songDetails.id, songEntryIDError: null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="songEntryIDDesc" />
                  </p>
                  <input
                    value={songEntryID}
                    className={clsx('mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900', songEntryIDError && 'border-red-500!')}
                    onChange={async (ev) => {
                      const value = DTA_STRUCT.validators.id.safeParse(ev.target.value)

                      if (!value.success) {
                        setEditSongScreenState({ songEntryID: ev.target.value, songEntryIDError: value.error.issues[0].message, hasUnsavedChanges: true })
                      } else setEditSongScreenState({ songEntryID: value.data, songEntryIDError: null, hasUnsavedChanges: true })
                    }}
                  />
                  <AnimatedDiv condition={songEntryIDError !== null} {...animate({ height: true, scaleY: true, opacity: true })}>
                    <div className="h-2" />
                    {songEntryIDError !== null && <p className="origin-top text-xs text-red-500 italic">{t(`inputErrorID${underscoreToUppercaseLetter(songEntryIDError, true)}`)}</p>}
                  </AnimatedDiv>
                </div>

                {/* 
              // region Internal Name
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-2 uppercase">{t('internalName')}</h1>
                    <h2 className={clsx('mr-auto text-xs font-semibold', songnameError !== null && 'text-red-500/80')}>{`${songname.length}/42`}</h2>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ songname: songDetails.songname, songnameError: null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="internalNameDesc" />
                  </p>
                  <input
                    value={songname}
                    className={clsx('mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900', songnameError && 'border-red-500!')}
                    onChange={async (ev) => {
                      const value = DTA_STRUCT.validators.songname.safeParse(ev.target.value)

                      if (!value.success) {
                        setEditSongScreenState({ songname: ev.target.value, songnameError: value.error.issues[0].message, hasUnsavedChanges: true })
                      } else setEditSongScreenState({ songname: value.data, songnameError: null, hasUnsavedChanges: true })
                    }}
                  />
                  <AnimatedDiv condition={songnameError !== null} {...animate({ height: true, scaleY: true, opacity: true })}>
                    <div className="h-2" />
                    {songnameError !== null && <p className="origin-top text-xs text-red-500 italic">{t(`inputErrorSongname${underscoreToUppercaseLetter(songnameError, true)}`)}</p>}
                  </AnimatedDiv>
                </div>

                {/* 
              // region Song ID
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-auto mb-1 uppercase">{t('songID')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ songID: songDetails.song_id.toString(), songIDError: null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="songIDDesc" />
                  </p>
                  <input
                    value={songID}
                    className={clsx('mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900', songIDError && 'border-red-500!')}
                    onChange={async (ev) => {
                      const value = DTA_STRUCT.validators.song_id.safeParse(ev.target.value)

                      if (!value.success) {
                        setEditSongScreenState({ songID: ev.target.value, songIDError: value.error.issues[0].message, hasUnsavedChanges: true })
                      } else setEditSongScreenState({ songID: value.data, songIDError: null, hasUnsavedChanges: true })
                    }}
                  />
                  <AnimatedDiv condition={songIDError !== null} {...animate({ height: true, scaleY: true, opacity: true })}>
                    <div className="h-2" />
                    {songIDError !== null && <p className="origin-top text-xs text-red-500 italic">{t(`inputErrorSongID${underscoreToUppercaseLetter(songIDError, true)}`)}</p>}
                  </AnimatedDiv>
                </div>

                {/* 
              // region Fake Entry
              */}
                <div className="flex-row! items-center">
                  <div className="group h-full w-full rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="flex-row! items-center">
                      <button
                        className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                        onClick={async () => {
                          setEditSongScreenState({ fake: !fake, hasUnsavedChanges: true })
                        }}
                      >
                        {fake ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h1 className="mb-1 uppercase">{t('fakeEntry')}</h1>
                    </div>
                    <p className="text-xs italic">
                      <TransComponent i18nKey="fakeEntryDesc" />
                    </p>
                  </div>
                </div>
              </>
            )}
            {/* 
              // region HEADER: Metadata
              */}
            {editSongScreenTab === EDIT_SONG_SCREEN_TABS.METADATA && (
              <>
                {/* 
              // region || FLEX
              */}
                <div className="flex-row! items-center">
                  {/* 
              // region _______Song Title
              */}
                  <div className="group h-fill w-[75%] rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="mb-1 flex-row! items-center">
                      <h1 className="mr-auto mb-1 uppercase">{t('songTitle')}</h1>
                      <button
                        className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        disabled={disableButtons}
                        onClick={async () => {
                          setEditSongScreenState({ name: songDetails.name })
                        }}
                      >
                        {t('revert')}
                      </button>
                    </div>
                    <input
                      value={name}
                      className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      onChange={async (ev) => {
                        setEditSongScreenState({ name: ev.target.value, hasUnsavedChanges: true })
                      }}
                    />
                  </div>

                  {/* 
              // region _______Master
              */}
                  <div className="group h-full w-[25%] rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="flex-row! items-center">
                      <button
                        className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                        onClick={async () => {
                          setEditSongScreenState({ master: !master, hasUnsavedChanges: true })
                        }}
                      >
                        {master ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h1 className="mb-1 uppercase">{t('isMasterRecording')}</h1>
                    </div>
                    <p className="text-xs italic">
                      <TransComponent i18nKey="isMasterRecordingDesc" />
                    </p>
                  </div>
                </div>

                {/* 
              // region || FLEX
              */}
                <div className="flex-row! items-center">
                  {/* 
              // region _______Artist
              */}
                  <div className="group h-fill w-[75%] rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="mb-1 flex-row! items-center">
                      <h1 className="mr-auto mb-1 uppercase">{t('artist')}</h1>
                      <button
                        className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        disabled={disableButtons}
                        onClick={async () => {
                          setEditSongScreenState({ artist: songDetails.artist })
                        }}
                      >
                        {t('revert')}
                      </button>
                    </div>
                    <input
                      value={artist}
                      className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      onChange={async (ev) => {
                        setEditSongScreenState({ artist: ev.target.value, hasUnsavedChanges: true })
                      }}
                    />
                  </div>

                  {/* 
              // region _______Year Released
              */}
                  <div className="group h-fill w-[25%] rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="mb-1 flex-row! items-center">
                      <h1 className="mr-auto mb-1 uppercase">{t('yearReleased')}</h1>
                      <button
                        className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        disabled={disableButtons}
                        onClick={async () => {
                          setEditSongScreenState({ yearReleased: songDetails.year_released, yearReleasedEdit: null })
                        }}
                      >
                        {t('revert')}
                      </button>
                    </div>

                    <div className="flex-row! items-center">
                      {yearReleasedEdit === null && (
                        <h2
                          className="font-pentatonic mr-2 w-20 cursor-pointer border-b-2 border-transparent text-2xl duration-100 active:text-neutral-100"
                          onDoubleClick={async () => {
                            setEditSongScreenState({ yearReleasedEdit: yearReleased.toString() })
                            await sleep(100)
                            yearReleasedEditInputRef.current?.focus()
                            yearReleasedEditInputRef.current?.setSelectionRange(yearReleased.toString().length, yearReleased.toString().length)
                          }}
                        >
                          {yearReleased}
                        </h2>
                      )}
                      <input
                        value={yearReleasedEdit ?? ''}
                        ref={yearReleasedEditInputRef}
                        onChange={(ev) =>
                          setEditSongScreenState({
                            yearReleasedEdit: zod
                              .string()
                              .transform((val) => val.replace(/\D/g, ''))
                              .parse(ev.target.value),
                          })
                        }
                        className={clsx('font-pentatonic mr-2 w-20 cursor-pointer text-2xl duration-100 active:text-neutral-100', yearReleasedEdit === null ? 'hidden!' : 'flex! border-b-2 border-white/15')}
                        minLength={1}
                        maxLength={currentYear.toString().length}
                      />
                      <div className="mr-2 text-xs!">
                        <button
                          className="p-0.5 duration-100 hover:bg-white/10 active:bg-white/20 disabled:text-neutral-900 disabled:hover:bg-transparent disabled:active:bg-transparent"
                          disabled={disableButtons || yearReleased >= currentYear}
                          onClick={async () => {
                            if (yearReleased >= currentYear) setEditSongScreenState({ yearReleased: currentYear, hasUnsavedChanges: true })
                            else setEditSongScreenState({ yearReleased: yearReleased + 1, hasUnsavedChanges: true })
                          }}
                        >
                          <ChevronUpIcon />
                        </button>
                        <button
                          disabled={disableButtons || yearReleased <= 0}
                          onClick={async () => {
                            if (yearReleased <= 0) setEditSongScreenState({ yearReleased: 0, hasUnsavedChanges: true })
                            else setEditSongScreenState({ yearReleased: yearReleased - 1, hasUnsavedChanges: true })
                          }}
                          className="p-0.5 duration-100 hover:bg-white/10 active:bg-white/20 disabled:text-neutral-900 disabled:hover:bg-transparent disabled:active:bg-transparent"
                        >
                          <ChevronDownIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 
              // region || FLEX
              */}
                <div className="flex-row! items-center">
                  {/* 
              // region _______Album Art Loading
              */}
                  <div className="group h-fill w-[75%] rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="flex-row! items-center">
                      <button
                        className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                        onClick={async () => {
                          setEditSongScreenState({ albumArt: !albumArt, hasUnsavedChanges: true })
                        }}
                      >
                        {albumArt ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h1 className="mr-auto mb-1 uppercase">{t('albumArtEnabled')}</h1>
                      <button
                        className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        disabled={disableButtons}
                        onClick={async () => {
                          setEditSongScreenState({ albumArt: songDetails.album_art })
                        }}
                      >
                        {t('revert')}
                      </button>
                    </div>
                    <p className="text-xs italic">
                      <TransComponent i18nKey="albumArtEnabledDesc" />
                    </p>
                  </div>

                  {/* 
              // region _______Year Recorded
              */}
                  <div className="group h-fill w-[25%] rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="mb-1 flex-row! items-center">
                      <button
                        className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                        onClick={async () => {
                          setEditSongScreenState({ yearRecorded: yearRecorded === null ? currentYear : null, hasUnsavedChanges: true })
                        }}
                      >
                        {yearRecorded !== null ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h1 className="mr-auto mb-1 uppercase">{t('yearRecorded')}</h1>
                      <button
                        className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        disabled={disableButtons}
                        onClick={async () => {
                          setEditSongScreenState({ yearRecorded: songDetails.year_recorded ?? null, yearRecordedEdit: null })
                        }}
                      >
                        {t('revert')}
                      </button>
                    </div>

                    <div className={clsx('flex-row! items-center', yearRecorded === null && 'hidden!')}>
                      {yearRecordedEdit === null && (
                        <h2
                          className="font-pentatonic mr-2 w-20 cursor-pointer border-b-2 border-transparent text-2xl duration-100 active:text-neutral-100"
                          onDoubleClick={async () => {
                            setEditSongScreenState({ yearRecordedEdit: yearRecorded === null ? currentYear.toString() : yearRecorded.toString() })
                            await sleep(100)
                            yearRecordedEditInputRef.current?.focus()
                            yearRecordedEditInputRef.current?.setSelectionRange(yearRecorded === null ? currentYear.toString().length : yearRecorded.toString().length, yearRecorded === null ? currentYear.toString().length : yearRecorded.toString().length)
                          }}
                        >
                          {yearRecorded}
                        </h2>
                      )}
                      <input
                        value={yearRecordedEdit ?? ''}
                        ref={yearRecordedEditInputRef}
                        onChange={(ev) =>
                          setEditSongScreenState({
                            yearRecordedEdit: zod
                              .string()
                              .transform((val) => val.replace(/\D/g, ''))
                              .parse(ev.target.value),
                          })
                        }
                        className={clsx('font-pentatonic mr-2 w-20 cursor-pointer text-2xl duration-100 active:text-neutral-100', yearRecordedEdit === null ? 'hidden!' : 'flex! border-b-2 border-white/15')}
                        minLength={1}
                        maxLength={currentYear.toString().length}
                      />
                      <div className="mr-2 text-xs!">
                        <button
                          className="p-0.5 duration-100 hover:bg-white/10 active:bg-white/20 disabled:text-neutral-900 disabled:hover:bg-transparent disabled:active:bg-transparent"
                          disabled={disableButtons || (yearRecorded !== null && yearRecorded >= currentYear)}
                          onClick={async () => {
                            if (yearRecorded !== null && yearRecorded >= currentYear) setEditSongScreenState({ yearRecorded: currentYear, hasUnsavedChanges: true })
                            else setEditSongScreenState({ yearRecorded: yearRecorded !== null ? yearRecorded + 1 : currentYear, hasUnsavedChanges: true })
                          }}
                        >
                          <ChevronUpIcon />
                        </button>
                        <button
                          disabled={disableButtons || (yearRecorded !== null && yearRecorded <= 0)}
                          onClick={async () => {
                            if (yearRecorded !== null && yearRecorded <= 0) setEditSongScreenState({ yearRecorded: 0, hasUnsavedChanges: true })
                            else setEditSongScreenState({ yearRecorded: yearRecorded !== null ? yearRecorded - 1 : currentYear, hasUnsavedChanges: true })
                          }}
                          className="p-0.5 duration-100 hover:bg-white/10 active:bg-white/20 disabled:text-neutral-900 disabled:hover:bg-transparent disabled:active:bg-transparent"
                        >
                          <ChevronDownIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 
              // region Song Rating
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="mb-1 flex-row! items-center">
                    <h1 className="mr-auto uppercase">{t('songRating')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ songRating: songDetails.rating })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="songRatingDesc" />
                  </p>

                  <div className="flex-row! flex-wrap items-center gap-2">
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', songRating === 1 ? 'bg-green-500 text-neutral-900 hover:bg-green-400 active:bg-green-300' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ songRating: 1, hasUnsavedChanges: true })}>
                      <h1>{t('songRating1')}</h1>
                    </button>

                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', songRating === 2 ? 'bg-yellow-500 text-neutral-900 hover:bg-yellow-400 active:bg-yellow-300' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ songRating: 2, hasUnsavedChanges: true })}>
                      <h1>{t('songRating2')}</h1>
                    </button>

                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', songRating === 3 ? 'bg-red-500 text-neutral-900 hover:bg-red-400 active:bg-red-300' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ songRating: 3, hasUnsavedChanges: true })}>
                      <h1>{t('songRating3')}</h1>
                    </button>

                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', songRating === 4 ? 'bg-red-500 text-neutral-900 hover:bg-red-400 active:bg-red-300' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ songRating: 4, hasUnsavedChanges: true })}>
                      <h1>{t('songRating4')}</h1>
                    </button>
                  </div>
                </div>

                {/* 
              // region Genre & Sub-Genre
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="mb-1 flex-row! items-center">
                    <h1 className="mr-auto mb-1 uppercase">{t('genreSubGenre')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ genre: songDetails.genre, subGenre: songDetails.sub_genre || DTA_STRUCT.defaultSubgenre[songDetails.genre] })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>

                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="genreSubGenreDesc" />
                  </p>
                  <div className="mb-2 flex-row! flex-wrap items-center gap-2">
                    {DTA_STRUCT.allGenresKeys.map((genreKey) => (
                      <button key={`genreBtns__${genreKey}`} className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', genre === genreKey ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={() => setEditSongScreenState({ genre: genreKey, subGenre: DTA_STRUCT.defaultSubgenre[genreKey], hasUnsavedChanges: true })}>
                        <h1>{t(genreKey)}</h1>
                      </button>
                    ))}
                  </div>
                  <div className="mb-4 h-px w-full bg-white/25" />
                  {DTA_STRUCT.allGenresKeys.map((genreName, genreI) => (
                    <div key={`genreName__${genreName}${genreI}`} className="flex-row! flex-wrap items-center gap-2">
                      {genre === genreName &&
                        DTA_STRUCT.subGenresAllowed[genreName].map((subGenreName, subGenreI) => (
                          <button key={`subGenreOpts__${subGenreName}${subGenreI}`} className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', subGenre === subGenreName ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ subGenre: subGenreName, hasUnsavedChanges: true })}>
                            <h1>{t(subGenreName)}</h1>
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </>
            )}
            {/* 
              // region HEADER: Instrument Data
              */}
            {editSongScreenTab === EDIT_SONG_SCREEN_TABS.INSTRUMENT_DATA && (
              <>
                <div className="group flex-row! items-center rounded-xs p-2 duration-200 hover:bg-white/5">
                  <img src="rbicons://instrument-icons-drums" title={t('drums')} className="mr-1 h-12 w-12 duration-100" />
                </div>
                <div className="group flex-row! items-center rounded-xs p-2 duration-200 hover:bg-white/5">
                  <img src="rbicons://instrument-icons-bass" title={t('bass')} className="mr-1 h-12 w-12 duration-100" />
                </div>
                <div className="group flex-row! items-center rounded-xs p-2 duration-200 hover:bg-white/5">
                  <img src="rbicons://instrument-icons-guitar" title={t('guitar')} className="mr-1 h-12 w-12 duration-100" />
                </div>
                <div className="group flex-row! items-center rounded-xs p-2 duration-200 hover:bg-white/5">
                  <img src="rbicons://instrument-icons-keys" title={t('keys')} className="mr-1 h-12 w-12 duration-100" />
                </div>
                <div className="group flex-row! items-center rounded-xs p-2 duration-200 hover:bg-white/5">
                  <img src="rbicons://instrument-icons-vocals" title={t('vocals')} className="mr-1 h-12 w-12 duration-100" />
                </div>
              </>
            )}
            {/* 
              // region HEADER: Technical Data
              */}
            {editSongScreenTab === EDIT_SONG_SCREEN_TABS.TECHNICAL_DATA && <></>}
            {/* 
              // region HEADER: Deluxe
              */}
            {editSongScreenTab === EDIT_SONG_SCREEN_TABS.DELUXE_AND_MAGMA && (
              <>
                {/* 
              // region Deluxe Genre
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <button
                      className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                      onClick={async () => {
                        if (enableDXGenre) setEditSongScreenState({ enableDXGenre: false, hasUnsavedChanges: true })
                        else
                          setEditSongScreenState({
                            enableDXGenre: true,
                            hasUnsavedChanges: true,
                            dxGenre: songDetails.genre,
                            // dxSubGenre: songDetails.sub_genre ?? DTA_STRUCT.defaultSubgenre[songDetails.genre]
                          })
                      }}
                    >
                      {enableDXGenre ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                    </button>
                    <h1 className="mb-1 uppercase">{t('enableDXGenre')}</h1>
                  </div>
                  <AnimatedDiv condition={enableDXGenre} ref={genreSelectorDivRef}>
                    <div className="h-2 w-full" />
                    <button onClick={() => setEditSongScreenState({ dropdownActivated: dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GENRE ? -1 : EDIT_SONG_SCREEN_DROPDOWNS.GENRE })} className={clsx('w-full flex-row! items-start border border-white/10 p-1 text-start normal-case! hover:border-white/20 active:border-white/45', dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GENRE ? 'rounded-t-sm' : 'rounded-sm')}>
                      {t(dxGenre)}

                      <ChevronDownIcon className={clsx('ml-auto self-center text-xl', dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GENRE && 'rotate-90')} />
                    </button>
                    <AnimatedDiv condition={dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GENRE} {...animate({ opacity: true, duration: 0.1 })} className="absolute! top-full z-16 max-h-64 min-h-64 w-full origin-top overflow-y-auto rounded-b-sm border border-white/10 bg-black/95 p-1">
                      {DTA_STRUCT.allGenresKeysDX.map((g, gIndex) => {
                        return (
                          <button className={clsx('flex-row! items-center p-2 normal-case! duration-100', dxGenre === g ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'hover:bg-white/10')} key={`genreSelector__${g}${gIndex}`} onClick={() => setEditSongScreenState({ dxGenre: g, dropdownActivated: -1 })}>
                            {t(g)}
                          </button>
                        )
                      })}
                    </AnimatedDiv>
                  </AnimatedDiv>
                </div>

                {/* 
              // region Deluxe Game Origin
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <button
                      className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                      onClick={async () => {
                        if (enableDXGameOrigin) setEditSongScreenState({ enableDXGameOrigin: false, hasUnsavedChanges: true })
                        else
                          setEditSongScreenState({
                            enableDXGameOrigin: true,
                            hasUnsavedChanges: true,
                            dxGameOrigin: songDetails.game_origin,
                            // dxSubGenre: songDetails.sub_genre ?? DTA_STRUCT.defaultSubgenre[songDetails.genre]
                          })
                      }}
                    >
                      {enableDXGameOrigin ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                    </button>
                    <h1 className="mb-1 uppercase">{t('enableDXGameOrigin')}</h1>
                  </div>
                  {/* <p className="text-xs italic">
                    <TransComponent i18nKey="enableDXGameOriginDesc" />
                  </p> */}
                  <AnimatedDiv condition={enableDXGameOrigin} ref={gameOriginSelectorDivRef}>
                    <div className="h-2 w-full" />
                    <button onClick={() => setEditSongScreenState({ dropdownActivated: dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GAME_ORIGIN ? -1 : EDIT_SONG_SCREEN_DROPDOWNS.GAME_ORIGIN })} className={clsx('w-full flex-row! items-start border border-white/10 p-1 text-start normal-case! hover:border-white/20 active:border-white/45', dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GAME_ORIGIN ? 'rounded-t-sm' : 'rounded-sm')}>
                      {t(`gameOrigin__${dxGameOrigin}`)}

                      <ChevronDownIcon className={clsx('ml-auto self-center text-xl', dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GAME_ORIGIN && 'rotate-90')} />
                    </button>
                    <AnimatedDiv condition={dropdownActivated === EDIT_SONG_SCREEN_DROPDOWNS.GAME_ORIGIN} {...animate({ opacity: true, duration: 0.1 })} className="absolute! top-full z-16 max-h-72 min-h-72 w-full origin-top overflow-y-auto rounded-b-sm border border-white/10 bg-black/95 p-1">
                      <h1 className="mb-2 pl-2 text-lg text-neutral-500 uppercase">{t('official')}</h1>
                      {GAME_ORIGIN_HEADERS.filter((header) => header.official).map((originHeader, originHeaderIndex) => {
                        return (
                          <div key={`goHeader__${originHeader.code}${originHeaderIndex}`} className="last: border-transparent last:mb-0">
                            <h1 className="z-20 bg-neutral-900 p-2 uppercase">{t(originHeader.code)}</h1>
                            {originHeader.options.map((originOpts, originOptsIndex) => {
                              return (
                                <button key={`goOpts__${originOpts}${originOptsIndex}`} className={clsx('p-2 normal-case! duration-100', dxGameOrigin === originOpts ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'hover:bg-white/10')} onClick={() => setEditSongScreenState({ dxGameOrigin: originOpts, dropdownActivated: -1 })}>
                                  <h1 className="w-fit">{t(`gameOrigin__${originOpts}`)}</h1>
                                  <p className="w-fit font-mono text-sm">{originOpts}</p>
                                </button>
                              )
                            })}
                          </div>
                        )
                      })}
                      <div className="mb-4 border-b border-white/15" />
                      <h1 className="mb-2 pl-2 text-lg text-neutral-500 uppercase">{t('unofficial')}</h1>
                      {GAME_ORIGIN_HEADERS.filter((header) => !header.official).map((originHeader, originHeaderIndex) => {
                        return (
                          <div key={`goHeader__${originHeader.code}${originHeaderIndex}`}>
                            <h1 className="z-20 bg-neutral-900 p-2 uppercase">{t(originHeader.code)}</h1>
                            {originHeader.options.map((originOpts, originOptsIndex) => {
                              return (
                                <button key={`goOpts__${originOpts}${originOptsIndex}`} className={clsx('p-2 normal-case! duration-100', dxGameOrigin === originOpts ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'hover:bg-white/10')} onClick={() => setEditSongScreenState({ dxGameOrigin: originOpts, dropdownActivated: -1 })}>
                                  <h1 className="w-fit">{t(`gameOrigin__${originOpts}`)}</h1>
                                  <p className="w-fit font-mono text-sm">{originOpts}</p>
                                </button>
                              )
                            })}
                          </div>
                        )
                      })}
                    </AnimatedDiv>
                  </AnimatedDiv>
                </div>

                {/* 
              // region Author
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-auto mb-1 uppercase">{t('author')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ author: songDetails.author ?? '' })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="authorDesc" />
                  </p>
                  <input value={author} className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" onChange={async (ev) => setEditSongScreenState({ author: ev.target.value, hasUnsavedChanges: true })} />
                </div>

                {/* 
              // region Loading Phrase
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-auto mb-1 uppercase">{t('loadingPhrase')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ loadingPhrase: songDetails.loading_phrase ?? '' })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="loadingPhraseDesc" />
                  </p>
                  <input value={loadingPhrase} className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" onChange={async (ev) => setEditSongScreenState({ loadingPhrase: ev.target.value, hasUnsavedChanges: true })} />
                </div>

                {/* 
              // region Multitrack
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-auto mb-1 uppercase">{t('multitrackStatus')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ multitrack: songDetails.multitrack || null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="multitrackStatusDesc" />
                  </p>
                  <div className="flex-row! flex-wrap items-center gap-2">
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', multitrack === null ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ multitrack: null, hasUnsavedChanges: true })}>
                      <h1>{t('multitrackNone')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', multitrack === 'full' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ multitrack: 'full', hasUnsavedChanges: true })}>
                      <h1>{t('multitrackFull')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', multitrack === 'diy_stems' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ multitrack: 'diy_stems', hasUnsavedChanges: true })}>
                      <h1>{t('multitrackFullDIY')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', multitrack === 'partial' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ multitrack: 'partial', hasUnsavedChanges: true })}>
                      <h1>{t('multitrackPartial')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', multitrack === 'karaoke' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ multitrack: 'karaoke', hasUnsavedChanges: true })}>
                      <h1>{t('multitrackKaraoke')}</h1>
                    </button>
                  </div>
                </div>

                {/* 
              // region Rhythm Part
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-auto mb-1 uppercase">{t('rhythmPart')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ rhythmPart: songDetails.rhythmOn || null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="rhythmPartDesc" />
                  </p>
                  <div className="flex-row! flex-wrap items-center gap-2">
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', rhythmPart === null ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ rhythmPart: null, hasUnsavedChanges: true })}>
                      <h1>{t('noRhythmPart')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', rhythmPart === 'bass' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ rhythmPart: 'bass', hasUnsavedChanges: true })}>
                      <h1>{t('rhythmOnBass')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', rhythmPart === 'keys' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ rhythmPart: 'keys', hasUnsavedChanges: true })}>
                      <h1>{t('rhythmOnKeys')}</h1>
                    </button>
                  </div>
                </div>

                {/* 
              // region Reductions Status
              */}
                <div className="group rounded-xs p-2 duration-200 hover:bg-white/5">
                  <div className="flex-row! items-center">
                    <h1 className="mr-auto mb-1 uppercase">{t('reductionsStatus')}</h1>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setEditSongScreenState({ reductionsStatus: songDetails.emh || null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-xs italic">
                    <TransComponent i18nKey="reductionsStatusDesc" />
                  </p>
                  <div className="flex-row! flex-wrap items-center gap-2">
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', reductionsStatus === null ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ reductionsStatus: null, hasUnsavedChanges: true })}>
                      <h1>{t('revised')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', reductionsStatus === 'cat' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ reductionsStatus: 'cat', hasUnsavedChanges: true })}>
                      <h1>{t('cat')}</h1>
                    </button>
                    <button className={clsx('w-fit flex-row! items-center rounded-xs border border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', reductionsStatus === 'expert_only' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')} disabled={disableButtons} onClick={async () => setEditSongScreenState({ reductionsStatus: 'expert_only', hasUnsavedChanges: true })}>
                      <h1>{t('expertOnly')}</h1>
                    </button>
                  </div>
                </div>

                <div className="flex-row! items-center">
                  {/* 
              // region Unpitched Vocals
              */}
                  <div className="group h-full w-1/3 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="flex-row! items-center">
                      <button
                        className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                        onClick={async () => {
                          setEditSongScreenState({ unpitchedVocals: !unpitchedVocals, hasUnsavedChanges: true })
                        }}
                      >
                        {unpitchedVocals ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h1 className="mb-1 uppercase">{t('unpitchedVocals')}</h1>
                    </div>
                    <p className="text-xs italic">
                      <TransComponent i18nKey="unpitchedVocalsDesc" />
                    </p>
                  </div>

                  {/* 
              // region Convert
              */}
                  <div className="group h-full w-1/3 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="flex-row! items-center">
                      <button
                        className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                        onClick={async () => {
                          setEditSongScreenState({ convert: !convert, hasUnsavedChanges: true })
                        }}
                      >
                        {convert ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h1 className="mb-1 uppercase">{t('convertedChart')}</h1>
                    </div>
                    <p className="text-xs italic">
                      <TransComponent i18nKey="convertedChartDesc" />
                    </p>
                  </div>

                  {/* 
              // region Double Kick
              */}
                  <div className="group h-full w-1/3 rounded-xs p-2 duration-200 hover:bg-white/5">
                    <div className="flex-row! items-center">
                      <button
                        className="mr-2 opacity-60 hover:opacity-85 active:opacity-100"
                        onClick={async () => {
                          setEditSongScreenState({ doubleKick: !doubleKick, hasUnsavedChanges: true })
                        }}
                      >
                        {doubleKick ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h1 className="mb-1 uppercase">{t('doubleKick')}</h1>
                    </div>
                    <p className="text-xs italic">
                      <TransComponent i18nKey="doubleKickDesc" />
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
