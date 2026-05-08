import { animate, AnimatedDiv, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useLogoScreenState } from './LogoScreen.state'
import { useTranslation } from 'react-i18next'
import { APP_VERSION } from '@renderer/app/rockshelf.globals'
import { LoadingIcon } from '@renderer/assets/icons'
import { useShallow } from 'zustand/shallow'

export function LogoScreen() {
  const { t } = useTranslation()
  const { active, showText } = useLogoScreenState(useShallow((x) => ({ active: x.active, showText: x.showText })))
  return (
    <AnimatedSection id="LogoScreen" condition={active} {...animate({ opacityInit: true })} className="absolute! z-2 h-full w-full items-center justify-center bg-neutral-800">
      <h1 className="text-[4rem] uppercase">{t('appTitle')}</h1>
      <AnimatedDiv condition={showText} {...animate({ opacity: true, height: true, scaleY: true })}>
        <div className="h-3"></div>
        <div className="flex-row! items-center">
          <LoadingIcon className="mr-2 animate-spin" />
          <p>
            <TransComponent i18nKey="loadingRockshelfText" />
          </p>
        </div>
      </AnimatedDiv>
      <p className="absolute! bottom-5">{t('appVersion', { version: APP_VERSION })}</p>
    </AnimatedSection>
  )
}
