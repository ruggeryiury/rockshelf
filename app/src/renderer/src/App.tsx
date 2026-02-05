import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { WelcomeModal, InnerAppFrame, IntroScreen, MessageBox, TopBar, MainScreen, InstallPKGConfirmationModal, ConfigurationScreen, RockBand3DataScreen } from './core'
import { useRendererState } from './states/RendererState'
import { useWindowState } from './states/WindowState'
import { useUserConfigState } from './states/UserConfigState'

export function App() {
  const { i18n } = useTranslation()
  const setRendererState = useRendererState((state) => state.setRendererState)
  const setWindowState = useWindowState((state) => state.setWindowState)
  const setUserConfigState = useUserConfigState((state) => state.setUserConfigState)

  // Initialize program
  useEffect(function InitProgram() {
    const start = async () => {
      const hasUserConfig = await window.api.fs.userConfig.readUserConfig()
      if (import.meta.env.DEV) console.log('struct UserConfigObj ["core\\src\\lib\\fs\\userConfig.ts"]:', hasUserConfig)
      if (!hasUserConfig) {
        setRendererState({ WelcomeModal: true })
        setWindowState({ disableButtons: false })
        return
      }

      setUserConfigState(hasUserConfig)
      setRendererState({ IntroScreen: false })
      setWindowState({ disableButtons: false, mainWindowSelectionIndex: 0 })
    }
    const timeouts: NodeJS.Timeout[] = []

    const timeout = setTimeout(() => {
      start()
    }, 1500)
    timeouts.push(timeout)

    return () => {
      for (const timeout of timeouts) clearTimeout(timeout)
    }
  }, [])

  useEffect(function InitLocaleRequestListener() {
    window.api.listeners.onLocaleRequest((_, uuid, key) => {
      const val = i18n.exists(key) ? i18n.t(key) : key
      window.api.utils.sendLocale(uuid, val)
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
        <MainScreen>
          <RockBand3DataScreen />
          <ConfigurationScreen />
        </MainScreen>

        {/* Modals */}
        <WelcomeModal />
        <InstallPKGConfirmationModal />
      </InnerAppFrame>
    </>
  )
}
