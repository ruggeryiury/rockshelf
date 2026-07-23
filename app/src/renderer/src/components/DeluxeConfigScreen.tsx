import { AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useDeluxeConfigScreenState } from './DeluxeConfigScreen.state'
import { animate } from '@renderer/lib.exports'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/stores/Window.state'
import { useShallow } from 'zustand/shallow'
import clsx from 'clsx'
import { DELUXE_CONFIG_SCREEN_TABS, STRUCT_LOG } from '@renderer/app/rockshelf.globals'
import { GitHubIcon, HighRankIcon, LoadingIcon, LowerRankIcon, MiddleRankIcon } from '@renderer/assets/icons'
import { useUserConfigState } from '@renderer/stores/UserConfig.state'
import { useMemo } from 'react'

export function DeluxeConfigScreen() {
  const { i18n, t } = useTranslation()
  const { disableButtons, setWindowState, installedDeluxeData } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState, installedDeluxeData: x.installedDeluxeData })))
  const { active, setDeluxeConfigScreenState, selectedTab } = useDeluxeConfigScreenState(useShallow((x) => ({ active: x.active, setDeluxeConfigScreenState: x.setDeluxeConfigScreenState, selectedTab: x.selectedTab })))
  const { rpcs3ExePath } = useUserConfigState(useShallow((x) => ({ rpcs3ExePath: x.rpcs3ExePath })))

  const installedDate = useMemo(() => typeof installedDeluxeData === 'object' && installedDeluxeData.installed !== false && new Date(installedDeluxeData.installed.commitDate), [installedDeluxeData])
  const installedDateString = useMemo(() => typeof installedDeluxeData === 'object' && installedDeluxeData.installed !== false && installedDate && installedDate.toLocaleString(i18n.language, { dateStyle: 'full' }), [installedDeluxeData, installedDate, i18n.language])
  const latestDate = useMemo(() => typeof installedDeluxeData === 'object' && installedDeluxeData.latest && new Date(installedDeluxeData.latest.commitDate), [installedDeluxeData])
  const latestDateString = useMemo(() => typeof installedDeluxeData === 'object' && installedDeluxeData.latest && latestDate && latestDate.toLocaleString(i18n.language, { dateStyle: 'full' }), [installedDeluxeData, latestDate, i18n.language])

  return (
    <AnimatedSection id="DeluxeConfigScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black p-8">
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('deluxeSettings')}</h1>
        <button
          disabled={disableButtons}
          className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            setWindowState({ disableButtons: true, installedDeluxeData: 'loading' })
            try {
              const newRB3Stats = await window.api.rpcs3GetRB3Stats()
              if (STRUCT_LOG) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', newRB3Stats)
              const newData = await window.api.getInstalledDeluxeData()
              if (STRUCT_LOG) console.log('struct DeluxeInstalledData ["rbtools/src/lib/github/api.ts"]:', newData)
              setWindowState({ installedDeluxeData: newData, rb3Stats: newRB3Stats })
            } catch (err) {
              if (err instanceof Error) setWindowState({ err })
            }
            setWindowState({ disableButtons: false })
          }}
        >
          {t('refresh')}
        </button>
        <button
          disabled={disableButtons}
          className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            setDeluxeConfigScreenState({ active: false })
          }}
        >
          {t('goBack')}
        </button>
      </div>
      <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
        <button
          disabled={disableButtons}
          className={clsx(selectedTab === DELUXE_CONFIG_SCREEN_TABS.INSTALL_DELUXE ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setDeluxeConfigScreenState({ selectedTab: DELUXE_CONFIG_SCREEN_TABS.INSTALL_DELUXE })
          }}
        >
          {t('installation')}
        </button>
        <button
          disabled={disableButtons}
          className={clsx(selectedTab === DELUXE_CONFIG_SCREEN_TABS.QUICK_CONFIG ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setDeluxeConfigScreenState({ selectedTab: DELUXE_CONFIG_SCREEN_TABS.QUICK_CONFIG })
          }}
        >
          {t('quickConfig')}
        </button>
      </div>
      {selectedTab === DELUXE_CONFIG_SCREEN_TABS.INSTALL_DELUXE && (
        <div className="h-full w-full overflow-y-auto">
          {installedDeluxeData === false && (
            <div className="mt-2 flex-row! items-center">
              <p>{t('deluxeDataOfflineConnectionError')}</p>
            </div>
          )}
          {installedDeluxeData === 'loading' && (
            <div className="mt-2 flex-row! items-center">
              <LoadingIcon className="mr-2 animate-spin" />
              <p>{t('loadingInstalledDeluxeData')}</p>
            </div>
          )}
          {typeof installedDeluxeData === 'object' && installedDeluxeData.status === 'installed' && installedDeluxeData.installed && (
            <>
              <div className="mb-2 rounded-sm p-3">
                <div className="mb-2 flex-row! items-end border-b border-neutral-600 pb-1">
                  <h1 className="mr-auto text-xl uppercase">{t('currentInstalledVersion')}</h1>
                  <p className="mr-2">
                    <TransComponent i18nKey="commitTitle" values={{ hash: installedDeluxeData.installed.short }} />
                  </p>
                  <p className="mr-2">&mdash;</p>
                  {installedDateString && (
                    <p>
                      {installedDateString[0].toUpperCase()}
                      {installedDateString.slice(1)}
                    </p>
                  )}
                </div>
                <div className="flex-row!">
                  <img src={installedDeluxeData.installed.avatar} className="mr-2 h-24 min-h-24 w-24 min-w-24 border border-neutral-600" />
                  <div className="h-full w-full">
                    <p className="mb-1 bg-neutral-900 p-2 italic">{installedDeluxeData.installed.commitMessage}</p>

                    <p className="mb-1">
                      {t('commitBy')} {installedDeluxeData.installed.authorName}
                    </p>
                    <div className="flex-row! items-center">
                      <button className="mr-2 w-fit flex-row! items-center self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" onClick={async () => installedDeluxeData.installed && (await window.api.openExternalLink(`https://github.com/hmxmilohax/rock-band-3-deluxe/commit/${installedDeluxeData.installed.sha}`))}>
                        <GitHubIcon className="mr-1" />
                        {t('openCommitOnGitHub')}
                      </button>
                      <button
                        className="mr-2 w-fit flex-row! items-center self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                        onClick={async () => {
                          await window.api.openFSFolderInExplorer('rb3UsrDir')
                        }}
                      >
                        {t('openInstallationFolder')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {!installedDeluxeData.isUpdated && installedDeluxeData.latest && (
                <div className="mb-2 rounded-sm p-3">
                  <div className="mb-2 flex-row! items-end border-b border-neutral-600 pb-1">
                    <h1 className="mr-auto text-xl uppercase">{t('latestVersion')}</h1>
                    <p className="mr-2">
                      <TransComponent i18nKey="commitTitle" values={{ hash: installedDeluxeData.latest.short }} />
                    </p>
                    <p className="mr-2">&mdash;</p>
                    {latestDateString && (
                      <p>
                        {latestDateString[0].toUpperCase()}
                        {latestDateString.slice(1)}
                      </p>
                    )}
                  </div>
                  <div className="flex-row!">
                    <img src={installedDeluxeData.latest.avatar} className="mr-2 h-24 min-h-24 w-24 min-w-24 border border-neutral-600" />
                    <div className="h-full w-full">
                      <p className="mb-1 bg-neutral-900 p-2 italic">{installedDeluxeData.latest.commitMessage}</p>

                      <p className="mb-1">
                        {t('commitBy')} {installedDeluxeData.latest.authorName}
                      </p>
                      <button className="w-fit flex-row! items-center self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" onClick={async () => installedDeluxeData.installed && (await window.api.openExternalLink(`https://github.com/hmxmilohax/rock-band-3-deluxe/commit/${installedDeluxeData.latest?.sha}`))}>
                        <GitHubIcon className="mr-1" />
                        {t('openCommitOnGitHub')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-2 rounded-sm p-3">
                <div className="mb-2 flex-row! items-end border-b border-neutral-600 pb-1">
                  <h1 className="mr-auto text-xl uppercase">{t('status')}</h1>
                </div>
                {installedDeluxeData.latest && <p className="mb-2">{installedDeluxeData.latest.aheadBy === 1 ? t('notUpdatedRB3DXInfo', { behindBy: installedDeluxeData.latest.aheadBy }) : t('notUpdatedRB3DXInfoPlural', { behindBy: installedDeluxeData.latest.aheadBy })}</p>}
                {installedDeluxeData.isUpdated && <p className="mb-2">{t('latestDXVersionText')}</p>}
                {!installedDeluxeData.isUpdated && (
                  <div className="flex-row! items-center">
                    <button
                      className="mr-2 w-fit flex-row! items-center self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-start text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        try {
                          const newData = await window.api.downloadAndInstallDeluxe({ latestVersionHash: installedDeluxeData.latest?.short || '', type: 'standard' })
                          const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                          if (STRUCT_LOG) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', newRB3Stats)
                          setWindowState({ installedDeluxeData: newData, rb3Stats: newRB3Stats })
                        } catch (err) {
                          if (err instanceof Error) setWindowState({ err })
                        }
                        setWindowState({ disableButtons: false })
                      }}
                      disabled={disableButtons}
                    >
                      <TransComponent i18nKey="downloadInstallDeluxe" />

                      <code className="ml-3 font-bold">
                        <TransComponent i18nKey="latest" />
                      </code>
                    </button>
                    <button
                      className="mr-2 w-fit flex-row! items-center self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-start text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                      onClick={async () => {
                        setWindowState({ disableButtons: true })
                        try {
                          const newData = await window.api.downloadAndInstallDeluxe({ latestVersionHash: installedDeluxeData.latest?.short || '', type: 'customCharacters' })
                          const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                          if (STRUCT_LOG) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', newRB3Stats)
                          setWindowState({ installedDeluxeData: newData, rb3Stats: newRB3Stats })
                        } catch (err) {
                          if (err instanceof Error) setWindowState({ err })
                        }
                        setWindowState({ disableButtons: false })
                      }}
                      disabled={disableButtons}
                    >
                      <TransComponent i18nKey="downloadInstallDeluxe" />

                      <div className="items-start">
                        <code className="ml-3 font-bold">
                          <TransComponent i18nKey="latest" />
                        </code>

                        <code className="ml-3 font-bold">
                          <TransComponent i18nKey="customCharacters" />
                        </code>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {typeof installedDeluxeData === 'object' && installedDeluxeData.status === 'installedNoVer' && (
            <>
              <div className="mb-2 rounded-sm p-3">
                <div className="mb-2 flex-row! items-end border-b border-neutral-600 pb-1">
                  <h1 className="mr-auto text-xl uppercase">{t('status')}</h1>
                </div>
                <p>{t('deluxeInstalledNoVerText')}</p>
              </div>
            </>
          )}
          {typeof installedDeluxeData === 'object' && installedDeluxeData.status === 'vanilla' && (
            <>
              <div className="mb-2 rounded-sm p-3">
                <div className="mb-2 flex-row! items-end border-b border-neutral-600 pb-1">
                  <h1 className="mr-auto text-xl uppercase">{t('status')}</h1>
                </div>
                <p className="mb-2">{t('deluxeNotInstalledText')}</p>
                <div className="flex-row! items-center">
                  <button
                    className="mr-2 w-fit flex-row! items-center self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      try {
                        const newData = await window.api.downloadAndInstallDeluxe({ latestVersionHash: installedDeluxeData.latest?.short || '', type: 'standard' })
                        const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                        if (STRUCT_LOG) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', newRB3Stats)
                        setWindowState({ installedDeluxeData: newData, rb3Stats: newRB3Stats })
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ err })
                      }
                      setWindowState({ disableButtons: false })
                    }}
                    disabled={disableButtons}
                  >
                    <TransComponent i18nKey="downloadInstallDeluxe" />
                  </button>
                  <button
                    className="mr-2 w-fit flex-row! items-center self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                    onClick={async () => {
                      setWindowState({ disableButtons: true })
                      try {
                        const newData = await window.api.downloadAndInstallDeluxe({ latestVersionHash: installedDeluxeData.latest?.short || '', type: 'customCharacters' })
                        const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                        if (STRUCT_LOG) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', newRB3Stats)
                        setWindowState({ installedDeluxeData: newData, rb3Stats: newRB3Stats })
                      } catch (err) {
                        if (err instanceof Error) setWindowState({ err })
                      }
                      setWindowState({ disableButtons: false })
                    }}
                    disabled={disableButtons}
                  >
                    <TransComponent i18nKey="downloadInstallDeluxe" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {selectedTab === DELUXE_CONFIG_SCREEN_TABS.QUICK_CONFIG && (
        <div className="h-full w-full overflow-y-auto">
          <div className="h-full w-full flex-row! items-center">
            <button
              className="mr-2 h-full w-1/3 items-center rounded-sm border border-neutral-600 p-6 duration-100 last:mr-0 hover:bg-white/5 active:bg-white/15"
              disabled={disableButtons}
              onClick={async () => {
                setWindowState({ disableButtons: true })
                try {
                  await window.api.installQuickConfig(rpcs3ExePath, 'potato')
                } catch (err) {
                  if (err instanceof Error) setWindowState({ err })
                }
                setWindowState({ disableButtons: false })
              }}
            >
              <LowerRankIcon className="text-[15rem]" />
              <h1 className="mb-2 text-xl">{t('potatoQuickConfig')}</h1>
              <p className="font-open mb-auto normal-case">
                <TransComponent i18nKey="potatoQuickConfigText" />
              </p>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('operationalSystem')}: ${t('minimumConfigOS')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('processor')}: ${t('minimumConfigProcessor')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('ram')}: ${t('minimumConfigRAM')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('graphicsCard')}: ${t('potatoConfigGPU')}`}</p>
              </div>
            </button>

            <button
              className="mr-2 h-full w-1/3 items-center rounded-sm border border-neutral-600 p-6 duration-100 last:mr-0 hover:bg-white/5 active:bg-white/15"
              disabled={disableButtons}
              onClick={async () => {
                setWindowState({ disableButtons: true })
                try {
                  await window.api.installQuickConfig(rpcs3ExePath, 'potato')
                } catch (err) {
                  if (err instanceof Error) setWindowState({ err })
                }
                setWindowState({ disableButtons: false })
              }}
            >
              <MiddleRankIcon className="text-[15rem]" />
              <h1 className="mb-auto text-xl">{t('minimumQuickConfig')}</h1>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('operationalSystem')}: ${t('minimumConfigOS')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('processor')}: ${t('minimumConfigProcessor')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('ram')}: ${t('minimumConfigRAM')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('graphicsCard')}: ${t('minimumConfigGPU')}`}</p>
              </div>
            </button>

            <button
              className="mr-2 h-full w-1/3 items-center rounded-sm border border-neutral-600 p-6 duration-100 last:mr-0 hover:bg-white/5 active:bg-white/15"
              disabled={disableButtons}
              onClick={async () => {
                setWindowState({ disableButtons: true })
                try {
                  await window.api.installQuickConfig(rpcs3ExePath, 'potato')
                } catch (err) {
                  if (err instanceof Error) setWindowState({ err })
                }
                setWindowState({ disableButtons: false })
              }}
            >
              <HighRankIcon className="text-[15rem]" />
              <h1 className="mb-auto text-xl">{t('recommendedQuickConfig')}</h1>

              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('operationalSystem')}: ${t('recommendedConfigOS')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('processor')}: ${t('recommendedConfigProcessor')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('ram')}: ${t('recommendedConfigRAM')}`}</p>
              </div>
              <div className="mb-1 w-full rounded-sm border border-white/10 p-2">
                <p className="font-open normal-case">{`${t('graphicsCard')}: ${t('recommendedConfigGPU')}`}</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </AnimatedSection>
  )
}
