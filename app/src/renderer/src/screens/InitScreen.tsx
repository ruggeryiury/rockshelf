import { useTranslation } from 'react-i18next'
import { APP_VERSION } from '@renderer/app/rockshelf'
import { LoadingIcon } from '@renderer/assets/icons'
import { animate, AnimatedDiv, AnimatedSection, TransComponent } from '@renderer/lib.exports'
import { useInitScreenState } from '@renderer/stores/InitScreen.store'

export function InitScreen() {
  const { t } = useTranslation()

  const isActivated = useInitScreenState((x) => x.InitScreen)
  const loadingTextKey = useInitScreenState((x) => x.loadingTextKey)
  const isLoadingTextActivated = useInitScreenState((x) => x.isLoadingTextActivated)

  return (
    <AnimatedSection id="InitScreenLogo" condition={isActivated} className="absolute! h-full w-full items-center justify-center bg-neutral-900 z-5" {...animate({opacityInit: true})}>
      <h1 className="text-[3rem] leading-tight uppercase">{t('appTitle')}</h1>
      <AnimatedDiv className="items-center" condition={isLoadingTextActivated} {...animate({ height: true, scaleY: true, opacity: true })}>
        <div className="h-2 w-full" />
        <div className="flex-row! items-center">
          <LoadingIcon className="mr-2 animate-spin" />
          <p>
            <TransComponent i18nKey={loadingTextKey} />
          </p>
        </div>
      </AnimatedDiv>
      <p className="absolute! bottom-3">{t('versionText', { appVer: APP_VERSION })}</p>
    </AnimatedSection>
  )
}
