import { AnimatedSection, genAnim } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { wavesPattern } from '@renderer/assets/images'
import { useTranslation } from 'react-i18next'

export function WelcomeModal() {
  const { t } = useTranslation()
  const condition = useRendererState((state) => state.WelcomeModal)
  console.log(wavesPattern)
  return (
    <AnimatedSection id="WelcomeModal" condition={condition} {...genAnim({ opacity: true })} className="absolute! z-10 h-full w-full backdrop-blur-xs">
      <div className={'absolute! inset-0 z-11 bg-black/95'} />
      <div className={`animate-move-pattern absolute! inset-0 z-12 h-full w-full bg-size-[12rem] bg-center bg-repeat opacity-2`} style={{ backgroundImage: `url('${wavesPattern}')` }} />
      <div className="absolute! inset-0 z-13 h-full w-full bg-transparent p-8">
        <h1 className="border-default-white/50 mb-2 w-full border-b pb-1 text-3xl">{t('welcomeScreenTitle')}</h1>
        <p>{t('welcomeScreenDescription')}</p>
      </div>
    </AnimatedSection>
  )
}
