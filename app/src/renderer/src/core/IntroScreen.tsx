import { genAnimation } from '@renderer/lib/genAnimation'
import { AnimatedComponent, MotionButton, MotionDiv, MotionSection } from '@renderer/lib/motion'
import { useMainState } from '@renderer/states/main'
import clsx from 'clsx'

export function IntroScreen() {
  const finishedLoading = useMainState((x) => x.finishedLoading)
  const isFirstTimeLoading = useMainState((x) => x.isFirstTimeLoading)
  const selectedRPCS3FolderPath = useMainState((x) => x.selectedRPCS3FolderPath)
  const disableButtons = useMainState((x) => x.disableButtons)
  const setMainState = useMainState((x) => x.setMainState)

  return (
    <AnimatedComponent condition={finishedLoading}>
      <MotionSection {...genAnimation({ opacity: true, duration: 0 })} id="IntroScreen" className="absolute w-full h-full bg-neutral-700 justify-center items-center">
        <h1 className="text-[4rem] uppercase">Rockshelf</h1>
        <AnimatedComponent condition={isFirstTimeLoading}>
          <MotionDiv {...genAnimation({ height: true, opacity: true })} className="items-center">
            <div className="h-5"></div>
            <h2 className="text-center mb-4">
              Welcome to Rockshelf
              <br />
              Before we can start, please choose the directory path where your RPCS3 is installed
            </h2>

            <div className="flex-row! items-center mb-4">
              <div className={clsx('border w-lg mr-2 p-2', selectedRPCS3FolderPath ? '' : 'border-neutral-600')}>
                <p className={clsx(selectedRPCS3FolderPath ? '' : 'text-neutral-600')}>{selectedRPCS3FolderPath || 'No Path Selected'}</p>
              </div>
              <button
                className="border border-neutral-500 w-fit p-2 hover:border-neutral-300"
                disabled={disableButtons}
                onClick={async () => {
                  setMainState({ disableButtons: true })
                  const path = await window.api.init.selectDevHDD0FolderInit()
                  setMainState({ selectedRPCS3FolderPath: path || '', disableButtons: false })
                }}
              >
                Select folder
              </button>
            </div>
            <AnimatedComponent condition={selectedRPCS3FolderPath.length > 0}>
              <MotionButton
                className="border border-neutral-500 w-fit p-2 hover:border-neutral-300"
                onClick={async () => {
                  const isValid = await window.api.rbtools.isDevHDD0PathValid(selectedRPCS3FolderPath)
                  if (!isValid) return
                }}
              >
                Continue
              </MotionButton>
            </AnimatedComponent>
          </MotionDiv>
        </AnimatedComponent>
        <p className="absolute bottom-5 text-xs text-center">
          Version 0.1-beta
          <br />
          Rockshelf &copy; 2025-2026 Ruggery Iury Corrêa. All rights reserved.
        </p>
      </MotionSection>
    </AnimatedComponent>
  )
}
