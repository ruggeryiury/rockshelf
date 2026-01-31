import { ARBYS3_LINK, DXNIGHTLYLINK, TU5LINK } from '@renderer/app/rockshelf'
import { LoadingIcon } from '@renderer/assets/icons'
import { imgIconRB3, imgIconRB3DX } from '@renderer/assets/images'
import { QuickConfigurationModal } from '@renderer/core'
import { AnimatedDiv, genAnim, TransComponent } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import { useWindowState } from '@renderer/states/WindowState'
import clsx from 'clsx'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RockBand3Data } from 'rockshelf-core/lib'

export function RockBand3DataScreen() {
  const { i18n, t } = useTranslation()
  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
  const isIntroActivated = useRendererState((state) => state.IntroScreen)
  const rb3Stats = useWindowState((state) => state.rb3Stats)
  const mainWindowSelectionIndex = useWindowState((state) => state.mainWindowSelectionIndex)
  const disableButtons = useWindowState((state) => state.disableButtons)

  const setWindowState = useWindowState((state) => state.setWindowState)
  const setRendererState = useRendererState((state) => state.setRendererState)

  useEffect(() => {
    const fetchData = async () => {
      if (!isIntroActivated) {
        const newRB3Stats = await window.api.rpcs3.getRB3Data(devhdd0Path, rpcs3ExePath)
        setWindowState({ rb3Stats: newRB3Stats })
        console.log('Rock Band 3 Data:', newRB3Stats)
      }
    }

    fetchData()
  }, [isIntroActivated])

  useEffect(() => {
    if (mainWindowSelectionIndex !== 0) setRendererState({ QuickConfigurationModal: false })
  }, [mainWindowSelectionIndex])
  return (
    <AnimatedDiv id="RockBand3DataScreen" condition={mainWindowSelectionIndex === 0} {...genAnim({ opacity: true, duration: 0.1 })} className="h-full w-full overflow-hidden">
      {/* Loading Data Screen */}
      {rb3Stats === null && (
        <div className="h-full w-full p-24">
          <LoadingIcon className="mb-2 animate-spin text-3xl" />
          <h1 className="text-neutral-600">{t('loadingRB3StatData')}</h1>
        </div>
      )}

      {/* Data fetched */}
      {rb3Stats && (
        <>
          <div className="p-6">
            <div className="mb-2 w-full flex-row! items-center bg-neutral-800 p-1">
              <h1 className="mr-auto">{rb3Stats.userName}</h1>
              {!rb3Stats.hasSaveData && <p className="text-neutral-400 italic">{t('noSaveDataFound')}</p>}
              <button
                className="ml-2 w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-xs! duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                disabled={disableButtons}
                onClick={async () => {
                  setWindowState({ disableButtons: true, rb3Stats: null })
                  const newRB3Stats = await window.api.rpcs3.getRB3Data(devhdd0Path, rpcs3ExePath)
                  setWindowState({ disableButtons: false, rb3Stats: newRB3Stats })
                }}
              >
                {t('refresh')}
              </button>
            </div>
            <div className="h-full w-full flex-row! items-start">
              <div>
                <img src={rb3Stats.hasDeluxe ? imgIconRB3DX : imgIconRB3} className={clsx('laptop:w-[256px] laptop:min-w-[256px] mb-2 w-48 min-w-48 hover:animate-pulse', rb3Stats.path ? '' : 'grayscale')} alt={rb3Stats.hasDeluxe ? t('rb3DXLogo') : t('rb3Logo')} title={rb3Stats.hasDeluxe ? t('rb3DXLogo') : t('rb3Logo')} />
                <button
                  disabled={disableButtons}
                  className="mb-1 w-full rounded-xs bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    const selPKGData = await window.api.rpcs3.selectPKGFileToInstall(i18n.language)
                    setRendererState({ InstallPKGConfirmationModal: selPKGData })
                    setWindowState({ disableButtons: false })
                  }}
                >
                  {t('installPKGFile')}
                </button>
                <button
                  disabled={disableButtons}
                  className="mb-1 w-full rounded-xs bg-neutral-900 px-1 py-0.5 text-xs! duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={() => {
                    setRendererState({ QuickConfigurationModal: true })
                  }}
                >
                  {t('installQuickConfigurations')}
                </button>
              </div>
              <div className="w-fill ml-4 h-full">
                {/* No Rock Band 3 found on RPCS3 */}
                {!rb3Stats.hasGameInstalled && (
                  <>
                    <p className="mb-2 text-neutral-600 italic">
                      <TransComponent i18nKey="noRB3FoundInstalled" />
                    </p>
                    <button className="w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-sm! duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900" onClick={async () => await window.api.utils.openExternalLink(ARBYS3_LINK)}>
                      {t('downloadArbys3Btn')}
                    </button>
                  </>
                )}

                {/* Rock Band 3 found on RPCS3 */}
                {rb3Stats.hasGameInstalled && (
                  <>
                    <h1>{t('gameTitle')}</h1>
                    <p className="mb-2">{rb3Stats.gameName}</p>

                    <h1>{t('gameSerial')}</h1>
                    <p className="mb-2">{rb3Stats.gameSerial}</p>

                    <h1>{t('patchVersion')}</h1>

                    <p className="mb-2">{rb3Stats.updateType === 'none' ? t('noPatchInstalled') : rb3Stats.updateType === 'tu5' ? t('tu5') : t('deluxe')}</p>
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

                    {!rb3Stats.hasTeleportGlitchPatch && (
                      <p className="mb-4 text-neutral-600 italic">
                        <TransComponent
                          i18nKey="noTeleportGlitchText"
                          components={{
                            spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={ARBYS3_LINK} target="_blank" />,
                          }}
                        />
                      </p>
                    )}

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
                                  await window.api.rpcs3.installHighMemoryPatch(devhdd0Path)
                                  setWindowState((oldState) => {
                                    return {
                                      rb3Stats: {
                                        ...(oldState.rb3Stats as RockBand3Data),
                                        hasHighMemoryPatch: true,
                                      },
                                      disableButtons: false,
                                    }
                                  })
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
          <QuickConfigurationModal />
        </>
      )}
    </AnimatedDiv>
  )
}
