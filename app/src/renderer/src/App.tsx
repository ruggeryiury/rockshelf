import { AppFrame, PopUpMessage, IntroScreen, MainWindow, TopBar } from './core'

export default function App() {
  return (
    <>
      <TopBar />
      <AppFrame>
        <PopUpMessage />
        <IntroScreen />
        <MainWindow />
      </AppFrame>
    </>
  )
}
