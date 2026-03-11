import { DXNIGHTLYLINK, TU5LINK } from '@renderer/app/rockshelf'
import { LoadingIcon } from '@renderer/assets/icons'
import { imgIconRB3DX, imgIconRB3 } from '@renderer/assets/images'
import { AnimatedSection, TransComponent, animate, selectInstrumentIcon } from '@renderer/lib.exports'
import { useCachedDataState } from '@renderer/stores/CacheData.store'
import { useInstallPKGFileScreenState } from '@renderer/stores/InstallPKGFileScreen.store'
import { useMainScreenState } from '@renderer/stores/MainScreen.store'
import { useWindowState } from '@renderer/stores/Window.store'
import clsx from 'clsx'
import { t } from 'i18next'
import { RockBand3Data } from 'rbtools/lib'
import { useMemo } from 'react'

export function RockBand3StatsScreen() {
  const disableButtons = useWindowState((x) => x.disableButtons)
  const setWindowState = useWindowState((x) => x.setWindowState)

  const rb3Stats = useCachedDataState((x) => x.rb3Stats)
  const saveData = useCachedDataState((x) => x.saveData)
  const instrumentScores = useCachedDataState((x) => x.instrumentScores)
  const setCachedData = useCachedDataState((x) => x.setCachedData)
  const setInstallPKGFileScreen = useInstallPKGFileScreenState((x) => x.setInstallPKGFileScreen)

  const selectedNavigatorIndex = useMainScreenState((x) => x.selectedNavigatorIndex)
  const isActivated = useMemo(() => selectedNavigatorIndex === 0, [selectedNavigatorIndex])
  return (
    <AnimatedSection id="RockBand3StatsScreen" condition={isActivated} {...animate({ opacity: true, duration: 0.1 })} className="absolute! h-full w-full overflow-hidden">
      {/* Loading Data Screen */}
      {rb3Stats === 'loading' && (
        <div className="h-full w-full p-24">
          <LoadingIcon className="mb-2 animate-spin text-3xl" />
          <h1 className="text-neutral-600">{t('loadingRB3StatData')}</h1>
        </div>
      )}
      {rb3Stats === false && (
        <p className="mb-2 text-neutral-600 italic">
          <TransComponent i18nKey="noRB3FoundInstalled" />
        </p>
      )}

      {/* Data fetched */}
      {typeof rb3Stats === 'object' && (
        <>
          <div className="p-6">
            <div className="mb-2 w-full flex-row! items-center bg-neutral-800 p-1">
              {saveData && instrumentScores && <img src={selectInstrumentIcon(instrumentScores.instrument)} title={t(instrumentScores.instrument)} className="mr-2 w-6 scale-110" />}
              <h1 className="mr-auto">{rb3Stats.userName}</h1>
              {!rb3Stats.hasSaveData && <p className="text-neutral-400 italic">{t('noSaveDataFound')}</p>}
              <button
                className="ml-2 w-fit rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                disabled={disableButtons}
                onClick={async () => {
                  setWindowState({ disableButtons: true })
                  setCachedData({ rb3Stats: 'loading' })
                  try {
                    const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                    setWindowState({ disableButtons: false })
                    setCachedData({ rb3Stats: newRB3Stats })
                  } catch (err) {
                    if (err instanceof Error) setWindowState({ unhandledException: err })
                  }
                }}
              >
                {t('refresh')}
              </button>
            </div>
            <div className="h-full w-full flex-row! items-start">
              <div>
                <img src={rb3Stats.hasDeluxe ? imgIconRB3DX : imgIconRB3} className={clsx('laptop:w-[256px] laptop:min-w-[256px] mb-2 w-48 min-w-48 hover:animate-pulse', rb3Stats.path ? '' : 'grayscale')} title={rb3Stats.hasDeluxe ? t('rb3dx') : t('rb3')} />
                <button
                  disabled={disableButtons}
                  className="mb-1 w-full rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    try {
                      const selPKGData = await window.api.selectPKGFileToInstall()
                      if (import.meta.env.DEV) console.log('struct SelectPKGFileReturnObject ["core/src/controllers/selectPKGFileToInstall"]:', selPKGData)
                      setInstallPKGFileScreen({ InstallPKGFileScreen: selPKGData })
                      setWindowState({ disableButtons: false })
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ unhandledException: err })
                    }
                  }}
                >
                  {t('installPKGFile')}
                </button>
                <button
                  disabled={disableButtons}
                  className="mb-1 w-full rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={() => {
                    // setRendererState({ QuickConfigurationModal: true })
                  }}
                >
                  {t('installQuickConfigurations')}
                </button>
              </div>
              <div className="w-fill ml-4 h-full">
                {/* No Rock Band 3 found on RPCS3 */}
                {!rb3Stats.hasGameInstalled && (
                  <p className="mb-2 text-neutral-600 italic">
                    <TransComponent i18nKey="noRB3FoundInstalled" />
                  </p>
                )}

                {/* Rock Band 3 found on RPCS3 */}
                {rb3Stats.hasGameInstalled && (
                  <>
                    <h1>{t('gameTitle')}</h1>
                    <p className="mb-2">{rb3Stats.gameName}</p>

                    <h1>{t('gameSerial')}</h1>
                    <p className="mb-2">{rb3Stats.gameSerial}</p>

                    <h1>{t('patchVersion')}</h1>

                    <p className="mb-2">{rb3Stats.updateType === 'none' ? t('noPatchInstalled') : rb3Stats.updateType === 'tu5' ? t('tu5') : t('dx')}</p>
                    {rb3Stats.updateType === 'none' && (
                      <p className="mb-4 text-neutral-600 italic">
                        <TransComponent components={{ spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={DXNIGHTLYLINK} target="_blank" />, spanLink2: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={TU5LINK} target="_blank" /> }} i18nKey="noPatchInstalledText" />
                      </p>
                    )}
                    {rb3Stats.updateType === 'tu5' && (
                      <p className="mb-4 text-neutral-600 italic">
                        <TransComponent components={{ spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={DXNIGHTLYLINK} target="_blank" /> }} i18nKey="tu5InstalledText" />
                      </p>
                    )}

                    <h1 className="mb-2 border-b border-neutral-600 pb-1">{t('patches')}</h1>

                    <h1>{t('teleportGlitch')}</h1>
                    <p className="mb-2">{rb3Stats.hasTeleportGlitchPatch ? t('installed') : t('notInstalled')}</p>

                    {/* {!rb3Stats.hasTeleportGlitchPatch && (
                      <p className="mb-4 text-neutral-600 italic">
                        <TransComponent
                          i18nKey="noTeleportGlitchText"
                          components={{
                            spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={RB3_TGF_LINK} target="_blank" />,
                          }}
                        />
                      </p>
                    )} */}

                    <h1>{t('highMemoryPatch')}</h1>
                    <p className="mb-2">{rb3Stats.hasHighMemoryPatch ? t('installed') : t('notInstalled')}</p>

                    {!rb3Stats.hasHighMemoryPatch && (
                      <p className="mb-4 text-neutral-600 italic">
                        <TransComponent
                          i18nKey="noHighMemoryPatchText"
                          components={{
                            spanLink: (
                              <a
                                className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300"
                                onClick={async () => {
                                  setWindowState({ disableButtons: true })
                                  try {
                                    await window.api.installHighMemoryPatch()
                                    setCachedData((oldState) => {
                                      return {
                                        rb3Stats: {
                                          ...(oldState.rb3Stats as RockBand3Data),
                                          hasHighMemoryPatch: true,
                                        },
                                      }
                                    })
                                    setWindowState({ disableButtons: false })
                                  } catch (err) {
                                    if (err instanceof Error) setWindowState({ unhandledException: err })
                                  }
                                }}
                              />
                            ),
                          }}
                        />
                      </p>
                    )}

                    {rb3Stats.hasHighMemoryPatch && rb3Stats.updateType !== 'dx' && (
                      <p className="mb-4 text-neutral-600 italic">
                        <TransComponent components={{ spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={DXNIGHTLYLINK} target="_blank" /> }} i18nKey="highMemoryPatchNoEffect" />
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {/* <QuickConfigurationModal /> */}
        </>
      )}
    </AnimatedSection>
  )
}
