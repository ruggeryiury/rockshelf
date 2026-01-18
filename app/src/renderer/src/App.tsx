import { AppFrame, PopUpMessage, TopBar, FirstTimeModal, IntroScreen, MainScreen } from './core'

export default function App() {
  return (
    <>
      <TopBar />
      <AppFrame>
        {/* Core Components */}
        <PopUpMessage />

        {/* Modals */}
        <FirstTimeModal />

        {/* Screens */}
        <IntroScreen />
        <MainScreen />
      </AppFrame>
    </>
  )
}
