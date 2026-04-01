import { AnimatedSection, animate } from '@renderer/lib.exports'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useEffect, useMemo } from 'react'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'

export function PackageDetails() {
  const { t } = useTranslation()
  const packages = useWindowState((x) => x.packages)
  const selPKG = useMyPackagesScreenState((x) => x.selPKG)
  const catalog = useMyPackagesScreenState((x) => x.catalog)
  const active = useMemo(() => (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages ? packages.packages[selPKG] : null), [selPKG, packages])
  const setMyPackagesScreenState = useMyPackagesScreenState((x) => x.setMyPackagesScreenState)
  const disableButtons = useWindowState((x) => x.disableButtons)

  useEffect(
    function fetchCatalogObject() {
      const start = async () => {
        if (typeof packages === 'object' && selPKG > -1 && selPKG in packages.packages && catalog === false) {
          setMyPackagesScreenState({ catalog: 'loading' })
          const newCatalog = await window.api.getDTACatalog(selPKG)
          if (newCatalog.type === 'title' && import.meta.env.DEV) console.log('struct DTACatalogByTitleObject [core/src/lib/dta/getDTACatalog.ts]', newCatalog)
          setMyPackagesScreenState({ catalog: newCatalog })
        }
      }

      start()
    },
    [packages, selPKG, catalog]
  )

  return (
    <AnimatedSection id="PackageDetails" condition={active !== null && typeof catalog === 'object'} {...animate({ opacity: true })} className="absolute! z-5 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      {active !== null && typeof catalog === 'object' && (
        <>
          <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
            <img src={active.thumbnailSrc} className="mr-2 h-24 w-24" />

            <div className="mr-auto h-full">
              <h1 className="font-pentatonicalt! text-[2rem] uppercase">{active.packageData.packageName}</h1>
              <p>{t(active.songs.length === 1 ? 'songCount' : 'songCountPlural', { count: active.songs.length })}</p>
            </div>
            <button
              disabled={disableButtons}
              className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                setMyPackagesScreenState({ selPKG: -1, catalog: false })
              }}
            >
              {t('goBack')}
            </button>
          </div>

          <div className="h-full w-full overflow-y-auto">
            {catalog.type === 'title' &&
              catalog.headers.map(
                (header, headerI) =>
                  header.songsIndexes.length > 0 && (
                    <div className="mb-1 w-full flex-row! duration-150 last:mb-0" key={`titleHeader${headerI}`}>
                      <div className="w-full">
                        <div className="w-full flex-row! items-center rounded-sm bg-neutral-950 px-2 py-1 mb-1">
                          <h1 className="mr-auto text-xl">{header.name}</h1>
                          <p className="font-pentatonic uppercase">{t(header.songsIndexes.length === 1 ? 'songCount' : 'songCountPlural', { count: header.songsIndexes.length })}</p>
                        </div>
                        {header.songsIndexes.map((songI) => {
                          const song = active.songs[songI]
                          return (
                            <div className="flex-row! items-center w-full rounded-sm border-2 mb-0.5 last:mb-1 border-white/5 p-2 hover:bg-white/5" key={`song${songI}`}>
                              <h2 className='mr-2'>{song.name}</h2>
                              <h2 className="text-xs text-neutral-600 italic">{song.artist}</h2>{' '}
                            </div>
                          )
                        })}
                      </div>
                      <div className="h-full w-2" />
                    </div>
                  )

                // <div className="mb-1 w-full flex-row! duration-150 last:mb-0" key={`header${headerI}`} onClick={() => {}}>
                //   <div className="w-full rounded-sm border-2 border-white/5 p-2 hover:bg-white/5">
                //     <h2>{song.name}</h2>
                //     {/* <h2 className="text-xs text-neutral-600 italic">{song.artist}</h2> */}
                //   </div>
                //   <div className="h-full w-2" />
                // </div>
              )}
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
