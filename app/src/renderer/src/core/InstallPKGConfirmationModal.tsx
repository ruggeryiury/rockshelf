import { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import clsx from 'clsx'
import { AnimatedSection, genAnim, getReadableBytesSize, TransComponent } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { imgIconRB3, imgIconRB3DX, wavesPattern } from '@renderer/assets/images'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/states/WindowState'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import type { GitHubCommitResponse } from '@renderer/app/types'
import { GitHubIcon, LoadingIcon } from '@renderer/assets/icons'

export function InstallPKGConfirmationModal() {
  const { t, i18n } = useTranslation()

  const [commitInfo, setCommitInfo] = useState<GitHubCommitResponse | null>(null)
  const [isLoadingCommitInfo, setIsLoadingCommitInfo] = useState<boolean>(true)
  const [commitInfoGetError, setCommitInfoGetError] = useState<boolean>(false)

  const disabledButtons = useWindowState((state) => state.disableButtons)
  const setWindowState = useWindowState((state) => state.setWindowState)
  const setRendererState = useRendererState((state) => state.setRendererState)

  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
  const setUserConfigState = useUserConfigState((state) => state.setUserConfigState)

  const condition = useRendererState((state) => state.InstallPKGConfirmationModal)

  useEffect(() => {
    const resetStatesAndFetchCommitData = async () => {
      if (condition && condition.pkgType === 'dx') {
        try {
          const { data } = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/${condition.dxHash}`, { responseType: 'json' })
          setCommitInfo(data)
          setIsLoadingCommitInfo(false)
          if (import.meta.env.DEV) console.log('Install Deluxe PKG Commit Data:', data)
        } catch (err) {
          if (err instanceof AxiosError) {
          }
        }
      } else {
        setCommitInfo(null)
        setIsLoadingCommitInfo(true)
        setCommitInfoGetError(false)
      }
    }

    resetStatesAndFetchCommitData()
  }, [condition])
  return (
    <AnimatedSection id="InstallPKGConfirmationModal" condition={Boolean(condition)} {...genAnim({ opacity: true })} className="absolute! z-10 h-full w-full backdrop-blur-xs">
      <div className={'absolute! inset-0 z-11 bg-black/95'} />
      <div className={`animate-move-pattern absolute! inset-0 z-12 h-full w-full bg-size-[12rem] bg-center bg-repeat opacity-3`} style={{ backgroundImage: `url('${wavesPattern}')` }} />
      <div className="absolute! inset-0 z-13 h-full w-full bg-transparent px-12 py-8">
        {condition !== false && (
          <>
            <h1 className="border-default-white/50 mb-2 w-full border-b pb-1 text-3xl">{condition.pkgType === 'tu5' ? t('installPKGFileTU5') : condition.pkgType === 'dx' ? t('installPKGFileDX') : t('installPKGFileSongPkg')}</h1>
            <div className="flex-row! items-start">
              <img src={condition.pkgType === 'dx' ? imgIconRB3DX : imgIconRB3} className={clsx('laptop:w-[256px] laptop:min-w-[256px] mr-4 mb-2 w-48 min-w-48 hover:animate-pulse')} alt={condition.pkgType === 'dx' ? t('rb3DXLogo') : t('rb3Logo')} title={condition.pkgType === 'dx' ? t('rb3DXLogo') : t('rb3Logo')} />
              <div className="w-fill">
                <p className="mb-4 text-base!">
                  <TransComponent i18nKey={condition.pkgType === 'dx' ? 'installPKGFileConfirmDX' : condition.pkgType === 'tu5' ? 'installPKGFileConfirmTU5' : ''} />
                </p>

                <h1>{t('pkgPath')}</h1>
                <p className="mb-2">{condition.pkgPath}</p>

                <h1>{t('pkgSize')}</h1>
                <p className="mb-2">{getReadableBytesSize(condition.pkgSize)}</p>

                {condition.pkgType === 'dx' && (
                  <>
                    <h1 className="mb-2">{t('deluxeCommitDetails')}</h1>
                    <div className="rounded-xs bg-neutral-800 p-2">
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
                          <div className="mb-4 flex-row! items-center">
                            <img src={commitInfo.author?.avatar_url} className="mr-2 w-6" />
                            <p>{commitInfo.commit.author.name}</p>
                          </div>
                          <button className="mr-2 w-fit flex-row! items-center rounded-xs bg-neutral-900 p-2 text-sm! duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" disabled={disabledButtons} onClick={async () => await window.api.utils.openExternalLink(commitInfo.html_url)}>
                            <GitHubIcon className="mr-2" />
                            <h1>{t('showCommitOnGitHub')}</h1>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}

                <div className="mt-4 flex-row! items-center">
                  <button className="mr-2 rounded-xs bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mr-0 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900" disabled={disabledButtons} onClick={async () => {}}>
                    {t('yes')}
                  </button>
                  <button
                    className="mr-2 rounded-xs bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mr-0 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    disabled={disabledButtons}
                    onClick={async () => {
                      setRendererState({ InstallPKGConfirmationModal: false })
                    }}
                  >
                    {t('no')}
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
