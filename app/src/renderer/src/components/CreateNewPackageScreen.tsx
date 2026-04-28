import clsx from 'clsx'
import { animate, AnimatedDiv, AnimatedSection, getReadableBytesSize, TransComponent } from '@renderer/lib.exports'
import { useCreateNewPackageScreenState } from './CreateNewPackageScreen.state'
import { useShallow } from 'zustand/shallow'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { CREATE_NEW_PACKAGE_TABS } from '@renderer/app/rockshelf'
import { useMessageBoxState } from './MessageBox.state'
import { PlaystationIcon, XboxIcon } from '@renderer/assets/icons'
import { useEffect, useMemo } from 'react'
import type { SelectPackageFilesStatsTypes } from 'rockshelf-core'
import { useImageCropScreenState } from './ImageCropScreen.state'
import { useRBIconsSelectorState } from './RBIconsSelector.state'
import { useDeluxeInstallScreenState } from './DeluxeInstallScreen.state'

export function CreateNewPackageScreen() {
  const { t } = useTranslation()
  const { active, setCreateNewPackageScreenState, resetCreateNewPackageScreenState, navIndex, files, hoveredFile, packageName, packageFolderName, forceEncryption, addedSongsCount, packageArtwork } = useCreateNewPackageScreenState(useShallow((x) => ({ active: x.active, setCreateNewPackageScreenState: x.setCreateNewPackageScreenState, resetCreateNewPackageScreenState: x.resetCreateNewPackageScreenState, navIndex: x.navIndex, files: x.files, hoveredFile: x.hoveredFile, packageName: x.packageName, packageFolderName: x.packageFolderName, forceEncryption: x.forceEncryption, addedSongsCount: x.addedSongsCount, addedStarsCount: x.addedStarsCount, packageArtwork: x.packageArtwork })))
  const { disableButtons, setWindowState, rb3Stats } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState, rb3Stats: x.rb3Stats })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { setImageCropScreenState } = useImageCropScreenState(useShallow((x) => ({ setImageCropScreenState: x.setImageCropScreenState })))
  const { setRBIconsSelectorState } = useRBIconsSelectorState(useShallow((x) => ({ setRBIconsSelectorState: x.setRBIconsSelectorState })))
  const { setDeluxeInstallScreenState } = useDeluxeInstallScreenState(useShallow((x) => ({ setDeluxeInstallScreenState: x.setDeluxeInstallScreenState })))

  const isReadyToInstall = useMemo(() => packageName.length > 0 && packageFolderName.length > 0 && files.length > 0, [packageName, packageFolderName, files])

  useEffect(
    function changeDefaultForceEncryptionValues() {
      if (active && typeof rb3Stats === 'object') {
        if (rb3Stats.hasDeluxe) setCreateNewPackageScreenState({ forceEncryption: 'disabled' })
        else setCreateNewPackageScreenState({ forceEncryption: 'enabled' })
      }
    },
    [rb3Stats, active, setCreateNewPackageScreenState]
  )

  return (
    <AnimatedSection id="CreateNewPackageScreen" condition={active} {...animate({ opacity: true })} className="absolute! z-3 h-full max-h-full w-full max-w-full bg-black/90 p-8 backdrop-blur-lg">
      <div className="mb-2 flex-row! border-b border-white/25 pb-1">
        <img src={packageArtwork ?? 'rbicons://custom'} className="mr-2 h-32 min-h-32 w-32 min-w-32 border-2 border-neutral-700" />
        <div className="mr-auto">
          <h1 className="font-pentatonicalt! mr-auto text-[2rem] uppercase">{t('createNewPackage')}</h1>
          <h2 className="font-pentatonic h-6">{packageName}</h2>
          <h2 className="font-pentatonic uppercase">{t(files.length === 1 ? 'fileCount' : 'fileCountPlural', { count: files.length })}</h2>
          <h2 className="font-pentatonic uppercase">{t(addedSongsCount === 1 ? 'songsCount' : 'songsCountPlural', { count: addedSongsCount })}</h2>
        </div>
        <div className="absolute! right-0 flex-row!">
          <button
            disabled={disableButtons || !isReadyToInstall}
            className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              setWindowState({ disableButtons: true })
              try {
                const results = await window.api.createNewPackage({ packages: files.map((file) => file.data.path.path), packageFolderName, packageName, forceEncryption, thumbnail: packageArtwork })
                console.log('struct SerializedRPCS3PackageExtractionObject [core/src/controllers/createNewPackage.ts]', results)
                if (results) {
                  console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', results.packagesData)
                  setWindowState({ packages: results.packagesData })
                }
              } catch (err) {
                if (err instanceof Error) setWindowState({ err })
              }
              setWindowState({ disableButtons: false })
            }}
          >
            {t('create')}
          </button>
          <button
            disabled={disableButtons}
            className="w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
            onClick={async () => {
              resetCreateNewPackageScreenState()
            }}
          >
            {t('goBack')}
          </button>
        </div>
      </div>

      <div className="mb-2 h-6 min-h-6 w-full flex-row! items-center rounded-b-sm bg-white/15 px-4">
        <button
          disabled={disableButtons}
          className={clsx(navIndex === CREATE_NEW_PACKAGE_TABS.FILES ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setCreateNewPackageScreenState({ navIndex: CREATE_NEW_PACKAGE_TABS.FILES })
          }}
        >
          {t('files')}
        </button>
        <button
          disabled={disableButtons}
          className={clsx(navIndex === CREATE_NEW_PACKAGE_TABS.OPTIONS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setCreateNewPackageScreenState({ navIndex: CREATE_NEW_PACKAGE_TABS.OPTIONS })
          }}
        >
          {t('options')}
        </button>
        {/* <button
          disabled={disableButtons}
          className={clsx(navIndex === CREATE_NEW_PACKAGE_TABS.OPTIONS ? 'bg-yellow-500 text-black/90 hover:bg-yellow-400 active:bg-yellow-300' : 'hover:text-neutral-300 active:text-neutral-200', 'h-full w-fit justify-center px-2 duration-200')}
          onClick={() => {
            setCreateNewPackageScreenState({ navIndex: CREATE_NEW_PACKAGE_TABS.OPTIONS })
          }}
        >
          {t('updateAllSongs')}
        </button> */}
      </div>
      {navIndex === CREATE_NEW_PACKAGE_TABS.FILES && (
        <>
          <div className="mb-4 w-full flex-row! items-center rounded-sm border border-neutral-900 bg-neutral-800 px-3 py-1">
            <button
              disabled={disableButtons}
              className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              onClick={async () => {
                setWindowState({ disableButtons: true })
                try {
                  const selFiles = await window.api.selectPackageFiles(files)
                  console.log('struct SelectPackageFilesObject ["core/src/controllers/selectPackageFiles.ts"]:', selFiles)

                  if (selFiles) {
                    const { selectedFiles, ignoredFiles, duplicatedFiles } = selFiles

                    if (ignoredFiles.length === 0 && duplicatedFiles.length === 0) {
                      setMessageBoxState({ message: { type: 'info', code: `selectPackageFilesPackagesAdded${selectedFiles.length === 1 ? '' : 'Plural'}`, messageValues: { selectedFiles: selectedFiles.length } } })
                    } else if (selectedFiles.length > 0 && (ignoredFiles.length > 0 || duplicatedFiles.length > 0)) {
                      if (ignoredFiles.length === selectedFiles.length) setMessageBoxState({ message: { type: 'warn', code: `selectPackageFilesAllIgnored${selectedFiles.length === 1 ? '' : 'Plural'}` } })
                      else if (duplicatedFiles.length === selectedFiles.length) setMessageBoxState({ message: { type: 'warn', code: `selectPackageFilesAllDuplicated${selectedFiles.length === 1 ? '' : 'Plural'}` } })
                      else if (selectedFiles.length === ignoredFiles.length + duplicatedFiles.length) setMessageBoxState({ message: { type: 'warn', code: `selectPackageFilesAllIgnoredOrDuplicated` } })
                      else setMessageBoxState({ message: { type: 'warn', code: `selectPackageFilesSomeIgnoredOrDuplicated`, messageValues: { addedFiles: selectedFiles.length - (ignoredFiles.length + duplicatedFiles.length), ignoredFiles: ignoredFiles.length, duplicatedFiles: duplicatedFiles.length } } })
                    }
                    setCreateNewPackageScreenState((oldState) => {
                      return { files: selFiles.stats, addedSongsCount: oldState.addedSongsCount + selFiles.addedSongsCount, addedStarsCount: oldState.addedStarsCount + selFiles.addedStarsCount }
                    })
                  }
                } catch (err) {
                  if (err instanceof Error) setWindowState({ err })
                }
                setWindowState({ disableButtons: false })
              }}
            >
              {t('addPackageFiles')}
            </button>
          </div>

          <div className="h-full w-full overflow-y-auto">
            {files.map((file, fileIndex) => {
              {
                return (
                  <div className="flex-row!" key={`packageFile${fileIndex}__${file.type === 'pkg' ? file.data.contentID : file.data.contentsHash}`}>
                    <div
                      className="group mb-1 w-full flex-row! rounded-sm border-2 border-white/5 p-2 duration-150 last:mb-0 hover:bg-white/5 active:bg-white/10"
                      onMouseOver={() => setCreateNewPackageScreenState({ hoveredFile: fileIndex })}
                      onMouseLeave={() => setCreateNewPackageScreenState({ hoveredFile: -1 })}
                      // onClick={() => {
                      //   setWindowState({ disableButtons: true })
                      //   setMyPackagesScreenState({ selPKG: packageI })
                      //   setWindowState({ disableButtons: false })
                      // }}
                    >
                      <div className="roundedx-xs mr-4 h-fit w-16 min-w-16 flex-row! items-start justify-center bg-neutral-900 py-1 duration-150 group-hover:bg-neutral-800">
                        {file.type === 'stfs' ? <XboxIcon className="mr-1 text-lg" /> : <PlaystationIcon className="mr-1 text-xl" />}
                        <h1 className="top-0.2 relative!">{file.type === 'stfs' ? 'CON' : 'PKG'}</h1>
                      </div>
                      <div className="w-full">
                        <div className="mb-1 flex-row! items-start border-b-2 border-white/10 pb-1">
                          <h1 className="mr-auto text-xl">{file.data.path.name}</h1>
                          <AnimatedDiv condition={hoveredFile === fileIndex}>
                            <button
                              className="mr-2 mb-1 w-full self-start rounded-xs border border-red-500 bg-neutral-900 px-1 py-0.5 text-[0.65rem]! text-red-500 uppercase duration-100 last:mr-0 last:mb-0 hover:bg-red-950/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                              onClick={(ev) => {
                                ev.stopPropagation()
                                setCreateNewPackageScreenState((oldState) => {
                                  const oldFiles: SelectPackageFilesStatsTypes[] = [...oldState.files]
                                  const pkg = oldFiles.splice(fileIndex, 1)[0]
                                  return {
                                    addedSongsCount: oldState.addedSongsCount - pkg.data.dta.length,
                                    addedStarsCount: oldState.addedStarsCount - pkg.data.dta.length * 5,
                                    files: oldFiles,
                                  }
                                })
                              }}
                            >
                              {t('remove')}
                            </button>
                          </AnimatedDiv>
                        </div>
                        {/* <p className="font-pentatonic mb-1 w-full pb-1 text-xl"></p> */}
                        <p className="text-xs italic">{getReadableBytesSize(file.data.fileSize)}</p>
                      </div>
                    </div>
                    <div className="h-full w-2" />
                  </div>
                )
              }
            })}
          </div>
        </>
      )}
      {navIndex === CREATE_NEW_PACKAGE_TABS.OPTIONS && (
        <>
          <div className="h-full w-full overflow-y-auto">
            <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
              <h1 className="mb-1 uppercase">{t('packageName')}</h1>
              <p className="mb-4 text-xs italic">
                <TransComponent i18nKey="packageNameDesc" />
              </p>
              <input className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" value={packageName} onChange={(ev) => setCreateNewPackageScreenState({ packageName: ev.target.value })} minLength={1} maxLength={64} />
            </div>

            <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
              <h1 className="mb-1 uppercase">{t('packageFolderName')}</h1>
              <p className="mb-4 text-xs italic">
                <TransComponent i18nKey="packageFolderNameDesc" />
              </p>
              <input className="mb-1 rounded-xs border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-sm! duration-100 last:mb-0 hover:bg-neutral-700 focus:border-white/25 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900" value={packageFolderName} onChange={(ev) => setCreateNewPackageScreenState({ packageFolderName: ev.target.value })} minLength={1} maxLength={64} />
            </div>

            <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
              <h1 className="mb-1 uppercase">{t('packageThumbnail')}</h1>
              <p className="mb-4 text-xs italic">
                <TransComponent i18nKey="changePackageThumbnailDesc" />
              </p>
              <div className="flex-row! items-center">
                <button
                  disabled={disableButtons}
                  className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    setWindowState({ disableButtons: true })
                    try {
                      const imgStats = await window.api.loadImageForCrop()
                      if (imgStats) {
                        setImageCropScreenState({ imgPath: imgStats.path, imgDataURL: imgStats.dataURL, func: 'createNewPackage' })
                        setMessageBoxState({ message: null })
                      }
                    } catch (err) {
                      if (err instanceof Error) setWindowState({ err })
                    }
                    setWindowState({ disableButtons: false })
                  }}
                >
                  {t('selectImgFile')}
                </button>
                <button
                  disabled={disableButtons}
                  className="mr-2 w-fit self-start rounded-xs border border-neutral-700 bg-neutral-900 px-1 py-0.5 text-xs! uppercase duration-100 last:mr-0 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
                  onClick={async () => {
                    setRBIconsSelectorState({ active: 'createNewPackage' })
                  }}
                >
                  {t('selectRBIcons')}
                </button>
              </div>
            </div>

            <div className="group rounded-xs p-2 duration-200 last:mb-0 hover:bg-white/5">
              <h1 className="mb-1 uppercase">{t('forceEncDec')}</h1>
              <p className="mb-4 text-xs italic">
                <TransComponent i18nKey="packageEncryptionDesc" />
              </p>
              <div className="w-fit flex-row! items-center">
                <button
                  disabled={disableButtons}
                  className={clsx('rounded-l-xs border-y border-l border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', forceEncryption === 'enabled' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                  onClick={() => {
                    setCreateNewPackageScreenState({ forceEncryption: 'enabled' })
                  }}
                >
                  {t('encrypted')}
                </button>
                <button
                  disabled={disableButtons}
                  className={clsx('rounded-r-xs border-y border-r border-neutral-800 px-2 py-1 text-xs! uppercase duration-200', forceEncryption === 'disabled' ? 'bg-neutral-400 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-200' : 'bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-700')}
                  onClick={() => {
                    setCreateNewPackageScreenState({ forceEncryption: 'disabled' })
                  }}
                >
                  {t('decrypted')}
                </button>
              </div>

              <AnimatedDiv condition={forceEncryption === 'enabled' && typeof rb3Stats === 'object' && rb3Stats.hasDeluxe} {...animate({ opacity: true, height: true, scaleY: true })} className="origin-top">
                <div className="h-2 w-full" />
                <p className="text-xs text-yellow-500 italic">{t('unnecessaryEncForDeluxe')}</p>
              </AnimatedDiv>
              <AnimatedDiv condition={forceEncryption === 'disabled' && typeof rb3Stats === 'object' && !rb3Stats.hasDeluxe} {...animate({ opacity: true, height: true, scaleY: true })} className="origin-top">
                <div className="h-2 w-full" />
                <p className="text-xs text-yellow-500 italic">{t('necessaryEncForVanilla')}</p>
              </AnimatedDiv>
            </div>
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
