import { ExeFileIcon, LoadingIcon, OpenFolderIcon } from '@renderer/assets/icons'
import { ModalGenericBG } from '@renderer/components'
import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionButton, MotionDiv } from '@renderer/lib/motion'
import { TransComponent } from '@renderer/lib/transComponents'
import { useConfigState } from '@renderer/states/config'
import { useWindowState } from '@renderer/states/window'
import { UserConfig } from '@rockshelf/core'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export function FirstTimeModal() {
  const { t } = useTranslation()
  const [introDevHDD0Folder, setIntroDevHDD0Folder] = useState('')
  const [introRPCS3File, setIntroRPCS3File] = useState('')
  const [isBrowsingDevhdd0, setIsBrowsingDevhdd0] = useState(false)
  const [isBrowsingRPCS3Exe, setIsBrowsingRPCS3Exe] = useState(false)

  const disableButtons = useWindowState((x) => x.disableButtons)
  const isFirstTimeModalActivated = useWindowState((x) => x.isFirstTimeModalActivated)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setConfigState = useConfigState((x) => x.setConfigState)
  return (
    <ModalGenericBG id="FirstTimeModal" condition={isFirstTimeModalActivated} animation={genAnimation({ opacity: true })} className="absolute! z-1 h-full w-full bg-black/95 p-8 backdrop-blur-md">
      <h1 className="mb-6 border-b border-neutral-700 pb-2 text-2xl uppercase">{t('firstTimeHeader')}</h1>
      <p className="mb-6">
        <TransComponent i18nKey="firstTimeDesc" />
      </p>
      <div className="mb-2 flex-row! items-center border-b border-neutral-500 pb-2">
        <AnimatedComponent condition={isBrowsingDevhdd0}>
          <MotionDiv className="flex-row! items-center" {...genAnimation({ opacity: true, width: true, scaleX: true })}>
            <LoadingIcon className="animate-spin" />
            <div className="w-2" />
          </MotionDiv>
        </AnimatedComponent>
        <h2 className="mr-auto">
          <TransComponent i18nKey="devhdd0Folder" />
        </h2>
        <button
          className="font-pentatonic rounded-sm border border-neutral-500 px-2 py-1 text-sm uppercase duration-200 hover:border-neutral-400 active:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
          disabled={disableButtons}
          onClick={async () => {
            setWindowState({ disableButtons: true })
            setIsBrowsingDevhdd0(true)
            const path = await window.api.initFunctions.selectDevHDD0FolderInit()
            if (!path) {
              setWindowState({ disableButtons: false })
              setIsBrowsingDevhdd0(false)
              return
            }
            setIsBrowsingDevhdd0(false)
            setIntroDevHDD0Folder(path)
            setWindowState({ disableButtons: false })
          }}
        >
          {t('selectFolder')}
        </button>
      </div>
      <div className="mb-6 flex-row!">
        <p className="font-mono text-sm!">{introDevHDD0Folder || t('noPathSelected')}</p>
      </div>
      <div className="mb-2 flex-row! items-center border-b border-neutral-500 pb-2">
        <AnimatedComponent condition={isBrowsingRPCS3Exe}>
          <MotionDiv className="flex-row! items-center" {...genAnimation({ opacity: true, width: true, scaleX: true })}>
            <LoadingIcon className="animate-spin" />
            <div className="w-2" />
          </MotionDiv>
        </AnimatedComponent>
        <h2 className="mr-auto">
          <TransComponent i18nKey="rpcs3ExeFile" />
        </h2>
        <button
          className="font-pentatonic rounded-sm border border-neutral-500 px-2 py-1 text-sm uppercase duration-200 hover:border-neutral-400 active:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
          disabled={disableButtons}
          onClick={async () => {
            setWindowState({ disableButtons: true })
            setIsBrowsingRPCS3Exe(true)
            const path = await window.api.initFunctions.selectRPCS3ExeFileInit(t('rpcs3ExeFile'))
            if (!path) {
              setWindowState({ disableButtons: false })
              setIsBrowsingRPCS3Exe(false)
              return
            }
            setIsBrowsingRPCS3Exe(false)
            setIntroRPCS3File(path)
            setWindowState({ disableButtons: false })
          }}
        >
          {t('selectExe')}
        </button>
      </div>
      <div className="flex-row!">
        <p className="font-mono text-sm!">{introRPCS3File || t('noPathSelected')}</p>
      </div>
      <AnimatedComponent condition={Boolean(introDevHDD0Folder) && Boolean(introRPCS3File)}>
        <MotionDiv {...genAnimation({ opacity: true, height: true, scaleY: true })}>
          <div className="h-4" />
          <button
            disabled={disableButtons}
            className="font-pentatonic w-fit rounded-sm border border-neutral-500 px-2 py-1 text-sm uppercase duration-200 hover:border-neutral-400 active:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
            onClick={async () => {
              setWindowState({ disableButtons: true })
              const isDevHDD0Valid = await window.api.rbtools.isDevHDD0PathValid(introDevHDD0Folder)
              if (!isDevHDD0Valid) return setWindowState({ disableButtons: false })
              const isRPCS3ExeValid = await window.api.rbtools.isRPCS3ExePathValid(introRPCS3File)
              if (!isRPCS3ExeValid) return setWindowState({ disableButtons: false })
              const newConfig: UserConfig = {
                devhdd0Path: introDevHDD0Folder,
                rpcs3ExePath: introRPCS3File,
              }
              setConfigState(newConfig)
              console.log(newConfig)
              setWindowState({ disableButtons: false, isFirstTimeModalActivated: false })
            }}
          >
            {t('continue')}
          </button>
        </MotionDiv>
      </AnimatedComponent>
    </ModalGenericBG>
    // <ModalGenericBG id="FirstTimeModal" condition={isFirstTimeModalActivated} animation={genAnimation({ opacity: true })} className="absolute! z-1 h-full w-full bg-black/95 p-8 backdrop-blur-md">
    //   <h1 className="mb-6 border-b border-neutral-700 pb-2 text-2xl uppercase">{t('firstTimeHeader')}</h1>
    //   <p className="mb-6">
    //     <Trans components={{ code: <code /> }} i18nKey="firstTimeDesc" />
    //   </p>
    //   <div>
    //     <button
    //       disabled={isDevhdd0PathButtonDisabled || disableButtons}
    //       className="group mb-2 w-full flex-row! justify-center rounded-md border border-neutral-600 p-4 duration-200 hover:border-neutral-200"
    //       onClick={async () => {
    //         setWindowState({ disableButtons: true })
    //         setIsDevhdd0PathButtonDisabled(true)
    //         const path = await window.api.initFunctions.selectDevHDD0FolderInit()
    //         if (!path) {
    //           setWindowState({ disableButtons: false })
    //           setIsDevhdd0PathButtonDisabled(false)
    //           return
    //         }
    //         setWindowState({ disableButtons: false })
    //         setIsDevhdd0PathButtonDisabled(false)
    //         setIntroDevHDD0Folder(path)
    //       }}
    //     >
    //       <OpenFolderIcon className="mr-4 min-w-7.5 text-3xl text-neutral-600 duration-200 group-hover:text-neutral-200" />
    //       <div className="text-default-white mr-2 justify-center rounded-sm bg-neutral-900 px-3 text-start text-sm">
    //         <code className="">dev_hdd0</code>
    //       </div>
    //       <div className="text-default-white w-fill mr-2 justify-center truncate rounded-sm bg-neutral-900 px-3 text-start text-sm">
    //         <p className="truncate">{introDevHDD0Folder || t('noPathSelected')}</p>
    //       </div>
    //     </button>
    //     <button
    //       disabled={isRPCS3ExePathButtonDisabled || disableButtons}
    //       className="group mb-2 w-full flex-row! rounded-md border border-neutral-600 p-4 duration-200 hover:border-neutral-200"
    //       onClick={async () => {
    //         setWindowState({ disableButtons: true })
    //         setIsRPCS3ExePathButtonDisabled(true)
    //         const path = await window.api.initFunctions.selectRPCS3ExeFileInit(t('rpcs3Exe'))
    //         if (!path) {
    //           setWindowState({ disableButtons: false })
    //           setIsRPCS3ExePathButtonDisabled(false)
    //           return
    //         }
    //         setWindowState({ disableButtons: false })
    //         setIsRPCS3ExePathButtonDisabled(false)
    //         setIntroRPCS3File(path)
    //       }}
    //     >
    //       <ExeFileIcon className="mr-4 min-w-7.5 text-3xl text-neutral-600 duration-200 group-hover:text-neutral-200" />
    //       <div className="text-default-white mr-2 justify-center rounded-sm bg-neutral-900 px-3 text-start text-sm">
    //         <code className="">rpcs3.exe</code>
    //       </div>
    //       <div className="text-default-white w-fill mr-2 justify-center truncate rounded-sm bg-neutral-900 px-3 text-start text-sm">
    //         <p className="truncate">{introRPCS3File || t('noPathSelected')}</p>
    //       </div>
    //     </button>
    //   </div>
    //   <AnimatedComponent condition={Boolean(introDevHDD0Folder) && Boolean(introRPCS3File)}>
    //     <MotionDiv {...genAnimation({ opacity: true, height: true, scaleY: true })}>
    //       <button
    //         className="font-pentatonic hover:border-default-white/25 active:border-default-white/50 w-fit rounded-sm border border-transparent bg-neutral-900 px-3 py-1 uppercase duration-200 hover:bg-neutral-800 active:bg-neutral-700"
    //         onClick={async () => {
    //           setWindowState({ disableButtons: true })
    //           const isDevHDD0Valid = await window.api.rbtools.isDevHDD0PathValid(introDevHDD0Folder)
    //           if (!isDevHDD0Valid) return setWindowState({ disableButtons: false })
    //           const isRPCS3ExeValid = await window.api.rbtools.isRPCS3ExePathValid(introRPCS3File)
    //           if (!isRPCS3ExeValid) return setWindowState({ disableButtons: false })
    //           const newConfig: UserConfig = {
    //             devhdd0Path: introDevHDD0Folder,
    //             rpcs3ExePath: introRPCS3File,
    //           }
    //           setConfigState(newConfig)
    //           console.log(newConfig)
    //           setWindowState({ disableButtons: false })
    //         }}
    //       >
    //         {t('continue')}
    //       </button>
    //     </MotionDiv>
    //   </AnimatedComponent>
    // </ModalGenericBG>
  )
}
