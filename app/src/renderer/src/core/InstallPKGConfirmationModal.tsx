import { useEffect, useState } from 'react'
import axios from 'axios'
import clsx from 'clsx'
import { AnimatedDiv, AnimatedSection, genAnim, getReadableBytesSize, TransComponent } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { imgIconRB, imgIconRB2, imgIconRB3, imgIconLRB, imgIconRB3DX, wavesPattern } from '@renderer/assets/images'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/states/WindowState'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import type { GitHubCommitCompare, GitHubCommitResponse } from '@renderer/app/types'
import { CheckedBoxIcon, GitHubIcon, LoadingIcon, MusicLibIcon, StarCircleIcon, UncheckedBoxIcon } from '@renderer/assets/icons'
import { SelectedPKGFileType } from 'rockshelf-core/lib'

export function InstallPKGConfirmationModal() {
  const { t, i18n } = useTranslation()

  const [commitInfo, setCommitInfo] = useState<GitHubCommitResponse | null>(null)
  const [aheadCommitInfo, setAheadCommitInfo] = useState<GitHubCommitCompare | null>(null)
  const [isLoadingCommitInfo, setIsLoadingCommitInfo] = useState<boolean>(true)
  const [packageFolderName, setPackageFolderName] = useState('')
  const [encryptPKGFiles, setEncryptPKGFiles] = useState(false)
  const [isInstallingPackage, setIsInstallingPackage] = useState(false)

  const getPkgTimeImage = (type: SelectedPKGFileType): string => {
    switch (type) {
      case 'dx':
        return imgIconRB3DX
      case 'rb1':
        return imgIconRB
      case 'rb2':
        return imgIconRB2
      case 'lrb':
        return imgIconLRB
      default:
        return imgIconRB3
    }
  }

  const disabledButtons = useWindowState((state) => state.disableButtons)
  const setWindowState = useWindowState((state) => state.setWindowState)
  const setRendererState = useRendererState((state) => state.setRendererState)
  const rb3Stats = useWindowState((state) => state.rb3Stats)

  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
  const setUserConfigState = useUserConfigState((state) => state.setUserConfigState)

  const condition = useWindowState((state) => state.selectedPKGFile)

  useEffect(
    function DisplayPKGFileStatTableOnConsole() {
      if (condition && import.meta.env.DEV) console.table([{ 'PKG Path': condition.stat.pkgFilePath, Name: condition.pkgName, 'Is official?': condition.isPackageOfficial, 'Console ID': condition.stat.header.contentID, 'SHA256 Hash': condition.stat.entries.sha256 }])
    },
    [condition]
  )

  useEffect(
    function CheckCommitsAhead() {
      const start = async () => {
        if (condition && commitInfo && !aheadCommitInfo) {
          try {
            const { data } = await axios.get<GitHubCommitCompare>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/compare/develop...${condition.dxHash}`, { responseType: 'json', timeout: 6000 })

            setAheadCommitInfo(data)
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
        if (condition && condition.pkgType === 'dx') {
          try {
            const { data } = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/${condition.dxHash}`, { responseType: 'json', timeout: 6000 })
            setCommitInfo(data)
            setIsLoadingCommitInfo(false)
            if (import.meta.env.DEV) console.log('struct GitHubCommitResponse ["app\\src\\renderer\\src\\app\\types.ts"]:', data)
          } catch (err) {
            setIsLoadingCommitInfo(false)
          }
        } else if (condition && condition.pkgType === 'songPackage' && condition.songPackage) {
          setPackageFolderName(condition.songPackage.folderName)
          if (rb3Stats && !rb3Stats.hasDeluxe) setEncryptPKGFiles(true)
        } else {
          setCommitInfo(null)
          setAheadCommitInfo(null)
          setIsLoadingCommitInfo(true)
          setPackageFolderName('')
          setEncryptPKGFiles(false)
          setIsInstallingPackage(false)
        }
      }

      start()
    },
    [condition]
  )
  return (
    <AnimatedSection id="InstallPKGConfirmationModal" condition={Boolean(condition)} {...genAnim({ opacity: true })} className="absolute! z-10 h-full w-full overflow-x-hidden backdrop-blur-xs">
      <div className={'absolute! inset-0 z-11 bg-black/95'} />
      <div className={`animate-move-pattern absolute! inset-0 z-12 h-full w-full bg-size-[12rem] bg-center bg-repeat opacity-3`} style={{ backgroundImage: `url('${wavesPattern}')` }} />

      <div className="absolute! inset-0 z-13 h-full max-h-full w-full overflow-y-auto bg-transparent px-12 py-8">
        {condition !== false && (
          <>
            <h1 className="border-default-white/50 mb-2 w-full border-b pb-1 text-3xl">{condition.pkgType !== 'songPackage' ? t(`installPKGFile${condition.pkgType.toUpperCase()}`) : t('installPKGFileSongPackage')}</h1>
            <div className="flex-row! items-start">
              <img src={getPkgTimeImage(condition.pkgType)} className={clsx('laptop:w-[256px] laptop:min-w-[256px] mr-4 mb-2 w-48 min-w-48 animate-pulse')} />
              <div className="w-fill">
                <p className="mb-4 text-base!">
                  <TransComponent i18nKey={condition.pkgType === 'dx' || condition.pkgType === 'tu5' ? `installPKGFileConfirm${condition.pkgType.toUpperCase()}` : 'installPKGFileConfirmSongPackage'} />
                </p>

                <h1>{t('pkgPath')}</h1>
                <p className="mb-2 font-mono">{condition.pkgPath}</p>

                <h1>{t('pkgSize')}</h1>
                <p className="mb-2">{getReadableBytesSize(condition.pkgSize)}</p>

                <h1>{t('pkgInstalationPath')}</h1>
                <p className="mb-2 font-mono break-all">{`${devhdd0Path}\\game\\${condition.stat.header.cidTitle1}${condition.pkgType === 'dx' || condition.pkgType === 'tu5' ? '' : condition.pkgType !== 'songPackage' && condition.songPackage ? `${packageFolderName.length > 0 ? '' : '\\'}${condition.songPackage.folderName}` : `\\${packageFolderName}`}`}</p>

                {condition.pkgType === 'dx' && (
                  <>
                    <h1 className="mb-2">{t('deluxeCommitDetails')}</h1>
                    <div className="rounded-xs bg-neutral-900 p-2">
                      {isLoadingCommitInfo && (
                        <div className="flex-row! items-center">
                          <LoadingIcon className="mr-2 animate-spin" />
                          <h1 className="text-neutral-400">{t('loadingCommitDetails')}</h1>
                        </div>
                      )}
                      {!isLoadingCommitInfo && commitInfo !== null && (
                        <>
                          <div className="flex-row! items-center">
                            <h2 className="mr-auto">
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
                          <p className="mb-2 text-neutral-400 italic">{commitInfo.commit.message}</p>
                          <h1 className="text-xs!">{t('commitBy')}</h1>
                          <div className="mb-2 flex-row! items-center">
                            <img src={commitInfo.author?.avatar_url} className="mr-2 w-6" />
                            <p>{commitInfo.commit.author.name}</p>
                          </div>

                          <AnimatedDiv condition={Boolean(aheadCommitInfo)} {...genAnim({ opacity: true, height: true, scaleY: true })}>
                            {aheadCommitInfo?.status === 'identical' && <p className="text-green-500 italic">{t('updatedRB3DXInfo')}</p>}
                            {aheadCommitInfo?.status === 'behind' && <p className="text-yellow-500 italic">{t(aheadCommitInfo.behind_by === 1 ? 'notUpdatedRB3DXInfo' : 'notUpdatedRB3DXInfoPlural', { behindBy: aheadCommitInfo.behind_by })}</p>}
                            <div className="h-4 w-full" />
                          </AnimatedDiv>

                          <button className="mr-2 w-fit flex-row! items-center rounded-xs border border-white/25 bg-neutral-900 p-2 text-sm! duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" disabled={disabledButtons} onClick={async () => await window.api.utils.openExternalLink(commitInfo.html_url)}>
                            <GitHubIcon className="mr-2" />
                            <h1>{t('showCommitOnGitHub')}</h1>
                          </button>
                        </>
                      )}
                      {!isLoadingCommitInfo && !commitInfo && (
                        <>
                          <p className="mb-2 text-neutral-400 italic">{t('errorNoInternetCommitDetails')}</p>
                          <button
                            className="mr-2 w-fit rounded-xs border-2 border-white/25 bg-neutral-800 px-1 py-0.5 text-sm! duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                            disabled={disabledButtons}
                            onClick={async () => {
                              setIsLoadingCommitInfo(true)
                              try {
                                const { data } = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/${condition.dxHash}`, { responseType: 'json', timeout: 6000 })
                                setCommitInfo(data)
                                setIsLoadingCommitInfo(false)
                                if (import.meta.env.DEV) console.log('struct GitHubCommitResponse ["app\\src\\renderer\\src\\app\\types.ts"]:', data)
                              } catch (err) {
                                setIsLoadingCommitInfo(false)
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

                {condition.pkgType !== 'dx' && condition.pkgType !== 'tu5' && condition.songPackage && (
                  <>
                    <h1 className="mb-2">{t('packageDetails')}</h1>
                    <div className="mb-4 flex-row! items-center rounded-xs bg-neutral-900 p-2">
                      <MusicLibIcon className="mr-2" />
                      <h2 className="font-urbanist mr-8 uppercase">
                        {(condition.songPackage.dta.songs.length + condition.songPackage.dta.updates.length).toString()} {condition.songPackage.dta.songs.length === 1 ? t('song') : t('songPlural')}
                      </h2>
                      <StarCircleIcon className="mr-2" />
                      <h2 className="font-urbanist uppercase">
                        {((condition.songPackage.dta.songs.length + condition.songPackage.dta.updates.length) * 5).toString()} {condition.songPackage.dta.songs.length === 1 ? t('star') : t('starPlural')}
                      </h2>
                    </div>
                  </>
                )}

                {condition.pkgType === 'songPackage' && condition.songPackage && (
                  <>
                    <div className="mb-2 h-0.5 w-full rounded-xs bg-white/25" />
                    <h1 className="mb-2">{t('installationOptions')}</h1>
                    <h2>{t('packageFolderName')}</h2>
                    <p className="mb-4 text-neutral-600 italic">{t('packageFolderNameDesc')}</p>
                    <input value={packageFolderName} onChange={(ev) => setPackageFolderName(ev.target.value)} className="w-fill mb-4 rounded-xs border border-neutral-800 bg-neutral-950 px-2 py-1 hover:border-neutral-700 hover:bg-neutral-900 focus:border-neutral-400 active:border-neutral-400" />
                    <div className="flex-row! items-center">
                      <button className="mr-2 border border-transparent hover:border-neutral-500" onClick={() => setEncryptPKGFiles((prev) => !prev)}>
                        {encryptPKGFiles ? <CheckedBoxIcon /> : <UncheckedBoxIcon />}
                      </button>
                      <h2>{t('encryptPKGFiles')}</h2>
                    </div>
                    <p className="mb-4 text-neutral-600 italic">{t('encryptPKGFilesDesc')}</p>
                    <AnimatedDiv condition={rb3Stats && !rb3Stats.hasDeluxe && !encryptPKGFiles} {...genAnim({ opacity: true, scaleY: true, height: true })} className="origin-top">
                      <p className="mb-4 text-yellow-600 italic">{t('encryptionUnckeckedBadChoiceText')}</p>
                    </AnimatedDiv>
                  </>
                )}

                <div className="mt-4 flex-row! items-center">
                  <button
                    className="mr-2 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mr-0 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    disabled={disabledButtons}
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      setIsInstallingPackage(true)

                      setTimeout(() => {
                        setIsInstallingPackage(false)
                        setWindowState({ disableButtons: false })
                      }, 3000)
                    }}
                  >
                    {t('install')}
                  </button>
                  <button
                    className="mr-2 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mr-0 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    disabled={disabledButtons}
                    onClick={async () => {
                      setWindowState({ selectedPKGFile: false })
                    }}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AnimatedSection>
  )
}
