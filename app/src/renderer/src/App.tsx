import { AppFrame, PopUpMessage, TopBar, FirstTimeModal } from './core'

export default function App() {
  return (
    <>
      <TopBar />
      <AppFrame>
        {/* Modals */}
        <FirstTimeModal />

        {/* Core Components */}
        <PopUpMessage />
      </AppFrame>
    </>
  )
}
