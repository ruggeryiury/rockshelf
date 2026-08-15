import { AnimatedDiv, AnimatedSection, animate } from '@renderer/lib.exports'
import { useRBIconsSelectorState } from './RBIconsSelector.state'
import { useShallow } from 'zustand/shallow'
import { useTranslation } from 'react-i18next'
import { useWindowState } from '@renderer/stores/Window.state'
import clsx from 'clsx'
import { useMessageBoxState } from './MessageBox.state'
import { useCreateNewPackageScreenState } from './CreateNewPackageScreen.state'
import { STRUCT_LOG } from '@renderer/app/rockshelf.globals'
import { usePackageDetailsState } from './PackageDetails.state'

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

const rbIcons: string[] = ['rb1-green', 'rb1-red', 'rb1-yellow', 'rb1', 'rb1-orange']
const rbDLCIcons: string[] = [
  'rb1-2',
  ...(() => {
    const dlcNames: string[] = []
    for (let i = 2; i < 16; i++) dlcNames.push(`rb1-2-${i}`)
    return dlcNames
  })(),
]
const rb2Icons: string[] = ['rb2', 'rb2-cyan', 'rb2-hot', 'rb2-mustard', 'rb2-ocean', 'rb2-pink', 'rb2-red', 'rb2-terrain', 'rb2-tropical']
const rb3Icons: string[] = ['rb3-green', 'rb3-red', 'rb3-yellow', 'rb3', 'rb3-orange']

export function RBIconsSelector() {
  const { t } = useTranslation()

  const { pkgIndex } = usePackageDetailsState(useShallow((x) => ({ pkgIndex: x.pkgIndex })))
  const { active, resetRBIconsSelectorState, selIcon, selCollection, setRBIconsSelectorState } = useRBIconsSelectorState(useShallow((x) => ({ active: x.active, resetRBIconsSelectorState: x.resetRBIconsSelectorState, selIcon: x.selIcon, selCollection: x.selCollection, setRBIconsSelectorState: x.setRBIconsSelectorState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { setCreateNewPackageScreenState } = useCreateNewPackageScreenState(useShallow((x) => ({ setCreateNewPackageScreenState: x.setCreateNewPackageScreenState })))
  return (
    <AnimatedSection id="RBIconsSelector" condition={active !== null} {...animate({ opacity: true })} className="absolute! z-15 h-full max-h-full w-full max-w-full bg-black p-8">
      <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
        <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('selectRBIcons')}</h1>
        <AnimatedDiv condition={selIcon > -1} {...animate({ opacity: true })} className="mr-2 self-start">
          <button
            disabled={disableButtons}
            className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              setWindowState({ disableButtons: true })

              setMessageBoxState({ message: { type: 'loading', code: 'rbIconsSelector' } })
              let rbIconURL = `rbicons://`

              switch (selCollection) {
                case 'rb1':
                default:
                  rbIconURL += rbIcons[selIcon]
                  break
                case 'rbdlc':
                  rbIconURL += rbDLCIcons[selIcon]
                  break
                case 'rb2':
                  rbIconURL += rb2Icons[selIcon]
                  break
                case 'rb3':
                  rbIconURL += rb3Icons[selIcon]
                  break
              }

              if (active === 'editPackage') {
                try {
                  const newPackages = await window.api.data.editPackage(pkgIndex, { imgPath: rbIconURL })
                  if (STRUCT_LOG) console.log('struct LightRB3SongPackagesData ["core/api/DataSyncAPI.ts"]:', newPackages)

                  if (newPackages) setWindowState({ packages: newPackages, disableImg: pkgIndex })
                  setMessageBoxState({ message: { type: 'success', code: 'editPackageImage' } })
                  resetRBIconsSelectorState()
                } catch (err) {
                  if (err instanceof Error) setWindowState({ err })
                }
              } else if (active === 'createNewPackage') {
                const newArtwork = await window.api.img.cropAndSaveToTemp(rbIconURL)
                setMessageBoxState({ message: { type: 'success', code: 'editPackageImage' } })
                resetRBIconsSelectorState()
                setCreateNewPackageScreenState({ packageArtwork: `temp://${newArtwork.fullname}` })
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
        <h1 className="mb-1 text-2xl uppercase">Rock Band</h1>
        <div className="mb-2 flex-row! flex-wrap gap-2 last:mb-0">
          {rbIcons.map((icon, iconIndex) => {
            return (
              <img
                key={`icon_${icon}`}
                src={`rbicons://${icon}`}
                className={clsx(selIcon === iconIndex && selCollection === 'rb1' ? '' : 'border-transparent', 'h-16 min-h-16 w-16 min-w-16 border-2')}
                onClick={async () => {
                  setRBIconsSelectorState({ selIcon: iconIndex, selCollection: 'rb1' })
                }}
              />
            )
          })}
        </div>
        <h1 className="mb-1 text-2xl uppercase">Rock Band DLC</h1>
        <div className="mb-2 flex-row! flex-wrap gap-2 last:mb-0">
          {rbDLCIcons.map((icon, iconIndex) => {
            return (
              <img
                key={`icon_${icon}`}
                src={`rbicons://${icon}`}
                className={clsx(selIcon === iconIndex && selCollection === 'rbdlc' ? '' : 'border-transparent', 'h-16 min-h-16 w-16 min-w-16 border-2')}
                onClick={async () => {
                  setRBIconsSelectorState({ selIcon: iconIndex, selCollection: 'rbdlc' })
                }}
              />
            )
          })}
        </div>
        <h1 className="mb-1 text-2xl uppercase">Rock Band 2</h1>
        <div className="mb-2 flex-row! flex-wrap gap-2 last:mb-0">
          {rb2Icons.map((icon, iconIndex) => {
            return (
              <img
                key={`icon_${icon}`}
                src={`rbicons://${icon}`}
                className={clsx(selIcon === iconIndex && selCollection === 'rb2' ? '' : 'border-transparent', 'h-16 min-h-16 w-16 min-w-16 border-2')}
                onClick={async () => {
                  setRBIconsSelectorState({ selIcon: iconIndex, selCollection: 'rb2' })
                }}
              />
            )
          })}
        </div>
        <h1 className="mb-1 text-2xl uppercase">Rock Band 3</h1>
        <div className="mb-2 flex-row! flex-wrap gap-2 last:mb-0">
          {rb3Icons.map((icon, iconIndex) => {
            return (
              <img
                key={`icon_${icon}`}
                src={`rbicons://${icon}`}
                className={clsx(selIcon === iconIndex && selCollection === 'rb3' ? '' : 'border-transparent', 'h-16 min-h-16 w-16 min-w-16 border-2')}
                onClick={async () => {
                  setRBIconsSelectorState({ selIcon: iconIndex, selCollection: 'rb3' })
                }}
              />
            )
          })}
        </div>
      </div>
    </AnimatedSection>
  )
}
