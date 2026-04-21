import { AnimatedDiv, AnimatedSection, animate } from '@renderer/lib.exports'
import { useRBIconsSelectorState } from './RBIconsSelector.state'
import { useShallow } from 'zustand/shallow'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/stores/Window.state'
import clsx from 'clsx'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useMessageBoxState } from './MessageBox.state'
import { useCreateNewPackageScreenState } from './CreateNewPackageScreen.state'

const allIcons: string[] = [
  'custom',
  'dx',
  'gdrb',
  'lego-instr-icons',
  'lego',
  'rb1-2',
  ...(() => {
    const dlcNames: string[] = []
    for (let i = 2; i < 16; i++) dlcNames.push(`rb1-2-${i}`)
    return dlcNames
  })(),
  'rb1',
  'rb2',
  'rb3',
  'rb4',
  'rb4r',
  'rbb',
  'rbn',
  'tbrb',
  'website',
]

export function RBIconsSelector() {
  const { t } = useTranslation()

  const { selPKG } = useMyPackagesScreenState(useShallow((x) => ({ selPKG: x.selPKG, catalog: x.catalog, setMyPackagesScreenState: x.setMyPackagesScreenState, catalogSortBy: x.catalogSortBy, packageDetailsTab: x.packageDetailsTab, editPackageName: x.editPackageName, editPackageEdited: x.editPackageEdited })))
  const { active, resetRBIconsSelectorState, selIcon, setRBIconsSelectorState } = useRBIconsSelectorState(useShallow((x) => ({ active: x.active, resetRBIconsSelectorState: x.resetRBIconsSelectorState, selIcon: x.selIcon, setRBIconsSelectorState: x.setRBIconsSelectorState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { setCreateNewPackageScreenState } = useCreateNewPackageScreenState(useShallow((x) => ({ setCreateNewPackageScreenState: x.setCreateNewPackageScreenState })))
  return (
    <AnimatedSection id="RBIconsSelector" condition={active !== null} {...animate({ opacity: true })} className="absolute! z-15 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('selectRBIcons')}</h1>
        <AnimatedDiv condition={selIcon > -1} {...animate({ opacity: true })} className="mr-2 self-start">
          <button
            disabled={disableButtons}
            className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              setWindowState({ disableButtons: true })

              setMessageBoxState({ message: { type: 'loading', method: 'rbIconsSelector', code: '' } })
              const rbIconURL = `rbicons://${allIcons[selIcon]}`
              if (active === 'editPackage') {
                try {
                  const newPackages = await window.api.editPackageData(selPKG, { imgPath: rbIconURL })
                  console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', newPackages)

                  if (newPackages) setWindowState({ packages: newPackages, disableImg: selPKG })
                  setMessageBoxState({ message: { type: 'success', method: 'editPackageImage', code: '' } })
                  resetRBIconsSelectorState()
                } catch (err) {
                  if (err instanceof Error) setWindowState({ err })
                }
              } else if (active === 'createNewPackage') {
                setCreateNewPackageScreenState({ packageArtwork: `rbicons://custom` })
                await window.api.cropImageAndSaveToTemp({ imgPath: rbIconURL, name: 'thumbnail' })
                setMessageBoxState({ message: { type: 'success', method: 'editPackageImage', code: '' } })
                resetRBIconsSelectorState()
                setCreateNewPackageScreenState({ packageArtwork: `tempjpg://thumbnail` })
              }
              setWindowState({ disableButtons: false })
            }}
          >
            {t('select')}
          </button>
        </AnimatedDiv>
        <button
          disabled={disableButtons}
          className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
          onClick={async () => {
            resetRBIconsSelectorState()
          }}
        >
          {t('cancel')}
        </button>
      </div>
      <div className="h-full w-full overflow-x-hidden overflow-y-auto">
        <div className="flex-row! flex-wrap gap-2">
          {allIcons.map((icon, iconIndex) => {
            return (
              <img
                key={`icon_${icon}`}
                src={`rbicons://${icon}`}
                className={clsx(selIcon === iconIndex ? '' : 'border-transparent', 'h-24 min-h-24 w-24 min-w-24 border-2')}
                onClick={async () => {
                  setRBIconsSelectorState({ selIcon: iconIndex })
                }}
              />
            )
          })}
        </div>
      </div>
    </AnimatedSection>
  )
}
