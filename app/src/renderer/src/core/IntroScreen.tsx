import { useTranslation } from 'react-i18next'
import { APP_VERSION } from '@renderer/app/rockshelf'
import { AnimatedSection, genAnim, TransComponent } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'

export function IntroScreen() {
  const { t } = useTranslation()

  const condition = useRendererState((state) => state.IntroScreen)

  const props = {
    condition,
    ...genAnim({ opacityInit: true }),
    id: 'IntroScreen',
  }

  return (
    <AnimatedSection {...props} className="absolute! z-1 h-full w-full items-center justify-center bg-neutral-900 p-16">
      <h1 className="text-[4rem] uppercase">{t('appTitle')}</h1>
      <p className="absolute bottom-5 text-center text-xs">
        {t('versionText', { version: APP_VERSION })}
        <br />
        <TransComponent i18nKey={'introFooterText'} />
      </p>
    </AnimatedSection>
  )
}
