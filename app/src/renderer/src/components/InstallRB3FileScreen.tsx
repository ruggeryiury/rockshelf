import clsx from 'clsx'
import { AnimatedDiv, AnimatedSection, animate, getReadableBytesSize, underscoreToUppercaseLetter } from '@renderer/lib.exports'
import { useTranslation } from 'react-i18next'
import { useInstallRB3FileScreenState } from './InstallRB3FileScreen.state'
import { useShallow } from 'zustand/shallow'
import { useWindowState } from '@renderer/stores/Window.state'
import { INSTALL_RB3_FILE_TABS, PKG_CATEGORIES, STRUCT_LOG, VALIDATORS } from '@renderer/app/rockshelf.globals'

// Markdown
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { useMemo } from 'react'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'

export function InstallRB3FileScreen() {
  const { t, i18n } = useTranslation()
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { selectedRB3File, setInstallRB3FileScreenState, resetInstallRB3FileScreenState, installRB3FileTab, packageFolderName, packageFolderNameError, packageName, packageNameError, selectedSongs } = useInstallRB3FileScreenState(useShallow((x) => ({ selectedRB3File: x.selectedRB3File, setInstallRB3FileScreenState: x.setInstallRB3FileScreenState, resetInstallRB3FileScreenState: x.resetInstallRB3FileScreenState, installRB3FileTab: x.installRB3FileTab, packageFolderName: x.packageFolderName, packageFolderNameError: x.packageFolderNameError, packageName: x.packageName, packageNameError: x.packageNameError, selectedSongs: x.selectedSongs })))
  const { packagesCatalogSortBy } = useUserConfigState(useShallow((x) => ({ packagesCatalogSortBy: x.packagesCatalogSortBy })))
  const { setMyPackagesScreenState } = useMyPackagesScreenState(useShallow((x) => ({ setMyPackagesScreenState: x.setMyPackagesScreenState })))

  const creationDate = useMemo(() => selectedRB3File && new Date(selectedRB3File.header.dateISOString), [selectedRB3File])
  const creationDateString = useMemo(() => selectedRB3File && creationDate && creationDate.toLocaleString(i18n.language, { dateStyle: 'full' }), [selectedRB3File, creationDate, i18n.language])
  return (
    <AnimatedSection id="InstallRB3FileScreen" condition={selectedRB3File !== null} {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black p-8">
      {selectedRB3File !== null && creationDate && (
        <>
          <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
            <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('installRB3File')}</h1>
            <button
              disabled={disableButtons}
              className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                resetInstallRB3FileScreenState()
              }}
            >
              {t('cancel')}
            </button>
          </div>
          <div className="h-full w-full flex-row! overflow-y-auto">
            <div className="mr-4">
              <img src={selectedRB3File.thumbnail} className="mb-1 h-64 min-h-64 w-64 min-w-64 border-2 border-white/15" />
              <button
                className="mb-2 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                disabled={disableButtons || packageNameError !== null || packageFolderNameError !== null || selectedSongs.length === 0}
                onClick={async () => {
                  setWindowState({ disableButtons: true })
                  try {
                    const packagesData = await window.api.installRB3File(selectedRB3File.path.path, { packageName, packageFolderName, songs: selectedSongs })
                    if (STRUCT_LOG) console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', packagesData)
                    if (packagesData) {
                      const newCatalog = await window.api.sortAndFilterSongPackages(packagesCatalogSortBy)
                      if (STRUCT_LOG) console.log('struct SongPackagesFilterGenericObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
                      setMyPackagesScreenState({ packagesCatalog: newCatalog })
                      setWindowState({ packages: packagesData })
                    }
                  } catch (err) {
                    console.error(err)
                  }
                  setWindowState({ disableButtons: false })
                }}
              >
                {t('installPackage')}
              </button>
            </div>
            <div className="w-full">
              <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
                <button
                  disabled={disableButtons}
                  className={clsx('flex-row! items-center', (packageNameError || packageFolderNameError) && installRB3FileTab === INSTALL_RB3_FILE_TABS.OVERVIEW ? 'bg-red-500 text-black/90' : packageNameError || packageFolderNameError ? 'text-red-500 hover:text-red-400 active:text-red-300' : installRB3FileTab === INSTALL_RB3_FILE_TABS.OVERVIEW ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
                  onClick={() => {
                    setInstallRB3FileScreenState({ installRB3FileTab: INSTALL_RB3_FILE_TABS.OVERVIEW })
                  }}
                >
                  {t('overview')}
                </button>
                {selectedRB3File.description && selectedRB3File.description.length > 0 && (
                  <button
                    disabled={disableButtons}
                    className={clsx(installRB3FileTab === INSTALL_RB3_FILE_TABS.DESCRIPTION ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
                    onClick={() => {
                      setInstallRB3FileScreenState({ installRB3FileTab: INSTALL_RB3_FILE_TABS.DESCRIPTION })
                    }}
                  >
                    {t('description')}
                  </button>
                )}
                {selectedRB3File.dta.length > 1 && (
                  <button
                    disabled={disableButtons}
                    className={clsx('flex-row! items-center', selectedSongs.length === 0 && installRB3FileTab === INSTALL_RB3_FILE_TABS.SELECT_SONGS ? 'bg-red-500 text-black/90' : selectedSongs.length === 0 ? 'text-red-500 hover:text-red-400 active:text-red-300' : installRB3FileTab === INSTALL_RB3_FILE_TABS.SELECT_SONGS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
                    onClick={() => {
                      setInstallRB3FileScreenState({ installRB3FileTab: INSTALL_RB3_FILE_TABS.SELECT_SONGS })
                    }}
                  >
                    {t('selectSongs')}
                  </button>
                )}
              </div>
              <h1 className="text-4xl">{selectedRB3File.packageName}</h1>
              {selectedRB3File.packageCreatorName && (
                <div className="-mt-1 flex-row! items-center">
                  {selectedRB3File.packageCreatorThumbnail && <img src={selectedRB3File.packageCreatorThumbnail} className="mr-2 h-8 min-h-8 w-8 min-w-8" />}
                  <h2 className="font-pentatonic text-xl uppercase">{t('packageCreatorsText', { creators: selectedRB3File.packageCreatorName })}</h2>
                </div>
              )}
              <div className="mt-1 w-full flex-row! items-center">
                <p className="mr-1 w-fit rounded-sm bg-neutral-900 px-1 py-0.5 font-mono text-xs font-bold uppercase">{t(selectedRB3File.header.songsCount === 1 ? 'songsCount' : 'songsCountPlural', { count: selectedRB3File.header.songsCount })}</p>
                <p className="w-fit rounded-sm bg-neutral-900 px-1 py-0.5 font-mono text-xs font-bold uppercase">{t(`pkgCategory${PKG_CATEGORIES.indexOf(selectedRB3File.header.packageCategory)}`)}</p>
              </div>
              {installRB3FileTab === INSTALL_RB3_FILE_TABS.OVERVIEW && (
                <>
                  <h2 className="font-pentatonic mt-4 uppercase">{t('packageSize')}</h2>
                  <p className="mb-2">{getReadableBytesSize(selectedRB3File.fileSize)}</p>

                  <h2 className="font-pentatonic uppercase">{t('createIn')}</h2>
                  {creationDate && creationDateString && (
                    <p className="mb-2">
                      {creationDateString[0].toUpperCase()}
                      {creationDateString.slice(1)}
                      <br />
                      {creationDate.toLocaleTimeString()}
                    </p>
                  )}

                  <div className="mb-1 flex-row! items-center">
                    <h2 className="font-pentatonic mr-2 uppercase">{t('packageName')}</h2>
                    <h2 className={clsx('mr-auto text-xs font-semibold', packageNameError !== null && 'text-red-500/80')}>{`${packageName.length}/255`}</h2>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setInstallRB3FileScreenState({ packageName: selectedRB3File.packageName, packageNameError: null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <input
                    className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    value={packageName}
                    onChange={(ev) => {
                      const value = VALIDATORS.packageName.safeParse(ev.target.value)

                      if (!value.success) setInstallRB3FileScreenState({ packageName: ev.target.value, packageNameError: value.error.issues[0].message })
                      else setInstallRB3FileScreenState({ packageName: value.data, packageNameError: null })
                    }}
                    minLength={1}
                    maxLength={255}
                    disabled={disableButtons}
                  />
                  <AnimatedDiv condition={packageNameError !== null} {...animate({ height: true, scaleY: true, opacity: true })}>
                    <div className="h-2" />
                    {packageNameError !== null && <p className="origin-top text-xs text-red-500 italic">{t(`inputErrorPKGFolderName${underscoreToUppercaseLetter(packageNameError, true)}`)}</p>}
                  </AnimatedDiv>

                  <div className="mt-4 mb-1 flex-row! items-center">
                    <h2 className="font-pentatonic mr-2 uppercase">{t('packageFolderName')}</h2>
                    <h2 className={clsx('mr-auto text-xs font-semibold', packageFolderNameError !== null && 'text-red-500/80')}>{`${packageFolderName.length}/42`}</h2>
                    <button
                      className="mb-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={async () => {
                        setInstallRB3FileScreenState({ packageFolderName: selectedRB3File.defaultFolderName, packageFolderNameError: null })
                      }}
                    >
                      {t('revert')}
                    </button>
                  </div>
                  <p className="mb-2 text-sm text-neutral-500">{t('installRB3FilePackageFolderNameDesc')}</p>
                  <input
                    className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    value={packageFolderName}
                    onChange={(ev) => {
                      const value = VALIDATORS.packageFolderName.safeParse(ev.target.value)

                      if (!value.success) setInstallRB3FileScreenState({ packageFolderName: ev.target.value, packageFolderNameError: value.error.issues[0].message })
                      else setInstallRB3FileScreenState({ packageFolderName: value.data, packageFolderNameError: null })
                    }}
                    minLength={1}
                    maxLength={42}
                    disabled={disableButtons}
                  />
                  <AnimatedDiv condition={packageFolderNameError !== null} {...animate({ height: true, scaleY: true, opacity: true })}>
                    <div className="h-2" />
                    {packageFolderNameError !== null && <p className="origin-top text-xs text-red-500 italic">{t(`inputErrorPKGFolderName${underscoreToUppercaseLetter(packageFolderNameError, true)}`)}</p>}
                  </AnimatedDiv>
                </>
              )}
              {installRB3FileTab === INSTALL_RB3_FILE_TABS.DESCRIPTION && selectedRB3File.description && selectedRB3File.description.length > 0 && (
                <div className="mt-2">
                  <div className="markdown-body h-fill select-text">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, [rehypeSlug, { prefix: 'MD__' }]]}
                      components={{
                        a: ({ href, children }) => {
                          const isHeaderLink = href && href.startsWith('#') ? true : false
                          const outsideLinkProps = {
                            target: '_blank',
                            rel: 'noreferrer',
                          }
                          return (
                            <a href={href && isHeaderLink ? `#MD__${href.slice(1)}` : href} {...(!isHeaderLink ? outsideLinkProps : {})}>
                              {children}
                            </a>
                          )
                        },
                      }}
                    >
                      {(() => {
                        const array = Uint8Array.fromBase64(selectedRB3File.description)

                        return new TextDecoder().decode(array)
                      })()}
                    </Markdown>
                  </div>
                </div>
              )}
              {installRB3FileTab === INSTALL_RB3_FILE_TABS.SELECT_SONGS && selectedRB3File.dta.length > 1 && (
                <div className="mt-2">
                  <div className="mb-2 flex-row! items-center">
                    <button
                      className="mr-1 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={() => {
                        if (selectedRB3File) {
                          setInstallRB3FileScreenState({ selectedSongs: selectedRB3File.dta.map((song) => song.songname) })
                        }
                      }}
                    >
                      {t('selectAll')}
                    </button>
                    <button
                      className="mr-2 w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      disabled={disableButtons}
                      onClick={() => {
                        setInstallRB3FileScreenState({ selectedSongs: [] })
                      }}
                    >
                      {t('selectNone')}
                    </button>

                    <AnimatedDiv condition={selectedSongs.length === 0} {...animate({ opacity: true })}>
                      {selectedSongs.length === 0 && <p className="origin-top text-xs text-red-500 italic">{t('errorNoSongsSelectedToCreatePackageFrom')}</p>}
                    </AnimatedDiv>
                  </div>
                  {selectedRB3File.dta.map((song, songIndex) => {
                    const isSongSelected = selectedSongs.includes(song.songname)
                    return (
                      <div
                        key={`selectedSong${songIndex}`}
                        className={clsx('group mt-0 mb-0.5 flex-row! items-start rounded-xs border px-3 py-0.5 duration-100 first:mt-2 last:mb-0 hover:bg-neutral-300/10', isSongSelected ? 'border-cyan-300/10 bg-neutral-300/5' : 'border-transparent')}
                        onClick={() => {
                          if (isSongSelected) {
                            const songIndexOnArray = selectedSongs.findIndex((val) => val === song.songname)
                            if (songIndexOnArray === -1) return
                            else
                              return setInstallRB3FileScreenState((oldState) => {
                                const newSelectedSongs = [...oldState.selectedSongs]
                                newSelectedSongs.splice(songIndexOnArray, 1)

                                return {
                                  selectedSongs: newSelectedSongs,
                                }
                              })
                          }

                          return setInstallRB3FileScreenState((oldState) => {
                            const newSelectedSongs = [...oldState.selectedSongs]
                            newSelectedSongs.push(song.songname)

                            return {
                              selectedSongs: newSelectedSongs,
                            }
                          })
                        }}
                      >
                        <h2 className={clsx('font-pentatonic mr-2 max-w-[65%] text-xl', isSongSelected ? '' : 'text-neutral-800 group-hover:text-neutral-600')}>{song.name}</h2>
                        <p className={clsx('relative! top-1 text-sm font-semibold italic', isSongSelected ? '' : 'text-neutral-800 group-hover:text-neutral-600')}>{song.artist}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
