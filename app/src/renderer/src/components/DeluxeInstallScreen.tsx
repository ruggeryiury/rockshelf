import axios, { AxiosError } from 'axios'
import { AnimatedDiv, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useDeluxeInstallScreenState } from './DeluxeInstallScreen.state'
import { animate } from '@renderer/lib.exports'
import { useTranslation } from 'react-i18next'
import { DXNIGHTLYLINK } from '@renderer/app/rockshelf'
import { useWindowState } from '@renderer/stores/Window.state'
import { useMessageBoxState } from './MessageBox.state'
import { LoadingIcon } from '@renderer/assets/icons'
import { useEffect, useMemo } from 'react'
import { GitHubCommitCompare, GitHubCommitResponse } from '@renderer/app/types'

export function DeluxeInstallScreen() {
  const { t } = useTranslation()
  const active = useDeluxeInstallScreenState((x) => x.active)
  const setDeluxeInstallScreenState = useDeluxeInstallScreenState((x) => x.setDeluxeInstallScreenState)
  const selectedPKG = useDeluxeInstallScreenState((x) => x.selectedPKG)
  const resetDeluxeInstallScreenState = useDeluxeInstallScreenState((x) => x.resetDeluxeInstallScreenState)
  const commitData = useDeluxeInstallScreenState((x) => x.commitData)
  const aheadCommitData = useDeluxeInstallScreenState((x) => x.aheadCommitData)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setMessageBoxState = useMessageBoxState((x) => x.setMessageBoxState)
  const disableButtons = useWindowState((x) => x.disableButtons)

  const mustFetchCommitData = useMemo(() => selectedPKG !== null && selectedPKG !== 'loading', [selectedPKG])

  useEffect(() => {
    const start = async () => {
      if (mustFetchCommitData && selectedPKG !== null && selectedPKG !== 'loading') {
        setDeluxeInstallScreenState({ commitData: 'loading' })
        try {
          const { data } = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/${selectedPKG.dxHash}`, { responseType: 'json', timeout: 6000 })
          if (import.meta.env.DEV) console.log('struct GitHubCommitResponse ["app\\src\\renderer\\src\\app\\types.ts"]:', commitData)
          setDeluxeInstallScreenState({ commitData: data })
        } catch (err) {
          if (err instanceof AxiosError || err instanceof Error) setWindowState({ err })
          setDeluxeInstallScreenState({ commitData: null })
        }
      }
    }

    start()
  }, [mustFetchCommitData])

  useEffect(
    function CheckCommitsAhead() {
      const start = async () => {
        if (selectedPKG !== null && selectedPKG !== 'loading' && commitData && !aheadCommitData) {
          setDeluxeInstallScreenState({ aheadCommitData: 'loading' })
          try {
            const { data } = await axios.get<GitHubCommitCompare>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/compare/develop...${selectedPKG.dxHash}`, { responseType: 'json', timeout: 6000 })
            if (import.meta.env.DEV) console.log('struct GitHubCommitCompare ["app\\src\\renderer\\src\\app\\types.ts"]:', data)

            setDeluxeInstallScreenState({ aheadCommitData: data })
          } catch (err) {
            // Do nothing
          }
        }
      }
      start()
    },
    [commitData]
  )

  useEffect(() => {
    const start = async () => {
      window.electron.ipcRenderer.on('DeluxeInstallScreen::onMessage', (event) => {})
    }
  })
  return (
    <AnimatedSection condition={active} {...animate({ opacity: true })} id="DeluxeInstallScreen" className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('installDeluxe')}</h1>
        <button
          disabled={disableButtons}
          className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            resetDeluxeInstallScreenState()
          }}
        >
          {t('goBack')}
        </button>
      </div>
      <p className="mb-4 text-xs">
        <TransComponent i18nKey="selectInstallRB3DXHeading" />
      </p>

      <h2 className="font-pentatonic mb-2 border-b border-white/25 pb-2 uppercase">{t('downloadRB3DX')}</h2>
      <p className="mb-8 text-xs">
        <TransComponent i18nKey="downloadRB3DXText" components={{ spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={DXNIGHTLYLINK} target="_blank" rel="noreferrer" /> }} />
      </p>

      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-2">
        <h2 className="font-pentatonic mr-auto uppercase">{t('selectInstallRB3DX')}</h2>
        <button
          disabled={disableButtons}
          className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! whitespace-nowrap uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            setWindowState({ disableButtons: true })
            setDeluxeInstallScreenState({ selectedPKG: 'loading' })
            try {
              const newSelectedPKG = await window.api.selectPKGFileToInstall()
              if (import.meta.env.DEV) console.log('struct SelectPKGFileReturnObject [core/src/controllers/selectPKGFileToInstall.ts]', newSelectedPKG)

              if (!newSelectedPKG) {
                setWindowState({ disableButtons: false })
                setDeluxeInstallScreenState({ selectedPKG: null })
                return
              }
              if (newSelectedPKG.pkgType !== 'dx') {
                setMessageBoxState({ message: { code: 'notDXPKG', type: 'error', method: 'selectDXPKGFileToInstall', messageValues: { path: newSelectedPKG.pkgPath } } })
                setDeluxeInstallScreenState({ selectedPKG: null })
                setWindowState({ disableButtons: false })
                return
              }

              setDeluxeInstallScreenState({ selectedPKG: newSelectedPKG })
              setWindowState({ disableButtons: false })
            } catch (err) {
              if (err instanceof Error) setWindowState({ err })
            }
          }}
        >
          {t('selectPKGFile')}
        </button>
      </div>
      <AnimatedDiv className="w-full" condition={selectedPKG !== null && selectedPKG !== 'loading'} {...animate({ opacity: true })}>
        {selectedPKG && selectedPKG !== 'loading' && (
          <div className="w-full flex-row!">
            <div className="mr-4 h-48 max-h-48 w-48 max-w-48">
              <img src="rbicons://dx" className="mb-2" />
              <button
                className="w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                onClick={async () => {
                  setWindowState({ disableButtons: true })
                  await window.api.installPKGFile(selectedPKG)
                  setWindowState({ disableButtons: false })
                }}
              >
                {t('installDeluxe')}
              </button>
            </div>
            <div className="w-full">
              <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('pkgPath')}</h1>
              <p className="mb-4 font-mono text-xs">{selectedPKG.pkgPath}</p>
              <h1 className="mb-2 border-b border-white/25 pb-1 text-xs text-gray-400 uppercase">{t('commitInfo')}</h1>
              <div className="overflow-y-auto rounded-sm bg-neutral-900 p-2 break-all">
                {commitData === 'loading' && (
                  <>
                    <div className="flex-row! items-center">
                      <LoadingIcon className="mr-2 animate-spin" />
                      <p>{t('loadingCommitInfo')}</p>
                    </div>
                  </>
                )}
                {commitData !== null && commitData !== 'loading' && (
                  <>
                    <div className="flex-row!">
                      <h1 className="mr-auto mb-2 uppercase">
                        <TransComponent i18nKey="commitTitle" values={{ hash: commitData.sha.slice(0, 7) }} />
                      </h1>
                      <p className="text-xs">{new Date(commitData.commit.author!.date).toLocaleString()}</p>
                    </div>
                    <h2 className="mb-2 rounded-sm bg-neutral-950 p-3 text-xs wrap-break-word whitespace-break-spaces italic">{commitData.commit.message}</h2>
                    {aheadCommitData === 'loading' && <LoadingIcon className="animate-spin" />}
                    {aheadCommitData !== null && aheadCommitData !== 'loading' && (
                      <>
                        {aheadCommitData.status === 'identical' && <p className="text-green-500 italic">{t('updatedRB3DXInfo')}</p>}
                        {aheadCommitData.status === 'behind' && <p className="text-yellow-500 italic">{t(aheadCommitData.behind_by === 1 ? 'notUpdatedRB3DXInfo' : 'notUpdatedRB3DXInfoPlural', { behindBy: aheadCommitData.behind_by })}</p>}
                        <div className="h-4 w-full" />
                      </>
                    )}
                    <div className="mt-2 flex-row!">
                      <img src={commitData.author?.avatar_url} className="mr-2 w-14" />
                      <div>
                        <h2 className="text-xs font-bold uppercase">{t('commitBy')}</h2>
                        <h3 className="text-base">{commitData.author!.login}</h3>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatedDiv>
    </AnimatedSection>
  )
}
