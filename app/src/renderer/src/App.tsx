import { useEffect } from 'react'
import { useMainState } from './states/main'
import { AppFrame, ErrorModals, IntroScreen, TopBar } from './core'

export default function App() {
  const setMainState = useMainState((x) => x.setMainState)

  useEffect(() => {
    const loadUserConfig = async () => {
      const hasUserConfig = await window.api.init.checkUserConfig()
      if (!hasUserConfig) {
        setMainState({ isFirstTimeLoading: true })
      }
    }

    setTimeout(() => {
      loadUserConfig()
    }, 40)
  }, [])

  return (
    <>
      <TopBar />
      <AppFrame>
        <ErrorModals />
        <IntroScreen />
      </AppFrame>
    </>
  )
}
