import { LoadingIcon } from '@renderer/assets/icons'
import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionDiv, MotionSection } from '@renderer/lib/motion'
import { useIntroScreenState } from '@renderer/states/components/IntroScreenState'
import { useConfigState } from '@renderer/states/config'
import { useMainState } from '@renderer/states/main'
import type { UserConfig } from '@rockshelf/core'
import clsx from 'clsx'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'

const APP_STARTUP_MS = 40

export function IntroScreen() {
  const { t } = useTranslation()
  const disableButtons = useMainState((x) => x.disableButtons)
  const setMainState = useMainState((x) => x.setMainState)
  const setIntroScreenState = useIntroScreenState((x) => x.setIntroScreenState)
  const setConfigState = useConfigState((x) => x.setConfigState)

  // 0 Program just loaded
  // 1 Is first time loading the program: devhdd0 and rpcs3.exe path selection
  // 2 ???
  const introStateIndex = useIntroScreenState((x) => x.introStateIndex)
  const isDevhdd0PathButtonDisabled = useIntroScreenState((x) => x.isDevhdd0PathButtonDisabled)
  const isRPCS3ExePathButtonDisabled = useIntroScreenState((x) => x.isRPCS3ExePathButtonDisabled)
  const introDevhdd0Path = useIntroScreenState((x) => x.introDevhdd0Path)
  const introRPCS3ExePath = useIntroScreenState((x) => x.introRPCS3ExePath)

  useEffect(() => {
    const loadUserConfigOrInit = async () => {
      const hasUserConfig = await window.api.userConfig.checkUserConfig()
      if (!hasUserConfig) {
        setMainState({ disableButtons: false, disableTopBarButtons: false })
        setIntroScreenState({ introStateIndex: 1 })
        return
      }

      const userConfig = await window.api.userConfig.readUserConfigFilePath()
      if (!userConfig) {
        setMainState({ disableButtons: false, disableTopBarButtons: false })
        setIntroScreenState({ introStateIndex: 1 })
        return
      }

      setConfigState(userConfig)

      const stats = await window.api.rbtools.getRPCS3InstalledGamesStats(userConfig.devhdd0Path, userConfig.rpcs3ExePath)
      console.log(stats)
      setMainState({ stats })
      if (stats.BLUS30463?.hasSaveData) {
        const saveData = await window.api.rbtools.getSaveFileData(userConfig.devhdd0Path)
        console.log(saveData)
        if (saveData) setMainState({ saveData })
      }

      setMainState({ disableButtons: false, disableTopBarButtons: false })
      setIntroScreenState({ introStateIndex: 10 })
    }

    let timeout: NodeJS.Timeout

    if (introStateIndex === 0) {
      timeout = setTimeout(() => {
        loadUserConfigOrInit()
      }, APP_STARTUP_MS)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return (
    <AnimatedComponent condition={introStateIndex < 10}>
      <MotionSection {...genAnimation({ opacity: true, duration: 0 })} id="IntroScreen" className="absolute h-full w-full items-center justify-center bg-neutral-900 p-16">
        <h1 className="text-[4rem] uppercase">{t('title')}</h1>
        <AnimatedComponent condition={introStateIndex === 1}>
          <MotionDiv {...genAnimation({ height: true, opacity: true })} className="items-center">
            <div className="h-5"></div>
            <h2 className="mb-8 text-center">
              <Trans components={{ code: <code /> }} i18nKey="welcomeText" />
            </h2>

            <h2 className="mb-2 text-xs font-bold">DEV_HDD0</h2>
            <div className="mb-6 flex-row! items-center">
              <div className={clsx('mr-2 w-lg border p-2', introDevhdd0Path ? '' : 'border-neutral-600')}>
                <p className={clsx('truncate font-mono', introDevhdd0Path ? '' : 'text-neutral-600')}>{introDevhdd0Path || t('noPathSelected')}</p>
              </div>
              <button
                className="w-fit flex-row! border border-neutral-500 p-2 duration-100 hover:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
                disabled={disableButtons}
                onClick={async () => {
                  setMainState({ disableButtons: true })
                  setIntroScreenState({ isDevhdd0PathButtonDisabled: true })
                  const path = await window.api.initFunctions.selectDevHDD0FolderInit()
                  if (!path) {
                    setMainState({ disableButtons: false })
                    setIntroScreenState({ isDevhdd0PathButtonDisabled: false })
                    return
                  }
                  setMainState({ disableButtons: false })
                  setIntroScreenState({ isDevhdd0PathButtonDisabled: false, introDevhdd0Path: path })
                }}
              >
                <AnimatedComponent condition={isDevhdd0PathButtonDisabled}>
                  <MotionDiv {...genAnimation({ width: true, scaleX: true, opacity: true })} className="flex-row! text-sm">
                    <LoadingIcon className="animate-spin text-neutral-200 [animation-duration:0.75s]" />
                    <div className="h-full w-1" />
                  </MotionDiv>
                </AnimatedComponent>
                <p>{t('selectFolder')}</p>
              </button>
            </div>
            <h2 className="mb-2 text-xs font-bold">RPCS3.EXE</h2>
            <div className="mb-6 flex-row! items-center">
              <div className={clsx('mr-2 w-lg border p-2', introRPCS3ExePath ? '' : 'border-neutral-600')}>
                <p className={clsx('truncate font-mono', introRPCS3ExePath ? '' : 'text-neutral-600')}>{introRPCS3ExePath || t('noPathSelected')}</p>
              </div>
              <button
                className="w-fit flex-row! border border-neutral-500 p-2 duration-100 hover:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
                disabled={disableButtons}
                onClick={async () => {
                  setMainState({ disableButtons: true })
                  setIntroScreenState({ isRPCS3ExePathButtonDisabled: true })
                  const path = await window.api.initFunctions.selectRPCS3ExeFileInit(t('rpcs3Exe'))
                  if (!path) {
                    setMainState({ disableButtons: false })
                    setIntroScreenState({ isRPCS3ExePathButtonDisabled: false })
                    return
                  }

                  setMainState({ disableButtons: false })
                  setIntroScreenState({ introRPCS3ExePath: path, isRPCS3ExePathButtonDisabled: false })
                }}
              >
                <AnimatedComponent condition={isRPCS3ExePathButtonDisabled}>
                  <MotionDiv {...genAnimation({ width: true, scaleX: true, opacity: true })} className="flex-row! text-sm">
                    <LoadingIcon className="animate-spin text-neutral-200 [animation-duration:0.75s]" />
                    <div className="h-full w-1" />
                  </MotionDiv>
                </AnimatedComponent>
                <p>{t('selectExe')}</p>
              </button>
            </div>
            <AnimatedComponent condition={Boolean(introDevhdd0Path) && Boolean(introRPCS3ExePath)}>
              <MotionDiv {...genAnimation({ height: true, scaleY: true, opacity: true })}>
                <div className="h-4 w-full" />
                <button
                  className="w-fit border border-neutral-500 p-2 hover:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
                  disabled={disableButtons}
                  onClick={async () => {
                    setMainState({ disableButtons: true, disableTopBarButtons: true })
                    const isDevHDD0Valid = await window.api.rbtools.isDevHDD0PathValid(introDevhdd0Path)
                    if (!isDevHDD0Valid) return setMainState({ disableButtons: false })
                    const isRPCS3ExeValid = await window.api.rbtools.isRPCS3ExePathValid(introRPCS3ExePath)
                    if (!isRPCS3ExeValid) return setMainState({ disableButtons: false })

                    const newConfig: UserConfig = {
                      devhdd0Path: introDevhdd0Path,
                      rpcs3ExePath: introRPCS3ExePath,
                    }
                    setConfigState(newConfig)
                    await window.api.userConfig.saveUserConfigOnDisk(newConfig)

                    const stats = await window.api.rbtools.getRPCS3InstalledGamesStats(introDevhdd0Path, introRPCS3ExePath)
                    console.log(stats)
                    setMainState({ stats })
                    if (stats.BLUS30463?.hasSaveData) {
                      const saveData = await window.api.rbtools.getSaveFileData(introDevhdd0Path)
                      console.log(saveData)
                      if (saveData) setMainState({ saveData })
                    }

                    setMainState({ disableButtons: false, disableTopBarButtons: false })
                    setIntroScreenState({ introStateIndex: 10 })
                  }}
                >
                  {t('continue')}
                </button>
              </MotionDiv>
            </AnimatedComponent>
          </MotionDiv>
        </AnimatedComponent>

        <p className="absolute bottom-5 text-center text-xs">
          {t('versionText', { version: '1.0-beta1' })}
          <br />
          <Trans i18nKey={'introFooterText'} components={{ copy: <>&copy;</> }} />
        </p>
      </MotionSection>
    </AnimatedComponent>
  )
}
