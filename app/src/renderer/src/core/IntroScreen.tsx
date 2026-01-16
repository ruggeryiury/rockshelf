import { TransComponent } from '@renderer/lib/transComponents'
import { useWindowState } from '@renderer/states/window'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function IntroScreen() {
  const { t } = useTranslation()
  const setWindowState = useWindowState((x) => x.setWindowState)
  useEffect(() => {
    const initProgramProcessing = async () => {
      const hasUserConfig = await window.api.userConfig.checkUserConfig()
      if (!hasUserConfig) {
        setWindowState({ disableButtons: false, isFirstTimeModalActivated: true })
        return
      }
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
    <section id="IntroScreen" className="absolute h-full w-full items-center justify-center bg-neutral-900 p-16">
      <h1 className="text-[4rem] uppercase">{t('title')}</h1>
      <p className="absolute bottom-5 text-center text-xs">
        {t('versionText', { version: '1.0-beta1' })}
        <br />
        <TransComponent i18nKey={'introFooterText'} />
      </p>
    </section>
  )
}
