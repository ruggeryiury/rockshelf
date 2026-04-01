import { AnimatedDiv, AnimatedP, AnimatedSection, animate } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { PackageDetails } from './PackageDetails'
import { RPCS3SongPackagesDataExtra } from 'rockshelf-core'

export function MyPackagesScreen() {
  const { t } = useTranslation()
  const active = useMyPackagesScreenState((x) => x.active)
  const resetMyPackagesScreenState = useMyPackagesScreenState((x) => x.resetMyPackagesScreenState)
  const setMyPackagesScreenState = useMyPackagesScreenState((x) => x.setMyPackagesScreenState)
  const disableButtons = useWindowState((x) => x.disableButtons)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const packages = useWindowState((x) => x.packages)

  return (
    <>
      <AnimatedSection id="MyPackagesScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
        <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
          <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('myPackages')}</h1>
          <button
            disabled={disableButtons}
            className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              resetMyPackagesScreenState()
            }}
          >
            {t('goBack')}
          </button>
          <button
            disabled={disableButtons}
            className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              setWindowState({ disableButtons: true, packages: 'loading' })
              let newPackages: RPCS3SongPackagesDataExtra | false = false
              try {
                newPackages = await window.api.refreshPackagesData()
                console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', newPackages)
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
              setWindowState({ disableButtons: false, packages: newPackages })
            }}
          >
            {t('refresh')}
          </button>
        </div>
        <div className="h-full w-full overflow-y-auto">
          <AnimatedP condition={packages === 'loading'} {...animate({ opacity: true, duration: 0.1 })} className="absolute! pt-2 pl-2 text-xs">
            {t('loadingPackagesData')}
          </AnimatedP>
          <AnimatedDiv condition={typeof packages === 'object'} {...animate({ opacity: true, duration: 0.1 })} className="overflow-y-auto">
            {typeof packages === 'object' && (
              <>
                {packages.packages.map((pkg, packageI) => {
                  return (
                    <div className="flex-row!" key={`package__${pkg.contentsHash}`}>
                      <div
                        className="mb-1 w-full flex-row! rounded-sm border-2 border-white/5 p-2 duration-150 last:mb-0 hover:bg-white/5"
                        onClick={() => {
                          setMyPackagesScreenState({ selPKG: packageI })
                        }}
                      >
                        <img src={pkg.thumbnailSrc} className="mr-2 w-16 min-w-16" />
                        <div>
                          <h2 className="text-base font-bold">{pkg.packageData.packageName}</h2>
                          <h3 className="text-xs text-neutral-700">{t(pkg.songs.length === 1 ? 'songCount' : 'songCountPlural', { count: pkg.songs.length })}</h3>
                        </div>
                      </div>
                      <div className="h-full w-2" />
                    </div>
                  )
                })}
              </>
            )}
          </AnimatedDiv>
        </div>
      </AnimatedSection>
      <PackageDetails />
    </>
  )
}
