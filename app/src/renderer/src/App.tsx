import { AppFrame, PopUpMessage, TopBar, FirstTimeModal, IntroScreen } from './core'

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
      </AppFrame>
    </>
  )
}
