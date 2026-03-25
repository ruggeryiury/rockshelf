import clsx from 'clsx'
import { animate, AnimatedDiv, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useMainScreenState } from './MainScreen.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { LoadingIcon } from '@renderer/assets/icons'
import type { ParsedRB3SaveData, InstrumentScoreData } from 'rbtools'
import { DXNIGHTLYLINK, TU5LINK } from '@renderer/app/rockshelf'
import { RockBand3Data } from 'rbtools/lib'
import { useDeluxeInstallScreenState } from './DeluxeInstallScreen.state'

export function MainScreen() {
  const { t } = useTranslation()
  const active = useMainScreenState((x) => x.active)
  const rb3Stats = useWindowState((x) => x.rb3Stats)
  const saveData = useWindowState((x) => x.saveData)
  const disableButtons = useWindowState((x) => x.disableButtons)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setDeluxeInstallScreenState = useDeluxeInstallScreenState((x) => x.setDeluxeInstallScreenState)

  return (
    <AnimatedSection id="MainScreen" condition={active} className="h-full max-h-full w-full max-w-full overflow-y-hidden p-8">
      <div className="h-full max-h-full w-full max-w-full overflow-y-auto">
        <div className="mb-4 h-12 w-full flex-row! items-center rounded-sm border border-neutral-900 bg-neutral-800 px-3 py-2">
          {typeof rb3Stats === 'object' && rb3Stats.userName && rb3Stats.hasSaveData && (
            <>
              <div>
                <h1 className="text-lg">{rb3Stats.userName}</h1>
                {typeof saveData === 'object' && <h2 className="text-xs">{saveData.profileName}</h2>}
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
              <p className="mr-auto self-start text-xs text-neutral-500 italic">{t('loadingRB3Data')}</p>
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
                  if (import.meta.env.DEV) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', rb3Stats)
                  let newSaveData: ParsedRB3SaveData | false = false
                  let newInstrumentScores: InstrumentScoreData | false = false
                  if (typeof rb3Stats === 'object' && (rb3Stats.hasSaveData || rb3Stats.userName !== null)) {
                    newSaveData = await window.api.rpcs3GetSaveDataStats()
                    if (import.meta.env.DEV) console.log('struct ParsedRB3SaveData ["rbtools/src/lib/rpsc3/getSaveData.ts"]:', newSaveData)
                    if (newSaveData) {
                      newInstrumentScores = await window.api.rpcs3GetInstrumentScores(newSaveData)
                      if (import.meta.env.DEV) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', newInstrumentScores)
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
                <img src={`rbicons://${rb3Stats.hasDeluxe ? 'dx' : 'rb3'}`} className={clsx(!rb3Stats.hasGameInstalled && 'grayscale', 'mr-4 mb-2 h-48 min-h-48 w-48 min-w-48 duration-200')} />
                <button
                  className="w-full self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    setDeluxeInstallScreenState({ active: true })
                  }}
                >
                  {t('installDeluxe')}
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
                      <p className="mb-4 text-xs text-neutral-600 italic">
                        <TransComponent components={{ spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={DXNIGHTLYLINK} target="_blank" rel="noreferrer" />, spanLink2: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={TU5LINK} target="_blank" rel="noreferrer" /> }} i18nKey="noPatchInstalledText" />
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
                      <p className="mb-4 text-xs text-neutral-600 italic">
                        <TransComponent components={{ spanLink: <a className="cursor-pointer underline hover:text-neutral-400 active:text-neutral-300" href={DXNIGHTLYLINK} target="_blank" rel="noreferrer" /> }} i18nKey="highMemoryPatchNoEffect" />
                      </p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </AnimatedDiv>
        {/* <div className="mb-4 h-8 w-full flex-row! items-center rounded-sm bg-neutral-800 px-3">
          {typeof rb3Stats === 'object' && !rb3Stats.hasGameInstalled && saveData && <p className="text-neutral-400 italic">{t('noSaveDataFound')}</p>}
          <button
            className="ml-auto w-fit rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            disabled={disableButtons}
            onClick={() =>
              errorHandler(async () => {
                setWindowState({ disableButtons: true, rb3Stats: 'loading' })
                const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                setWindowState({ disableButtons: false, rb3Stats: newRB3Stats })
              })
            }
          >
            {t('refresh')}
          </button>
        </div>
        <div className="flex-row!">
          <img src={`rbicons://${typeof rb3Stats === 'object' && rb3Stats.hasDeluxe ? 'dx' : 'rb3'}`} className={clsx(typeof rb3Stats === 'object' && !rb3Stats.hasGameInstalled && 'grayscale', 'mr-4 h-48 min-h-48 w-48 min-w-48')} />
          <div>
            {typeof rb3Stats === 'object' && !rb3Stats.hasGameInstalled && (
              <>
                <h1 className="uppercase">{t('status')}</h1>
                <h2 className="mb-4 font-bold">{t('notInstalled')}</h2>
                <p className="mb-2 text-xs text-neutral-600 italic">
                  <TransComponent i18nKey="noRB3FoundInstalled" />
                </p>
                <button
                  disabled={disableButtons}
                  onClick={async () => {
                    setWindowState({ rb3Stats: 'loading', disableButtons: true })
                    try {
                      const newRB3Stats = await window.api.rpcs3GetRB3Stats()
                      if (import.meta.env.DEV) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', newRB3Stats)
                      setWindowState({ rb3Stats: newRB3Stats, disableButtons: false })
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ err: err })
                    }
                  }}
                  className="w-fit rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                >
                  {t('refresh')}
                </button>
              </>
            )}
            {rb3Stats === 'loading' && (
              <div className="flex-row! items-center">
                <LoadingIcon className="mr-2 animate-spin" />
                <p>{t('refreshingData')}</p>
              </div>
            )}
            {typeof rb3Stats === 'object' && rb3Stats.hasGameInstalled && (
              <>
                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('gameSerial')}</h1>
                <p className="mb-2">{rb3Stats.gameSerial}</p>
                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('status')}</h1>
                <p className="mb-4">{t('installed')}</p>
                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('patchVersion')}</h1>
                <p className="mb-4">{rb3Stats.updateType === 'none' ? t('noPatchInstalled') : rb3Stats.updateType === 'tu5' ? t('tu5') : t('dx')}</p>
              </>
            )}
          </div>
        </div> */}
      </div>
    </AnimatedSection>
  )
}
