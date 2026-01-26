import { WelcomeModal, InnerAppFrame, IntroScreen, MessageBox, TopBar } from './core'

export function App() {
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
