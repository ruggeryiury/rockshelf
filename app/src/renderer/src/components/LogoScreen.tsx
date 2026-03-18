import { animate, AnimatedSection } from '@renderer/lib.exports'
import { useLogoScreenState } from './LogoScreen.state'
import { useTranslation } from 'react-i18next'
import { APP_VERSION } from '@renderer/app/rockshelf'

export function LogoScreen() {
  const { t } = useTranslation()
  const active = useLogoScreenState((x) => x.active)
  return (
    <AnimatedSection id="LogoScreen" condition={active} {...animate({ opacityInit: true })} className='absolute! z-2 w-full h-full bg-neutral-800 items-center justify-center'>
      <h1 className='uppercase text-[3rem]'>{t('appTitle')}</h1>
      <p className='absolute! bottom-5'>{t('appVersion', { version: APP_VERSION })}</p>
    </AnimatedSection>
  )
}
