import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { WelcomeModal, InnerAppFrame, IntroScreen, MessageBox, TopBar, MainScreen, InstallPKGConfirmationModal } from './core'
import { useRendererState } from './states/RendererState'
import { useWindowState } from './states/WindowState'
import { useUserConfigState } from './states/UserConfigState'

export function App() {
  const { i18n } = useTranslation()
  const setRendererState = useRendererState((state) => state.setRendererState)
  const setWindowState = useWindowState((state) => state.setWindowState)
  const setUserConfigState = useUserConfigState((state) => state.setUserConfigState)

  // Initialize program
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = []
    const initProgramProcessing = async () => {
      const hasUserConfig = await window.api.fs.userConfig.readUserConfig()
      if (import.meta.env.DEV) console.log('Loaded User Configuration:', hasUserConfig)
      if (!hasUserConfig) {
        setRendererState({ WelcomeModal: true })
        setWindowState({ disableButtons: false })
        return
      }

      setUserConfigState(hasUserConfig)
      setRendererState({ IntroScreen: false })
      setWindowState({ disableButtons: false, mainWindowSelectionIndex: 0 })
    }

    const timeout = setTimeout(() => {
      initProgramProcessing()
    }, 1500)
    timeouts.push(timeout)

    return () => {
      for (const timeout of timeouts) clearTimeout(timeout)
    }
  }, [])

  // Initialize renderer locale sender
  useEffect(() => {
    // TODO: Implement i18n key getter, remove all lang:string from preload
    window.api.listeners.onLocaleRequest((event, uuid, key) => {
      event.sender.send(`@LocaleRequest/${uuid}`, key)
    })
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
        <InstallPKGConfirmationModal />
      </InnerAppFrame>
    </>
  )
}
