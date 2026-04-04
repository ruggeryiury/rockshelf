import { useEffect } from 'react'
import { BuzyLoadScreen, ConfigScreen, CreateNewPackageScreen, DeluxeInstallScreen, DialogScreen, FatalErrorScreen, FirstTimeScreen, InstallPKGScreen, LogoScreen, MainScreen, MessageBox, MyPackagesScreen, Topbar, WindowFrame } from './components.exports'
import { useWindowState } from './stores/Window.state'
import { useFirstTimeScreenState } from './components/FirstTimeScreen.state'
import { useTranslation } from 'react-i18next'
import { useUserConfigState } from './stores/UserConfig.state'
import { InstrumentScoreData, ParsedRB3SaveData } from 'rbtools'
import { useLogoScreenState } from './components/LogoScreen.state'
import { useMessageBoxState } from './components/MessageBox.state'
import { useDialogScreenState } from './components/DialogScreen.state'
import { useBuzyLoadScreenState } from './components/BuzyLoadScreen.state'
import { RPCS3SongPackagesDataExtra } from 'rockshelf-core'

export function App() {
  const { i18n } = useTranslation()
  const setWindowState = useWindowState((x) => x.setWindowState)
  const setFirstTimeScreenState = useFirstTimeScreenState((x) => x.setFirstTimeScreenState)
  const setUserConfigState = useUserConfigState((x) => x.setUserConfigState)
  const setLogoScreenState = useLogoScreenState((x) => x.setLogoScreenState)
  const setMessageBoxState = useMessageBoxState((x) => x.setMessageBoxState)
  const setDialogScreenState = useDialogScreenState((x) => x.setDialogScreenState)
  const setBuzyLoadScreenState = useBuzyLoadScreenState((x) => x.setBuzyLoadScreenState)

  useEffect(function initApp() {
    const fn = async () => {
      try {
        const hasUserConfig = await window.api.readUserConfigFile()

        if (!hasUserConfig) {
          setWindowState({ disableButtons: false })
          setFirstTimeScreenState({ active: true })
          return
        }

        const testUserConfig = await window.api.testUserConfig()
        if (!testUserConfig) {
          setWindowState({ disableButtons: false })
          return
        }

        console.log('struct UserConfigObject ["core/src/core/userConfigData.ts"]:', hasUserConfig)
        setUserConfigState(hasUserConfig)

        const rb3Stats = await window.api.rpcs3GetRB3Stats()
        console.log('struct RockBand3Data ["rbtools/src/lib/rpcs3/rpcs3GetRB3Stats.ts"]:', rb3Stats)

        let saveData: ParsedRB3SaveData | false = false
        let instrumentScores: InstrumentScoreData | false = false
        let packagesData: RPCS3SongPackagesDataExtra | false = false
        if (typeof rb3Stats === 'object' && rb3Stats.hasSaveData) {
          saveData = await window.api.rpcs3GetSaveDataStats()
          console.log('struct ParsedRB3SaveData ["rbtools/src/lib/rpsc3/getSaveData.ts"]:', saveData)
          if (saveData) {
            instrumentScores = await window.api.rpcs3GetInstrumentScores(saveData)
            console.log('struct InstrumentScoreData ["rbtools/src/lib/rpcs3/getInstrumentScoresData.ts"]:', instrumentScores)
          }

          packagesData = await window.api.rpcs3GetPackagesData()
          console.log('struct RPCS3SongPackagesDataExtra ["rbtools/src/lib/rpcs3/rpcs3GetSongPackagesStatsExtra.ts"]:', packagesData)
        }

        setWindowState({
          rb3Stats,
          saveData,
          instrumentScores,
          packages: packagesData,
          disableButtons: false,
        })
        setLogoScreenState({ active: false })
      } catch (err) {
        if (err instanceof Error) setWindowState({ err })
      }
    }

    const touts: NodeJS.Timeout[] = []

    const t1 = setTimeout(() => setLogoScreenState({ showText: true }), 500)
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
  }, [])

  useEffect(function initMessageListener() {
    window.api.onMessage((_, message) => {
      console.log('struct MessageBoxObject [core/src/core/rendererSenders.ts]', message)
      setMessageBoxState({ message })
    })
  }, [])

  useEffect(function initDialogListener() {
    window.api.onDialog((_, code) => {
      return setDialogScreenState({ active: code })
    })
  }, [])

  useEffect(function initBuzyLoadListener() {
    window.api.onBuzyLoad((_, func) => {
      if (func.code === 'init') console.log('struct BuzyLoadInitObject [core/src/lib/senders/buzyLoad.ts]', func)
      else if (func.code === 'throwError') console.log('struct BuzyLoadErrorObject [core/src/lib/senders/buzyLoad.ts]', func)
      else console.log('struct BuzyLoadObject [core/src/lib/senders/buzyLoad.ts]', func)

      if (func.code === 'init') {
        setBuzyLoadScreenState({ active: func })
      } else if (func.code === 'throwError') {
        setBuzyLoadScreenState({ hasError: func })
      } else if (func.code === 'incrementStep') {
        setBuzyLoadScreenState((oldState) => ({ step: oldState.step + 1 }))
      } else if (func.code === 'callSuccess') {
        setBuzyLoadScreenState({ isCompleted: true })
      }
    })
  }, [])

  useEffect(function initRendererConsoleListener() {
    window.api.onRendererConsole((_, val) => console.log(val))
  }, [])
  return (
    <>
      <Topbar />
      <WindowFrame>
        <BuzyLoadScreen />
        <ConfigScreen />
        <CreateNewPackageScreen />
        <DeluxeInstallScreen />
        <DialogScreen />
        <FatalErrorScreen />
        <FirstTimeScreen />
        <InstallPKGScreen />
        <LogoScreen />
        <MainScreen />
        <MessageBox />
        <MyPackagesScreen />
      </WindowFrame>
    </>
  )
}
