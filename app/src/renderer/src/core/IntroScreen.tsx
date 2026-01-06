import { LoadingIcon } from '@renderer/assets/icons'
import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionDiv, MotionSection } from '@renderer/lib/motion'
import { useMainState } from '@renderer/states/main'
import clsx from 'clsx'

export function IntroScreen() {
  const finishedLoading = useMainState((x) => x.finishedLoading)
  const isFirstTimeLoading = useMainState((x) => x.isFirstTimeLoading)
  const isIntroScreenLoadingDevHdd0 = useMainState((x) => x.isIntroScreenLoadingDevHdd0)
  const isIntroScreenLoadingRPCS3EXE = useMainState((x) => x.isIntroScreenLoadingRPCS3EXE)
  const selectedDevHDD0FolderPath = useMainState((x) => x.selectedDevHDD0FolderPath)
  const selectedRPCS3ExeFilePath = useMainState((x) => x.selectedRPCS3ExeFilePath)
  const disableButtons = useMainState((x) => x.disableButtons)
  const setMainState = useMainState((x) => x.setMainState)

  return (
    <AnimatedComponent condition={finishedLoading}>
      <MotionSection {...genAnimation({ opacity: true, duration: 0 })} id="IntroScreen" className="absolute h-full w-full items-center justify-center bg-neutral-900">
        <h1 className="text-[4rem] uppercase">Rockshelf</h1>
        <AnimatedComponent condition={isFirstTimeLoading === 1}>
          <MotionDiv {...genAnimation({ height: true, opacity: true })} className="items-center">
            <div className="h-5"></div>
            <h2 className="mb-4 text-center">
              Welcome to Rockshelf
              <br />
              Before we can start, please choose your "rpcs3.exe" file and "devhdd0" folder.
            </h2>

            <div className="mb-4 flex-row! items-center">
              <h2 className="mr-4 text-xs font-bold">DEV_HDD0</h2>
              <div className={clsx('mr-2 w-lg border p-2', selectedDevHDD0FolderPath ? '' : 'border-neutral-600')}>
                <p className={clsx('truncate font-mono', selectedDevHDD0FolderPath ? '' : 'text-neutral-600')}>{selectedDevHDD0FolderPath || 'No Path Selected'}</p>
              </div>
              <button
                className="w-fit flex-row! border border-neutral-500 p-2 duration-100 hover:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
                disabled={disableButtons}
                onClick={async () => {
                  setMainState({ disableButtons: true, isIntroScreenLoadingDevHdd0: true })
                  const path = await window.api.init.selectDevHDD0FolderInit()
                  if (!path) return setMainState({ disableButtons: false, isIntroScreenLoadingDevHdd0: false })
                  setMainState({ selectedDevHDD0FolderPath: path, disableButtons: false, isIntroScreenLoadingDevHdd0: false })
                }}
              >
                <AnimatedComponent condition={isIntroScreenLoadingDevHdd0}>
                  <MotionDiv {...genAnimation({ width: true, scaleX: true, opacity: true })} className="flex-row! text-sm">
                    <LoadingIcon className="animate-spin text-neutral-200 [animation-duration:0.75s]" />
                    <div className="h-full w-1" />
                  </MotionDiv>
                </AnimatedComponent>
                <p>Select folder</p>
              </button>
            </div>
            <div className="flex-row! items-center">
              <h2 className="mr-4 text-xs font-bold">RPCS3.EXE</h2>
              <div className={clsx('mr-2 w-lg border p-2', selectedRPCS3ExeFilePath ? '' : 'border-neutral-600')}>
                <p className={clsx('truncate font-mono', selectedRPCS3ExeFilePath ? '' : 'text-neutral-600')}>{selectedRPCS3ExeFilePath || 'No Path Selected'}</p>
              </div>
              <button
                className="w-fit flex-row! border border-neutral-500 p-2 duration-100 hover:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
                disabled={disableButtons}
                onClick={async () => {
                  setMainState({ disableButtons: true, isIntroScreenLoadingRPCS3EXE: true })
                  const path = await window.api.init.selectRPCS3ExeFileInit()
                  if (!path) return setMainState({ disableButtons: false, isIntroScreenLoadingRPCS3EXE: false })
                  setMainState({ selectedRPCS3ExeFilePath: path, disableButtons: false, isIntroScreenLoadingRPCS3EXE: false })
                }}
              >
                <AnimatedComponent condition={isIntroScreenLoadingRPCS3EXE}>
                  <MotionDiv {...genAnimation({ width: true, scaleX: true, opacity: true })} className="flex-row! text-sm">
                    <LoadingIcon className="animate-spin text-neutral-200 [animation-duration:0.75s]" />
                    <div className="h-full w-1" />
                  </MotionDiv>
                </AnimatedComponent>
                <p>Select file</p>
              </button>
            </div>
            <AnimatedComponent condition={Boolean(selectedDevHDD0FolderPath) && Boolean(selectedRPCS3ExeFilePath)}>
              <MotionDiv {...genAnimation({ height: true, scaleY: true, opacity: true })}>
                <div className="h-4 w-full" />
                <button
                  className="w-fit border border-neutral-500 p-2 hover:border-neutral-300 disabled:border-neutral-800 disabled:text-neutral-700"
                  disabled={disableButtons}
                  onClick={async () => {
                    setMainState({ disableButtons: true })
                    const isDevHDD0Valid = await window.api.rbtools.isDevHDD0PathValid(selectedDevHDD0FolderPath)
                    if (!isDevHDD0Valid) return setMainState({ disableButtons: false })
                    const isRPCS3ExeValid = await window.api.rbtools.isRPCS3ExePathValid(selectedRPCS3ExeFilePath)
                    if (!isRPCS3ExeValid) return setMainState({ disableButtons: false })

                    setMainState({ isFirstTimeLoading: 2 })
                    const stats = await window.api.rbtools.getRPCS3InstalledGamesStats(selectedDevHDD0FolderPath, selectedRPCS3ExeFilePath)
                    console.log(stats)
                    setMainState({ disableButtons: false })
                  }}
                >
                  Continue
                </button>
              </MotionDiv>
            </AnimatedComponent>
          </MotionDiv>
        </AnimatedComponent>

        <p className="absolute bottom-5 text-center text-xs">
          Version 1.0-beta1
          <br />
          Rockshelf &copy; 2025-2026 Ruggery Iury Corrêa. All rights reserved.
        </p>
      </MotionSection>
    </AnimatedComponent>
  )
}
