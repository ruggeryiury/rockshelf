import { TopBar } from './core/TopBar'
import { AppFrame } from './core/AppFrame'
import { IntroScreen } from './core/IntroScreen'

export default function App() {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <TopBar />
      <AppFrame>
        <IntroScreen />
      </AppFrame>
    </>
  )
}
