import { useEffect } from 'react'
import { BuzyLoadScreen, ConfigScreen, CreateNewPackageScreen, DeluxeInstallScreen, DialogScreen, FatalErrorScreen, FirstTimeScreen, ImageCropScreen, LogoScreen, MainScreen, MessageBox, MyPackagesScreen, RBIconsSelector, SongDetails, Topbar, WindowFrame } from './components.exports'
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
import { useShallow } from 'zustand/shallow'

export function App() {
  const { i18n } = useTranslation()
  const { setWindowState, disableImg } = useWindowState(useShallow((x) => ({ setWindowState: x.setWindowState, disableImg: x.disableImg })))
  const { setFirstTimeScreenState } = useFirstTimeScreenState(useShallow((x) => ({ setFirstTimeScreenState: x.setFirstTimeScreenState })))
  const { setUserConfigState } = useUserConfigState(useShallow((x) => ({ setUserConfigState: x.setUserConfigState })))
  const { setLogoScreenState } = useLogoScreenState(useShallow((x) => ({ setLogoScreenState: x.setLogoScreenState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { setDialogScreenState } = useDialogScreenState(useShallow((x) => ({ setDialogScreenState: x.setDialogScreenState })))

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

        window.api.discordRPSetUserConfig(hasUserConfig)

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
    window.api.onLocaleRequest((_, uuid, key, messageValues) => {
      const text = i18n.exists(key) ? i18n.t(key, messageValues ?? {}) : key
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

  useEffect(function initRendererConsoleListener() {
    window.api.onRendererConsole((_, val) => console.log(val))
  }, [])

  useEffect(
    function tickDisableImgVar() {
      if (disableImg !== -1) setWindowState({ disableImg: -1 })
    },
    [disableImg]
  )
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
        <ImageCropScreen />
        <LogoScreen />
        <MainScreen />
        <MessageBox />
        <MyPackagesScreen />
        <RBIconsSelector />
        <SongDetails />
      </WindowFrame>
    </>
  )
}
