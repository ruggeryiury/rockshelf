import { useEffect } from 'react'
import { FirstTimeScreen, LogoScreen, Topbar, WindowFrame } from './components.exports'
import { useWindowState } from './stores/Window.state'
import { useFirstTimeScreenState } from './components/FirstTimeScreen.state'
import { useTranslation } from 'react-i18next'

export function App() {
  const { i18n } = useTranslation()
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setFirstTimeScreenState = useFirstTimeScreenState((x) => x.setFirstTimeScreenState)

  useEffect(function initApp() {
    const fn = async () => {
      try {
        const hasUserConfig = await window.api.readUserConfigFile()

        if (!hasUserConfig) {
          setWindowState({ disableButtons: false })
          setFirstTimeScreenState({ active: true })
        }
      } catch (err) {
        if (err instanceof Error) setWindowState({})
      }
    }

    const touts: NodeJS.Timeout[] = []

    const t1 = setTimeout(() => {}, 500)
    const t2 = setTimeout(() => fn().then(() => undefined), 1500)
    touts.push(t1, t2)

    return () => {
      for (const tout of touts) clearTimeout(tout)
    }
  }, [])

  useEffect(function initLocaleReqListener() {
    window.api.onLocaleRequest((_, uuid, key) => {
      const text = i18n.exists(key) ? i18n.t(key) : key
      window.api.sendLocale(uuid, text)
    })
  })
  return (
    <>
      <Topbar />
      <WindowFrame>
        <LogoScreen />
        <FirstTimeScreen />
      </WindowFrame>
    </>
  )
}
