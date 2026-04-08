import { AnimatedSection, animate, getReadableBytesSize } from '@renderer/lib.exports'
import { useEffect, useMemo } from 'react'
import { useInstallPKGScreenState } from './InstallPKGScreen.state'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'

export function InstallPKGScreen() {
  const { t } = useTranslation()
  const { packageFolderName, resetInstallPKGScreenState, selectedPKG, setInstallPKGScreenState, thumbnailPath } = useInstallPKGScreenState(useShallow((x) => ({ selectedPKG: x.selectedPKG, resetInstallPKGScreenState: x.resetInstallPKGScreenState, setInstallPKGScreenState: x.setInstallPKGScreenState, packageFolderName: x.packageFolderName, thumbnailPath: x.thumbnailPath })))
  const disableButtons = useWindowState((x) => x.disableButtons)
  const active = useMemo(() => selectedPKG !== null, [selectedPKG])

  useEffect(() => {
    if (selectedPKG !== null) {
      setInstallPKGScreenState({ packageFolderName: selectedPKG.stat.folderName })
    }
  }, [selectedPKG])

  return (
    <AnimatedSection id="InstallPKGScreen" {...animate({ opacity: true })} condition={active} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      {selectedPKG !== null && (
        <>
          <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
            <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{selectedPKG.pkgType !== 'songPackage' ? t('installOfficialPackage') : t('installPackage')}</h1>
            <button
              disabled={disableButtons}
              className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                resetInstallPKGScreenState()
              }}
            >
              {t('goBack')}
            </button>
          </div>
          <div className="h-full w-full overflow-y-auto">
            <div className="flex-row!">
              <div className="mr-3">
                <img src={thumbnailPath || 'rbicons://custom'} className="h-48 min-h-48 w-48 min-w-48" />
              </div>
              <div className="w-full">
                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('pkgPath')}</h1>
                <p className="mb-4 font-mono text-xs">{selectedPKG.pkgPath}</p>
                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('pkgSize')}</h1>
                <p className="mb-4 font-mono text-xs">{getReadableBytesSize(selectedPKG.pkgSize)}</p>
                <h1 className="mb-0.5 text-xs text-gray-400 uppercase">{t('packageFolderName')}</h1>
                <p className='mb-2'>{t('packageFolderNameDesc')}</p>
                <input className="h-7 rounded-xs bg-neutral-900 px-2" value={packageFolderName} onChange={(ev) => setInstallPKGScreenState({ packageFolderName: ev.target.value })} />
                {/* <p>{JSON.stringify(selectedPKG.stat, null, 4)}</p> */}
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
