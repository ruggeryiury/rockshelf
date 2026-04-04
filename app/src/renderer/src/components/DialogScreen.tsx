import { animate, AnimatedSection } from '@renderer/lib.exports'
import { useDialogScreenState } from './DialogScreen.state'
import { useTranslation } from 'react-i18next'
import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { useWindowState } from '@renderer/stores/Window.state'

function DialogButton({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx('rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! uppercase duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900', className)} {...props}>
      {children}
    </button>
  )
}

export function DialogScreen() {
  const { t } = useTranslation()
  const active = useDialogScreenState((x) => x.active)
  const setDialogScreenState = useDialogScreenState((x) => x.setDialogScreenState)
  const disableButtons = useWindowState((x) => x.disableButtons)
  const packages = useWindowState((x) => x.packages)
  const setWindowState = useWindowState((x) => x.setWindowState)

  return (
    <AnimatedSection id="DialogScreen" condition={active !== null} {...animate({ opacity: true })} className="absolute! z-100 h-full w-full items-center justify-center bg-black/90 p-16 backdrop-blur-lg">
      {active !== null && (
        <>
          <h1 className="mb-2 text-center text-[2rem] uppercase">{t(`${active}Title`)}</h1>
          <p className="text-center">{t(`${active}Text`)}</p>
        </>
      )}
      <div className="mt-8 flex-row! items-center">
        {(() => {
          if (active?.startsWith('corruptedUserConfig')) {
            return (
              <DialogButton
                onClick={async () => {
                  setWindowState({ disableButtons: true })
                  try {
                    await window.api.deleteUserConfigAndRestart()
                  } catch (err) {
                    if (err instanceof Error) setWindowState({ err })
                  }
                }}
                disabled={disableButtons}
              >
                {t('deleteUserConfigData')}
              </DialogButton>
            )
          } else if (active?.startsWith('corruptedPackagesCache')) {
            return (
              <DialogButton
                onClick={async () => {
                  setWindowState({ disableButtons: true })
                  try {
                    const newPackagesData = await window.api.rpcs3GetPackagesData(true)
                    setDialogScreenState({ active: null })
                    setWindowState({ packages: newPackagesData, disableButtons: false })
                  } catch (err) {
                    if (err instanceof Error) setWindowState({ err })
                  }
                }}
                disabled={disableButtons}
              >
                {t('recreatePackagesCacheFile')}
              </DialogButton>
            )
          } else if (active?.startsWith('parsingErrorsOnPackagesDTA')) {
            return (
              <div className="items-center">
                {typeof packages === 'object' && (
                  <>
                    <h2 className="mb-2">{t('affectedPackages')}</h2>
                    {packages.parsingErrors.length > 0 &&
                      packages.parsingErrors.map((packagePath, packagePathI) => {
                        return (
                          <p className="mb-2 bg-neutral-950 px-2 py-1 font-mono" key={`parsingErrorPath${packagePathI}`}>
                            {packagePath}
                          </p>
                        )
                      })}
                  </>
                )}
                <div className="mt-4 flex-row! items-center">
                  <DialogButton
                    onClick={async () => {
                      setDialogScreenState({ active: null })
                    }}
                    disabled={disableButtons}
                  >
                    {t('ok')}
                  </DialogButton>
                </div>
              </div>
            )
          } else return null
        })()}
      </div>
    </AnimatedSection>
  )
}
