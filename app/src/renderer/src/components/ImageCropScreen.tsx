import { AnimatedSection, animate } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'
import { useImageCropScreenState } from './ImageCropScreen.state'
import Cropper from 'react-easy-crop'
import { useState } from 'react'
import { useMyPackagesScreenState } from './MyPackagesScreen.state'
import { useMessageBoxState } from './MessageBox.state'
import { useCreateNewPackageScreenState } from './CreateNewPackageScreen.state'

export function ImageCropScreen() {
  const { t } = useTranslation()
  const { disableButtons, setWindowState } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState })))
  const { resetImageCropScreenState, imgPath, imgDataURL, setImageCropScreenState, imgCropOptions, func } = useImageCropScreenState(useShallow((x) => ({ resetImageCropScreenState: x.resetImageCropScreenState, imgPath: x.imgPath, imgDataURL: x.imgDataURL, setImageCropScreenState: x.setImageCropScreenState, imgCropOptions: x.imgCropOptions, func: x.func })))
  const { selPKG } = useMyPackagesScreenState(useShallow((x) => ({ selPKG: x.selPKG })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { setCreateNewPackageScreenState } = useCreateNewPackageScreenState(useShallow((x) => ({ setCreateNewPackageScreenState: x.setCreateNewPackageScreenState })))
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  return (
    <AnimatedSection id="ImageCropScreen" condition={imgPath !== null && imgDataURL !== null} {...animate({ opacity: true })} className="absolute! z-10 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      {imgPath !== null && imgDataURL !== null && (
        <>
          <div className="mb-2 flex-row! items-center border-b border-white/25 pb-1">
            <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('cropImage')}</h1>
            <button
              disabled={disableButtons}
              className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                setWindowState({ disableButtons: true })
                setMessageBoxState({ message: { type: 'loading', method: 'image', code: 'processing' } })
                if (func === 'packageDetails') {
                  try {
                    if (imgCropOptions) {
                      const newPackages = await window.api.editPackageData(selPKG, { imgPath, imgCropOptions })
                      console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', newPackages)

                      if (newPackages) setWindowState({ packages: newPackages, disableImg: selPKG })
                      setMessageBoxState({ message: { type: 'success', method: 'editPackageImage', code: '' } })
                      resetImageCropScreenState()
                    }
                  } catch (err) {
                    if (err instanceof Error) setWindowState({ err })
                  }
                } else if (func === 'createNewPackage') {
                  try {
                    if (imgCropOptions) {
                      setCreateNewPackageScreenState({ packageArtwork: `rbicons://custom` })
                      await window.api.cropImageAndSaveToTemp({ imgPath, imgCropOptions, name: 'thumbnail' })
                      setCreateNewPackageScreenState({ packageArtwork: `tempjpg://thumbnail` })
                      setMessageBoxState({ message: { type: 'success', method: 'editPackageImage', code: '' } })
                      resetImageCropScreenState()
                    }
                  } catch (err) {
                    if (err instanceof Error) setWindowState({ err })
                  }
                } else setMessageBoxState({ message: { type: 'error', method: 'imageCrop', code: 'noFunc' } })
                setWindowState({ disableButtons: false })
              }}
            >
              {t('save')}
            </button>
            <button
              disabled={disableButtons}
              className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                resetImageCropScreenState()
              }}
            >
              {t('cancel')}
            </button>
          </div>
          <div className="h-full w-full overflow-y-auto">
            <Cropper
              image={imgDataURL}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onCropComplete={(_, croppedAreaPixels) => {
                console.log('struct CroppedArea:', croppedAreaPixels)
                setImageCropScreenState({ imgCropOptions: croppedAreaPixels })
              }}
              onZoomChange={setZoom}
            />
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
