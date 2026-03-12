import { GitHubCommitCompare, GitHubCommitResponse } from '@renderer/app/types'
import { CheckedBoxIcon, GitHubIcon, LoadingIcon, MusicLibIcon, StarCircleIcon, UncheckedBoxIcon } from '@renderer/assets/icons'
import { wavesPattern } from '@renderer/assets/images'
import { animate, AnimatedDiv, AnimatedSection, getReadableBytesSize, TransComponent } from '@renderer/lib.exports'
import { useInstallPKGFileScreenState } from '@renderer/stores/InstallPKGFileScreen.store'
import { useUserConfigState } from '@renderer/stores/UserConfig.store'
import { useWindowState } from '@renderer/stores/Window.store'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { useCachedDataState } from '@renderer/stores/CacheData.store'

export function InstallPKGFileScreen() {
  const { t, i18n } = useTranslation()

  const disableButtons = useWindowState((x) => x.disableButtons)
  const devhdd0Path = useUserConfigState((x) => x.devhdd0Path)
  const packageFolderName = useInstallPKGFileScreenState((x) => x.packageFolderName)
  const commitInfo = useInstallPKGFileScreenState((x) => x.commitInfo)
  const isLoadingCommitInfo = useInstallPKGFileScreenState((x) => x.isLoadingCommitInfo)
  const aheadCommitInfo = useInstallPKGFileScreenState((x) => x.aheadCommitInfo)
  const encryptPKGFiles = useInstallPKGFileScreenState((x) => x.encryptPKGFiles)
  const rb3Stats = useCachedDataState((x) => x.rb3Stats)
  const setInstallPKGFileScreen = useInstallPKGFileScreenState((x) => x.setInstallPKGFileScreen)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const resetInstallPKGFileScreen = useInstallPKGFileScreenState((x) => x.resetInstallPKGFileScreen)
  const setCachedData = useCachedDataState((x) => x.setCachedData)

  const selectedPKG = useInstallPKGFileScreenState((x) => x.InstallPKGFileScreen)
  const isActivated = useMemo(() => selectedPKG !== false, [selectedPKG])

  useEffect(
    function CheckCommitsAhead() {
      const start = async () => {
        if (selectedPKG && commitInfo && !aheadCommitInfo) {
          try {
            const { data } = await axios.get<GitHubCommitCompare>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/compare/develop...${selectedPKG.dxHash}`, { responseType: 'json', timeout: 6000 })

            setInstallPKGFileScreen({ aheadCommitInfo: data })
          } catch (err) {
            // Do nothing
          }
        }
      }
      start()
    },
    [commitInfo]
  )

  useEffect(
    function ResetStatesAndFetchCommitData() {
      const start = async () => {
        if (selectedPKG) {
          if (selectedPKG.pkgType === 'dx') {
            try {
              const { data } = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/${selectedPKG.dxHash}`, { responseType: 'json', timeout: 6000 })
              setInstallPKGFileScreen({ commitInfo: data, isLoadingCommitInfo: false })
              if (import.meta.env.DEV) console.log('struct GitHubCommitResponse ["app\\src\\renderer\\src\\app\\types.ts"]:', data)
            } catch (err) {
              setInstallPKGFileScreen({ isLoadingCommitInfo: false })
            }
          } else if (selectedPKG.pkgType === 'songPackage') {
            setInstallPKGFileScreen({ packageFolderName: selectedPKG.stat.folderName })
            if (rb3Stats && typeof rb3Stats !== 'string' && !rb3Stats.hasDeluxe) setInstallPKGFileScreen({ encryptPKGFiles: true })
          }
        } else {
          resetInstallPKGFileScreen()
        }
      }

      start()
    },
    [isActivated]
  )
  return (
    <AnimatedSection id="InstallPKGFileScreen" condition={isActivated} {...animate({ opacity: true })} className="absolute! z-15 h-full w-full overflow-x-hidden backdrop-blur-xs">
      {selectedPKG !== false && (
        <>
          <div className={'absolute! inset-0 z-11 bg-black/95'} />
          <div className={`animate-move-pattern absolute! inset-0 z-12 h-full w-full bg-size-[12rem] bg-center bg-repeat opacity-3`} style={{ backgroundImage: `url('${wavesPattern}')` }} />
          <div id="InstallPKGFileScreenFrame" className="absolute! inset-0 z-13 h-full max-h-full w-full overflow-y-auto bg-transparent px-12 py-8">
            <h1 className="border-default-white/50 mb-2 w-full border-b pb-1 text-3xl uppercase">{selectedPKG.pkgType !== 'songPackage' ? t(`installPKGFile${selectedPKG.pkgType.toUpperCase()}`) : t('installPKGFileSongPackage')}</h1>
            <div className="flex-row! items-start">
              <img src={`rbicons://${selectedPKG.pkgType}`} className="laptop:w-[256px] laptop:min-w-[256px] mr-4 mb-2 w-48 min-w-48 animate-pulse border-2 border-neutral-500" />
              <div className="w-fill">
                <p className="mb-4 text-base!">
                  <TransComponent i18nKey={selectedPKG.pkgType === 'dx' || selectedPKG.pkgType === 'tu5' ? `installPKGFileConfirm${selectedPKG.pkgType.toUpperCase()}` : 'installPKGFileConfirmSongPackage'} />
                </p>

                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('pkgPath')}</h1>
                <p className="mb-2 font-mono">{selectedPKG.pkgPath}</p>

                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('pkgSize')}</h1>
                <p className="mb-2">{getReadableBytesSize(selectedPKG.pkgSize)}</p>

                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('pkgInstalationPath')}</h1>
                <p className="mb-2 font-mono break-all">{`${devhdd0Path}\\game\\${selectedPKG.stat.titleID}${selectedPKG.pkgType === 'dx' || selectedPKG.pkgType === 'tu5' ? '' : selectedPKG.pkgType !== 'songPackage' ? `${packageFolderName.length > 0 ? '' : '\\'}${selectedPKG.stat.folderName}` : `\\${packageFolderName}`}`}</p>

                {selectedPKG.pkgType === 'dx' && (
                  <>
                    <h1 className="mb-2 uppercase">{t('deluxeCommitDetails')}</h1>
                    <div className="rounded-xs bg-neutral-900 p-2">
                      {isLoadingCommitInfo && (
                        <div className="flex-row! items-center">
                          <LoadingIcon className="mr-2 animate-spin" />
                          <h1 className="text-neutral-400">{t('loadingCommitDetails')}</h1>
                        </div>
                      )}
                      {!isLoadingCommitInfo && commitInfo !== null && (
                        <>
                          <div className="mb-2 flex-row! items-center">
                            <h2 className="mr-auto font-semibold">
                              <TransComponent i18nKey="commitHashTitle" values={{ commitHash: commitInfo.sha.slice(0, 7) }} />
                            </h2>
                            <p>
                              {(() => {
                                const date = new Date(commitInfo.commit.author.date)
                                return new Intl.DateTimeFormat(i18n.language, {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                }).format(date)
                              })()}
                            </p>
                          </div>
                          <p className="mb-2 text-xs text-neutral-600 italic">{commitInfo.commit.message}</p>
                          <h1 className="mb-0.5 text-xs! uppercase">{t('commitBy')}</h1>
                          <div className="mb-2 flex-row! items-center">
                            <img src={commitInfo.author?.avatar_url} className="mr-2 w-6" />
                            <p>{commitInfo.commit.author.name}</p>
                          </div>

                          <AnimatedDiv condition={Boolean(aheadCommitInfo)} {...animate({ opacity: true, height: true, scaleY: true })}>
                            {aheadCommitInfo?.status === 'identical' && <p className="text-green-500 italic">{t('updatedRB3DXInfo')}</p>}
                            {aheadCommitInfo?.status === 'behind' && <p className="text-yellow-500 italic">{t(aheadCommitInfo.behind_by === 1 ? 'notUpdatedRB3DXInfo' : 'notUpdatedRB3DXInfoPlural', { behindBy: aheadCommitInfo.behind_by })}</p>}
                            <div className="h-4 w-full" />
                          </AnimatedDiv>

                          <button className="mr-2 w-fit flex-row! items-center rounded-xs border border-white/25 bg-neutral-900 p-2 text-sm! duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" disabled={disableButtons} onClick={async () => await window.api.openExternalLink(commitInfo.html_url)}>
                            <GitHubIcon className="mr-2" />
                            <h1 className="uppercase">{t('showCommitOnGitHub')}</h1>
                          </button>
                        </>
                      )}
                      {!isLoadingCommitInfo && !commitInfo && (
                        <>
                          <p className="mb-2 text-neutral-400 italic">{t('errorNoInternetCommitDetails')}</p>
                          <button
                            className="mr-2 w-fit rounded-xs border-2 border-white/25 bg-neutral-800 px-1 py-0.5 text-sm! duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                            disabled={disableButtons}
                            onClick={async () => {
                              setInstallPKGFileScreen({ isLoadingCommitInfo: true })
                              try {
                                const { data } = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/${selectedPKG.dxHash}`, { responseType: 'json', timeout: 6000 })
                                setInstallPKGFileScreen({ commitInfo: data, isLoadingCommitInfo: false })
                                if (import.meta.env.DEV) console.log('struct GitHubCommitResponse ["app\\src\\renderer\\src\\app\\types.ts"]:', data)
                              } catch (err) {
                                setInstallPKGFileScreen({ isLoadingCommitInfo: false })
                              }
                            }}
                          >
                            {t('tryAgain')}
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {selectedPKG.pkgType !== 'dx' && selectedPKG.pkgType !== 'tu5' && (
                  <>
                    <h1 className="mb-2 text-xs text-gray-400 uppercase">{t('packageDetails')}</h1>
                    <div className="flex-row! items-center rounded-xs bg-neutral-900 p-2">
                      <MusicLibIcon className="mr-2" />
                      <h2 className="mr-8 uppercase">
                        {(selectedPKG.stat.dta.length + (selectedPKG.stat.upgrades ? selectedPKG.stat.upgrades.length : 0)).toString()} {selectedPKG.stat.dta.length === 1 ? t('song') : t('songPlural')}
                      </h2>
                      <StarCircleIcon className="mr-2" />
                      <h2 className="uppercase">
                        {((selectedPKG.stat.dta.length + (selectedPKG.stat.upgrades ? selectedPKG.stat.upgrades.length : 0)) * 5).toString()} {selectedPKG.stat.dta.length === 1 ? t('star') : t('starPlural')}
                      </h2>
                    </div>
                  </>
                )}

                {selectedPKG.pkgType === 'songPackage' && (
                  <>
                    <div className="mb-2 h-0.5 w-full rounded-xs bg-white/25" />
                    <h1 className="mb-2">{t('installationOptions')}</h1>
                    <h2>{t('packageFolderName')}</h2>
                    <p className="mb-4 text-neutral-600 italic">{t('packageFolderNameDesc')}</p>
                    <input value={packageFolderName} onChange={(ev) => setInstallPKGFileScreen({ packageFolderName: ev.target.value })} className="w-fill mb-4 rounded-xs border border-neutral-800 bg-neutral-950 px-2 py-1 hover:border-neutral-700 hover:bg-neutral-900 focus:border-neutral-400 active:border-neutral-400" />
                    <div className="flex-row! items-center mb-0.5">
                      <button className="mr-2 border border-transparent hover:border-neutral-500" onClick={() => setInstallPKGFileScreen({ encryptPKGFiles: !encryptPKGFiles })}>
                        {encryptPKGFiles ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h2>{t('encryptPKGFiles')}</h2>
                    </div>
                    <p className="mb-4 text-neutral-600 italic">
                      <TransComponent i18nKey='encryptPKGFilesDesc' />
                    </p>
                    <AnimatedDiv condition={rb3Stats && typeof rb3Stats !== 'string' && !rb3Stats.hasDeluxe && !encryptPKGFiles} {...animate({ opacity: true, scaleY: true, height: true })} className="origin-top">
                      <p className="mb-4 text-yellow-600 italic">{t('encryptionUnckeckedBadChoiceText')}</p>
                    </AnimatedDiv>
                  </>
                )}

                <div className="mt-2 flex-row! items-center">
                  <button
                    className="mr-2 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 last:mr-0 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    disabled={disableButtons}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      try {
                        await window.api.installPKGFile(selectedPKG)
                        const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                        setCachedData({ rb3Stats: newRB3Stats })
                        setWindowState({ disableButtons: false })
                        setInstallPKGFileScreen({ InstallPKGFileScreen: false })
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ unhandledException: err })
                      }
                    }}
                  >
                    {t('install')}
                  </button>
                  <button
                    className="mr-2 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 last:mr-0 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    disabled={disableButtons}
                    onClick={async () => {
                      resetInstallPKGFileScreen()
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
