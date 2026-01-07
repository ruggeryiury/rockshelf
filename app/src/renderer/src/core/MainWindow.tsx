import { CheckedBoxIcon, LoadingIcon, UncheckedBoxIcon } from '@renderer/assets/icons'
import { imgIconRB3, imgIconRB3DX } from '@renderer/assets/images'
import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionDiv } from '@renderer/lib/motion'
import { useIntroScreenState } from '@renderer/states/components/IntroScreenState'
import { useConfigState } from '@renderer/states/config'
import { useMainState } from '@renderer/states/main'
import { Trans, useTranslation } from 'react-i18next'

export function MainWindow() {
  const { t } = useTranslation()
  const introStateIndex = useIntroScreenState((x) => x.introStateIndex)
  const stats = useMainState((x) => x.stats)
  const saveData = useMainState((x) => x.saveData)
  const isHighMemoryPatchBeingInstalled = useMainState((x) => x.isHighMemoryPatchBeingInstalled)
  const setMainState = useMainState((x) => x.setMainState)
  const devhdd0Path = useConfigState((x) => x.devhdd0Path)
  const rpcs3ExePath = useConfigState((x) => x.rpcs3ExePath)
  return (
    <AnimatedComponent condition={introStateIndex >= 10}>
      <MotionDiv {...genAnimation({ opacity: true, duration: 0.5 })} id="MainWindow" className="z-1 h-full max-h-full w-full max-w-full bg-neutral-900 p-8">
        <div className="mb-8 w-full flex-row! items-center border-b pb-3">
          <h1 className="text-3xl">{saveData?.profileName ? t('welcomeWithProfileName', { profileName: saveData.profileName }) : t('welcome')}</h1>
        </div>
        {stats && 'BLUS30463' in stats ? (
          <>
            <div className="flex-row!">
              <div className="mr-4 max-w-64">
                <img src={imgIconRB3DX} className="mb-2 w-64 max-w-64 border-4 border-neutral-800" />
                <button
                  className="rounded-sm bg-neutral-800 py-1 font-bold uppercase duration-500 hover:bg-gray-700"
                  onClick={async () => {
                    setMainState({ disableButtons: true, disableTopBarButtons: true })
                    const newStats = await window.api.rbtools.getRPCS3InstalledGamesStats(devhdd0Path, rpcs3ExePath)
                    setMainState({ stats: newStats, disableButtons: false, disableTopBarButtons: false })
                  }}
                >
                  {t('refreshRPCS3Stats')}
                </button>
              </div>
              <div>
                <div className="mb-4 flex-row! items-end">
                  <h1 className="mr-2 text-3xl">{stats.BLUS30463!.hasDeluxe ? 'Rock Band 3 Deluxe' : 'Rock Band 3'}</h1>
                  <h2 className="mb-[0.05rem]">BLUS-30463</h2>
                </div>
                <h2 className="mb-1 text-xs font-bold uppercase">{t('gamePatchType')}</h2>
                <p className="mb-4">{stats.BLUS30463!.updateType === 'milohax_dx' ? t('milohaxDX') : ''}</p>
                <h2 className="mb-1 text-xs font-bold uppercase">{t('teleportGlitchPatch')}</h2>
                {!stats.BLUS30463!.hasTeleportGlitchPatch && (
                  <div className="mb-4 flex-row! items-center">
                    <p className="text-neutral-500">
                      <Trans
                        i18nKey={'teleportGlitchPatchNotInstalled'}
                        components={{
                          invoker: (
                            <a
                              target="_blank"
                              href={'https://drive.google.com/file/d/1NSyjSz9EhYZV8O2XMulLvbTR5d8vnS-a/view?usp=sharing'}
                              className="hover:text-default-white underline hover:cursor-pointer"
                              onClick={async () => {
                                setMainState({ disableButtons: true, disableTopBarButtons: true, isHighMemoryPatchBeingInstalled: true })
                                await window.api.rbtools.installHighMemotyPatch(devhdd0Path)
                                const newStats = await window.api.rbtools.getRPCS3InstalledGamesStats(devhdd0Path, rpcs3ExePath)
                                setMainState({ stats: newStats, disableButtons: false, disableTopBarButtons: false, isHighMemoryPatchBeingInstalled: false })
                              }}
                            />
                          ),
                        }}
                      />
                    </p>
                  </div>
                )}
                {stats.BLUS30463!.hasTeleportGlitchPatch && (
                  <div className="mb-4 flex-row! items-center">
                    <CheckedBoxIcon className="mr-1" />
                    <p>{t('installed')}</p>
                  </div>
                )}
                <h2 className="mb-1 text-xs font-bold uppercase">{t('highMemoryPatch')}</h2>
                {!stats.BLUS30463!.hasHighMemoryPatch && (
                  <div className="flex-row! items-center">
                    <AnimatedComponent condition={isHighMemoryPatchBeingInstalled}>
                      <MotionDiv {...genAnimation({ width: true, scaleX: true, opacity: true })} className="flex-row! items-center">
                        <LoadingIcon className="animate-spin" />
                        <div className="w-2" />
                      </MotionDiv>
                    </AnimatedComponent>
                    <p className="text-neutral-500">
                      <Trans
                        i18nKey={'highMemoryNotInstalled'}
                        components={{
                          invoker: (
                            <span
                              className="hover:text-default-white underline hover:cursor-pointer"
                              onClick={async () => {
                                setMainState({ disableButtons: true, disableTopBarButtons: true, isHighMemoryPatchBeingInstalled: true })
                                await window.api.rbtools.installHighMemotyPatch(devhdd0Path)
                                const newStats = await window.api.rbtools.getRPCS3InstalledGamesStats(devhdd0Path, rpcs3ExePath)
                                setMainState({ stats: newStats, disableButtons: false, disableTopBarButtons: false, isHighMemoryPatchBeingInstalled: false })
                              }}
                            />
                          ),
                        }}
                      />
                    </p>
                  </div>
                )}
                {stats.BLUS30463!.hasHighMemoryPatch && (
                  <div className="flex-row! items-center">
                    <CheckedBoxIcon className="mr-1" />
                    <p>{t('installed')}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </MotionDiv>
    </AnimatedComponent>
  )
}
