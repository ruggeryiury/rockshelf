import clsx from 'clsx'
import { animate, AnimatedDiv, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useMainScreenState } from './MainScreen.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import type { ParsedRB3SaveData, InstrumentScoreData } from 'rockshelf-core/rbtools'
import { DXNIGHTLYLINK, TU5LINK } from '@renderer/app/rockshelf'
import type { RockBand3Data } from 'rockshelf-core/rbtools/lib'
import { useDeluxeInstallScreenState } from './DeluxeInstallScreen.state'
import { useMessageBoxState } from './MessageBox.state'
import { useConfigScreenState } from './ConfigScreen.state'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useShallow } from 'zustand/shallow'
import { useCreateNewPackageScreenState } from './CreateNewPackageScreen.state'

export function MainScreen() {
  const { t } = useTranslation()
  const active = useMainScreenState((x) => x.active)
  const { disableButtons, saveData, setWindowState, rb3Stats, instrumentScores, packages, richPresence } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, saveData: x.saveData, setWindowState: x.setWindowState, rb3Stats: x.rb3Stats, instrumentScores: x.instrumentScores, packages: x.packages, richPresence: x.richPresence })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { setDeluxeInstallScreenState } = useDeluxeInstallScreenState(useShallow((x) => ({ setDeluxeInstallScreenState: x.setDeluxeInstallScreenState })))
  const { setConfigScreenState } = useConfigScreenState(useShallow((x) => ({ setConfigScreenState: x.setConfigScreenState })))
  const { setMyPackagesScreenState } = useMyPackagesScreenState(useShallow((x) => ({ setMyPackagesScreenState: x.setMyPackagesScreenState })))
  const { setCreateNewPackageScreenState } = useCreateNewPackageScreenState(useShallow((x) => ({ setCreateNewPackageScreenState: x.setCreateNewPackageScreenState })))

  return (
    <AnimatedSection id="MainScreen" condition={active} className="z-1 h-full max-h-full w-full max-w-full overflow-y-hidden bg-black/90 p-8">
      <div className="h-full max-h-full w-full max-w-full overflow-y-auto">
        <div className="mb-4 h-12 w-full flex-row! items-center rounded-sm border border-neutral-900 bg-neutral-800 px-3 py-2">
          {typeof rb3Stats === 'object' && rb3Stats.userName && rb3Stats.hasSaveData && typeof saveData === 'object' && typeof instrumentScores === 'object' && (
            <>
              <div className="h-full flex-row! items-center">
                <img title={t(instrumentScores.instrument)} src={`instrumenticons://${instrumentScores.instrument.toLowerCase()}`} className="mr-2 h-8 min-h-8 w-8 min-w-8 opacity-65" />
                <div>
                  <h1 className="text-lg">{rb3Stats.userName}</h1>
                  <h2 className="text-xs">{saveData.profileName}</h2>
                </div>
                <div className="mx-4 h-full w-0.5 bg-white/50" />
                <div className="mr-4">
                  <h1 className="text-[0.65rem] uppercase">{t('totalScore')}</h1>
                  <h2 className="font-pentatonic text-sm">{instrumentScores.scoreCount}</h2>
                </div>
                {typeof packages === 'object' && (
                  <>
                    <div className="mr-4">
                      <h1 className="text-[0.65rem] uppercase">{t('starsCount')}</h1>
                      <div className="flex-row! items-center">
                        <img src="rbicons://rb4-stars" className="relative! top-[0.05rem] mr-1 h-3 min-h-3 w-3 min-w-3" />
                        <h2 className="font-pentatonic text-sm">
                          {instrumentScores.starsCount}/{packages.starsCount}
                        </h2>
                      </div>
                    </div>
                    <div>
                      <h1 className="text-[0.65rem] uppercase">{t('goldStars')}</h1>
                      <div className="flex-row! items-center">
                        <img src="rbicons://rb4-stars-gold" className="relative! top-[0.05rem] mr-1 h-3 min-h-3 w-3 min-w-3" />
                        <h2 className="font-pentatonic text-sm">
                          {instrumentScores.goldStars}/{packages.allSongsPlusRB3}
                        </h2>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="mr-auto"></div>
            </>
          )}
          {typeof rb3Stats === 'object' && !rb3Stats.hasSaveData && (
            <>
              <p className="mr-auto self-start text-xs text-neutral-500 italic">{t('noSaveDataFound')}</p>
            </>
          )}
          {rb3Stats === 'loading' && (
            <>
              <p className="mr-auto self-start text-base text-neutral-500 italic">{t('loadingRB3Data')}</p>
            </>
          )}
          <button
            className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disableButtons}
            onClick={async () => {
              setWindowState({ disableButtons: true, rb3Stats: 'loading' })
              try {
                setTimeout(async () => {
                  const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                  console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', rb3Stats)
                  let newSaveData: ParsedRB3SaveData | false = false
                  let newInstrumentScores: InstrumentScoreData | false = false
                  if (typeof rb3Stats === 'object' && (rb3Stats.hasSaveData || rb3Stats.userName !== null)) {
                    newSaveData = await window.api.rpcs3GetSaveDataStats()
                    console.log('struct ParsedRB3SaveData ["rbtools/src/lib/rpsc3/getSaveData.ts"]:', newSaveData)
                    if (newSaveData) {
                      newInstrumentScores = await window.api.rpcs3GetInstrumentScores(newSaveData)
                      console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrumentScores)
                    }
                  }
                  setWindowState({ disableButtons: false, rb3Stats: newRB3Stats, saveData: newSaveData, instrumentScores: newInstrumentScores })
                }, 300)
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
            }}
          >
            {t('refresh')}
          </button>
        </div>
        <AnimatedDiv condition={typeof rb3Stats === 'object'} className="flex-row!" {...animate({ opacity: true, duration: 0.1 })}>
          {typeof rb3Stats === 'object' && (
            <>
              <div className="mr-4 h-48 max-h-48 w-48 max-w-48">
                <img src={`rbicons://${rb3Stats.hasDeluxe ? 'dx' : 'rb3'}`} className={clsx(!rb3Stats.hasGameInstalled && 'grayscale', 'mr-4 mb-2 h-48 min-h-48 w-48 min-w-48 border-2 border-neutral-700 duration-200')} />

                <button
                  className="mb-2 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  disabled={disableButtons}
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    await window.api.playRockBand3()
                    setWindowState({ disableButtons: false })
                  }}
                >
                  {t(`play${rb3Stats.hasDeluxe ? 'DX' : 'RB3'}`)}
                </button>
                <button
                  className="mb-2 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  disabled={disableButtons}
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    if (richPresence) {
                      try {
                        const rpDestroySuccess = await window.api.discordRPDestroy()
                        if (!rpDestroySuccess) {
                          setWindowState({ disableButtons: false, richPresence: true })
                          return
                        }
                        setWindowState({ disableButtons: false, richPresence: false })
                        setMessageBoxState({ message: { type: 'info', code: 'discordRPStopped' } })
                        return
                      } catch (err) {
                        setWindowState({ disableButtons: false, richPresence: true })
                      }
                    }
                    try {
                      const rpStartSuccess = await window.api.discordRPStart()
                      if (!rpStartSuccess) {
                        setWindowState({ disableButtons: false, richPresence: false })
                        return
                      }
                      setWindowState({ disableButtons: false, richPresence: true })
                      setMessageBoxState({ message: { type: 'info', code: 'discordRPStarted' } })
                      return
                    } catch (err) {
                      setWindowState({ disableButtons: false, richPresence: true })
                    }
                  }}
                >
                  {richPresence ? t('stopRichPresence') : t('startRichPresence')}
                </button>
                <button
                  className="mb-2 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  disabled={disableButtons}
                  onClick={async () => {
                    setDeluxeInstallScreenState({ active: true })
                  }}
                >
                  {t('installDeluxe')}
                </button>
                <button
                  className="mb-2 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  disabled={disableButtons}
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    setCreateNewPackageScreenState({ active: true })
                    setWindowState({ disableButtons: false })
                  }}
                >
                  {t('createNewPackage')}
                </button>
                <button
                  className="mb-2 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  disabled={disableButtons}
                  onClick={async () => {
                    setMyPackagesScreenState({ active: true })
                  }}
                >
                  {t('myPackages')}
                </button>
                <button
                  className="mb-2 w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mb-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  disabled={disableButtons}
                  onClick={async () => {
                    setConfigScreenState({ active: true })
                  }}
                >
                  {t('configurations')}
                </button>
              </div>
              <div className="w-full">
                {!rb3Stats.hasGameInstalled && <p className="text-xs text-neutral-500 italic">{t('noRB3FoundInstalled')}</p>}
                {rb3Stats.hasGameInstalled && (
                  <>
                    <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('gameTitle')}</h1>
                    <p className="mb-2">{rb3Stats.gameName}</p>

                    <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('gameSerial')}</h1>
                    <p className="mb-2">{rb3Stats.gameSerial}</p>

                    <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('patchVersion')}</h1>
                    <p className="mb-2">{rb3Stats.updateType === 'none' ? t('noPatchInstalled') : rb3Stats.updateType === 'tu5' ? t('tu5') : t('dx')}</p>
                    {rb3Stats.updateType === 'none' && (
                      <p className="mb-4 text-xs text-yellow-500 italic">
                        <TransComponent i18nKey="noPatchInstalledText" />
                      </p>
                    )}

                    {rb3Stats.updateType === 'tu5' && (
                      <p className="mb-4 text-neutral-600 italic">
                        <TransComponent components={{ spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={DXNIGHTLYLINK} target="_blank" rel="noreferrer" /> }} i18nKey="tu5InstalledText" />
                      </p>
                    )}
                    <h1 className="font-pentatonicalt! mb-2 border-b border-neutral-600 pb-1 text-gray-400 uppercase">{t('patches')}</h1>
                    <h1 className="mb-0.5 text-gray-400 uppercase">{t('teleportGlitch')}</h1>
                    <p className="mb-2">{rb3Stats.hasTeleportGlitchPatch ? t('installed') : t('notInstalled')}</p>
                    <h1 className="mb-0.5 text-gray-400 uppercase">{t('highMemoryPatch')}</h1>
                    <p className="mb-2">{rb3Stats.hasHighMemoryPatch ? t('installed') : t('notInstalled')}</p>

                    {!rb3Stats.hasHighMemoryPatch && (
                      <p className="mb-4 text-xs text-neutral-600 italic">
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
                                    setWindowState((oldState) => {
                                      return {
                                        rb3Stats: {
                                          ...(oldState.rb3Stats as RockBand3Data),
                                          hasHighMemoryPatch: true,
                                        },
                                      }
                                    })
                                    setWindowState({ disableButtons: false })
                                  } catch (err) {
                                    console.log(err)
                                    if (err instanceof Error) setWindowState({ err })
                                  }
                                }}
                              />
                            ),
                          }}
                        />
                      </p>
                    )}

                    {rb3Stats.hasHighMemoryPatch && rb3Stats.updateType !== 'dx' && (
                      <p className="mb-4 text-xs text-red-500 italic">
                        <TransComponent i18nKey="highMemoryPatchNoEffect" />
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </AnimatedDiv>
      </div>
    </AnimatedSection>
  )
}
