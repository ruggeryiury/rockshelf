import { ExeFileIcon, OpenFolderIcon } from '@renderer/assets/icons'
import { ModalGenericBG } from '@renderer/components'
import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionButton, MotionDiv } from '@renderer/lib/motion'
import { useConfigState } from '@renderer/states/config'
import { useWindowState } from '@renderer/states/window'
import { UserConfig } from '@rockshelf/core'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export function FirstTimeModal() {
  const { t } = useTranslation()
  const [introDevHDD0Folder, setIntroDevHDD0Folder] = useState('')
  const [introRPCS3File, setIntroRPCS3File] = useState('')
  const [isDevhdd0PathButtonDisabled, setIsDevhdd0PathButtonDisabled] = useState(false)
  const [isRPCS3ExePathButtonDisabled, setIsRPCS3ExePathButtonDisabled] = useState(false)

  const disableButtons = useWindowState((x) => x.disableButtons)
  const isFirstTimeModalActivated = useWindowState((x) => x.isFirstTimeModalActivated)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setConfigState = useConfigState((x) => x.setConfigState)
  return (
    <ModalGenericBG id="FirstTimeModal" condition={isFirstTimeModalActivated} animation={genAnimation({ opacity: true })} className="absolute! z-1 h-full w-full bg-black/95 p-8 backdrop-blur-md">
      <h1 className="mb-6 border-b border-neutral-700 pb-2 text-2xl uppercase">{t('firstTimeHeader')}</h1>
      <p className="mb-6">
        <Trans components={{ code: <code /> }} i18nKey="firstTimeDesc" />
      </p>
      <div>
        <button
          disabled={isDevhdd0PathButtonDisabled || disableButtons}
          className="group mb-2 w-full flex-row! justify-center rounded-md border border-neutral-600 p-4 duration-200 hover:border-neutral-200"
          onClick={async () => {
            setWindowState({ disableButtons: true })
            setIsDevhdd0PathButtonDisabled(true)
            const path = await window.api.initFunctions.selectDevHDD0FolderInit()
            if (!path) {
              setWindowState({ disableButtons: false })
              setIsDevhdd0PathButtonDisabled(false)
              return
            }
            setWindowState({ disableButtons: false })
            setIsDevhdd0PathButtonDisabled(false)
            setIntroDevHDD0Folder(path)
          }}
        >
          <OpenFolderIcon className="mr-4 min-w-7.5 text-3xl text-neutral-600 duration-200 group-hover:text-neutral-200" />
          <div className="text-default-white mr-2 justify-center rounded-sm bg-neutral-900 px-3 text-start text-sm">
            <code className="">dev_hdd0</code>
          </div>
          <div className="text-default-white w-fill mr-2 justify-center truncate rounded-sm bg-neutral-900 px-3 text-start text-sm">
            <p className="truncate">{introDevHDD0Folder || t('noPathSelected')}</p>
          </div>
        </button>
        <button
          disabled={isRPCS3ExePathButtonDisabled || disableButtons}
          className="group mb-2 w-full flex-row! rounded-md border border-neutral-600 p-4 duration-200 hover:border-neutral-200"
          onClick={async () => {
            setWindowState({ disableButtons: true })
            setIsRPCS3ExePathButtonDisabled(true)
            const path = await window.api.initFunctions.selectRPCS3ExeFileInit(t('rpcs3Exe'))
            if (!path) {
              setWindowState({ disableButtons: false })
              setIsRPCS3ExePathButtonDisabled(false)
              return
            }
            setWindowState({ disableButtons: false })
            setIsRPCS3ExePathButtonDisabled(false)
            setIntroRPCS3File(path)
          }}
        >
          <ExeFileIcon className="mr-4 min-w-7.5 text-3xl text-neutral-600 duration-200 group-hover:text-neutral-200" />
          <div className="text-default-white mr-2 justify-center rounded-sm bg-neutral-900 px-3 text-start text-sm">
            <code className="">rpcs3.exe</code>
          </div>
          <div className="text-default-white w-fill mr-2 justify-center truncate rounded-sm bg-neutral-900 px-3 text-start text-sm">
            <p className="truncate">{introRPCS3File || t('noPathSelected')}</p>
          </div>
        </button>
      </div>
      <AnimatedComponent condition={Boolean(introDevHDD0Folder) && Boolean(introRPCS3File)}>
        <MotionDiv {...genAnimation({ opacity: true, height: true, scaleY: true })}>
          <button
            className="font-pentatonic hover:border-default-white/25 active:border-default-white/50 w-fit rounded-sm border border-transparent bg-neutral-900 px-3 py-1 uppercase duration-200 hover:bg-neutral-800 active:bg-neutral-700"
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
              setWindowState({ disableButtons: false })
            }}
          >
            {t('continue')}
          </button>
        </MotionDiv>
      </AnimatedComponent>
    </ModalGenericBG>
  )
}
