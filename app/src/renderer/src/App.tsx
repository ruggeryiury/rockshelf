import type { InstrumentScoreData } from 'rbtools'
import { useEffect } from 'react'
import { Topbar, WindowFrame } from '@renderer/main.exports'
import { ConfigScreen, FirstTimeScreen, InitScreen, InstallPKGFileScreen, MainScreen, MessageModalScreen, RockBand3StatsScreen, UnhandledExceptionScreen } from '@renderer/screens.exports'
import { useWindowState } from '@renderer/stores/Window.store'
import { useTranslation } from 'react-i18next'
import { useInitScreenState } from './stores/InitScreen.store'
import { useFirstTimeScreenState } from './stores/FirstTimeScreen.store'
import { useUserConfigState } from './stores/UserConfig.store'
import { useCachedDataState } from './stores/CacheData.store'

export function App() {
  const { i18n } = useTranslation()
  const setInitScreen = useInitScreenState((x) => x.setInitScreen)
  const setFirstTimeScreen = useFirstTimeScreenState((x) => x.setFirstTimeScreen)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setUserConfigState = useUserConfigState((x) => x.setUserConfigState)
  const setCachedData = useCachedDataState((x) => x.setCachedData)

  useEffect(function InitApp() {
    const start = async () => {
      try {
        const hasUserConfig = await window.api.readUserConfigFile()

        if (!hasUserConfig) {
          setWindowState({ disableButtons: false })
          setFirstTimeScreen({ FirstTimeScreen: true })
          return
        }

        if (import.meta.env.DEV) console.log('struct UserConfigObject ["core/src/core/userConfigData.ts"]:', hasUserConfig)
        setUserConfigState(hasUserConfig)

        const rb3Stats = await window.api.rpcs3GetRB3Stats()
        if (import.meta.env.DEV) console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', rb3Stats)
        const saveData = await window.api.rpcs3GetSaveDataStats()
        if (import.meta.env.DEV) console.log('struct ParsedRB3SaveData ["rbtools/src/lib/rpsc3/getSaveData.ts"]:', saveData)

        let instrumentScores: InstrumentScoreData | false = false
        if (saveData) {
          instrumentScores = await window.api.rpcs3GetInstrumentScores(saveData)
          if (import.meta.env.DEV) console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', instrumentScores)
        }

        setCachedData({ rb3Stats, saveData, instrumentScores })

        setWindowState({ disableButtons: false })
        setInitScreen({ InitScreen: false })
      } catch (err) {
        if (err instanceof Error) setWindowState({ unhandledException: err })
      }
    }

    const timeouts: NodeJS.Timeout[] = []

    const timeout1 = setTimeout(() => setInitScreen({ isLoadingTextActivated: true }), 0x01f4)
    timeouts.push(timeout1)
    const timeout2 = setTimeout(() => start().then(() => undefined), 0x05dc)
    timeouts.push(timeout2)

    return () => {
      for (const timeout of timeouts) clearTimeout(timeout)
    }
  }, [])

  useEffect(function InitLocaleRequestListener() {
    window.api.onLocaleRequest((_, uuid, key) => {
      const val = i18n.exists(key) ? i18n.t(key) : key
      window.api.sendLocale(uuid, val)
    })
  }, [])
  return (
    <>
      <Topbar />
      <WindowFrame>
        <InitScreen />
        <FirstTimeScreen />
        <MessageModalScreen />
        <UnhandledExceptionScreen />

        <MainScreen>
          <RockBand3StatsScreen />
          <ConfigScreen />
        </MainScreen>

        <InstallPKGFileScreen />
      </WindowFrame>
    </>
  )
}
