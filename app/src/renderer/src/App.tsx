import { useEffect } from 'react'
import { WelcomeModal, InnerAppFrame, IntroScreen, MessageBox, TopBar } from './core'
import { useRendererState } from './states/RendererState'
import { useWindowState } from './states/WindowState'

export function App() {
  const setRendererState = useRendererState((state) => state.setRendererState)
  const setWindowState = useWindowState((state) => state.setWindowState)

  // Initialize program
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    const initProgramProcessing = async () => {
      const hasUserConfig = await window.api.fs.userConfig.readUserConfig()
      console.log('hasUserConfig:', hasUserConfig)
      if (!hasUserConfig) {
        setWindowState({ disableButtons: false })
        setRendererState({ WelcomeModal: true })
        return
      }
    }

    const timeout = setTimeout(() => {
      initProgramProcessing()
    }, 1500)
    timeouts.push(timeout)

    return () => {
      for (const timeout of timeouts) clearTimeout(timeout)
    }
  }, [])

  return (
    <>
      <TopBar />
      <InnerAppFrame>
        {/* Core Components */}
        <MessageBox />

        {/* Screens */}
        <IntroScreen />

        {/* Modals */}
        <WelcomeModal />
      </InnerAppFrame>
    </>
  )
}
