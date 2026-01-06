import { useEffect } from 'react'
import { useMainState } from './states/main'
import { AppFrame, ErrorModal, IntroScreen, TopBar } from './core'

export default function App() {
  const setMainState = useMainState((x) => x.setMainState)

  useEffect(() => {
    const loadUserConfigOrInit = async () => {
      const hasUserConfig = await window.api.init.checkUserConfig()
      if (!hasUserConfig) {
        setMainState({ isFirstTimeLoading: 1 })
      }
    }

    setTimeout(() => {
      loadUserConfigOrInit()
    }, 40)
  }, [])

  return (
    <>
      <TopBar />
      <AppFrame>
        <ErrorModal />
        <IntroScreen />
      </AppFrame>
    </>
  )
}
