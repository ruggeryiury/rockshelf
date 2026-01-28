import { useEffect } from 'react'
import { WelcomeModal, InnerAppFrame, IntroScreen, MessageBox, TopBar, MainScreen } from './core'
import { useRendererState } from './states/RendererState'
import { useWindowState } from './states/WindowState'
import { useUserConfigState } from './states/UserConfigState'

export function App() {
  const setRendererState = useRendererState((state) => state.setRendererState)
  const setWindowState = useWindowState((state) => state.setWindowState)
  const setUserConfigState = useUserConfigState((state) => state.setUserConfigState)

  // Initialize program
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    const initProgramProcessing = async () => {
      const hasUserConfig = await window.api.fs.userConfig.readUserConfig()
      console.log('hasUserConfig:', hasUserConfig)
      if (!hasUserConfig) {
        setRendererState({ WelcomeModal: true })
        setWindowState({ disableButtons: false })
        return
      }

      setUserConfigState(hasUserConfig)
      setRendererState({ IntroScreen: false })
      setWindowState({ mainWindowSelectionIndex: 0 })
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
        <MainScreen />

        {/* Modals */}
        <WelcomeModal />
      </InnerAppFrame>
    </>
  )
}
