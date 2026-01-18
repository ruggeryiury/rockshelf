import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedSection } from '@renderer/lib/motion'
import { TransComponent } from '@renderer/lib/transComponent'
import { useConfigState } from '@renderer/states/config'
import { useMainState } from '@renderer/states/main'
import { useWindowState } from '@renderer/states/window'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function IntroScreen() {
  const { t } = useTranslation()

  const setWindowState = useWindowState((x) => x.setWindowState)
  const setConfigState = useConfigState((x) => x.setConfigState)
  const setMainState = useMainState((x) => x.setMainState)

  const isIntroScreenActivated = useWindowState((x) => x.isIntroScreenActivated)

  useEffect(() => {
    const initProgramProcessing = async () => {
      const hasUserConfig = await window.api.userConfig.checkUserConfig()
      if (!hasUserConfig) {
        setWindowState({ disableButtons: false, isFirstTimeModalActivated: true })
        return
      }
      const userConfig = await window.api.userConfig.readUserConfigFilePath()
      if (!userConfig) throw new Error('hasUserConfig true BUT userConfig false?')
      setConfigState(userConfig)
      const data = await window.api.initFunctions.fetchRPCS3Data(userConfig.devhdd0Path, userConfig.rpcs3ExePath)
      setMainState({ ...data })
      setWindowState({ isIntroScreenActivated: false })
    }

    const timeouts: NodeJS.Timeout[] = []
    const timeout = setTimeout(() => {
      initProgramProcessing()
    }, 2000)
    timeouts.push(timeout)

    return () => {
      for (const timeout of timeouts) clearTimeout(timeout)
    }
  })
  return (
    <AnimatedSection condition={isIntroScreenActivated} {...genAnimation({opacityInit: true})} id="IntroScreen" className="absolute z-10 h-full w-full items-center justify-center bg-neutral-900 p-16">
      <h1 className="text-[4rem] uppercase">{t('title')}</h1>
      <p className="absolute bottom-5 text-center text-xs">
        {t('versionText', { version: '1.0-beta1' })}
        <br />
        <TransComponent i18nKey={'introFooterText'} />
      </p>
    </AnimatedSection>
  )
}
