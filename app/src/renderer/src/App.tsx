import { useEffect } from 'react'
import { AboutScreen, BuzyLoadScreen, ConfigScreen, CreateNewPackageScreen, DeluxeConfigScreen, DialogScreen, EditAllSongsScreen, EditSongScreen, FatalErrorScreen, FirstTimeScreen, ImageCropScreen, InstallRB3FileScreen, LogoScreen, MainScreen, MergePackageModal, MessageBox, MusicStoreScreen, MyPackagesScreen, RBIconsSelector, RhythmverseScreen, SongDetails, Topbar, WindowFrame } from './components.exports'
import { useWindowState } from './stores/Window.state'
import { useFirstTimeScreenState } from './components/FirstTimeScreen.state'
import { useTranslation } from 'react-i18next'
import { useUserConfigState } from './stores/UserConfig.state'
import { useLogoScreenState } from './components/LogoScreen.state'
import { useMessageBoxState } from './components/MessageBox.state'
import { useDialogScreenState } from './components/DialogScreen.state'
import { useShallow } from 'zustand/shallow'
import { STRUCT_LOG } from './app/rockshelf.globals'
import { PackageDetails } from './components/PackageDetails'
import { ExportPackageModal } from './components/ExportPackageModal'
import { useRhythmverseScreenState } from './components/RhythmverseScreen.state'

export function App() {
  const { i18n } = useTranslation()
  const { setWindowState, disableImg } = useWindowState(useShallow((x) => ({ setWindowState: x.setWindowState, disableImg: x.disableImg })))
  const { setFirstTimeScreenState } = useFirstTimeScreenState(useShallow((x) => ({ setFirstTimeScreenState: x.setFirstTimeScreenState })))
  const { setUserConfigState } = useUserConfigState(useShallow((x) => ({ setUserConfigState: x.setUserConfigState })))
  const { setLogoScreenState } = useLogoScreenState(useShallow((x) => ({ setLogoScreenState: x.setLogoScreenState })))
  const { setMessageBoxState } = useMessageBoxState(useShallow((x) => ({ setMessageBoxState: x.setMessageBoxState })))
  const { setDialogScreenState } = useDialogScreenState(useShallow((x) => ({ setDialogScreenState: x.setDialogScreenState })))
  const { setRhythmverseScreenState } = useRhythmverseScreenState(useShallow((x) => ({ setRhythmverseScreenState: x.setRhythmverseScreenState })))

  useEffect(function initApp() {
    const fn = async () => {
      try {
        const userConfigStatus = await window.api.userConfig.read()
        console.log('userConfigStatus', userConfigStatus)

        if (userConfigStatus === 'firstTime') {
          setWindowState({ disableButtons: false })
          setFirstTimeScreenState({ active: true })
          return
        } else if (userConfigStatus === 'corrupted') {
          setWindowState({ disableButtons: false })
          setDialogScreenState({ active: 'corruptedUserConfig' })
          return
        }

        if (STRUCT_LOG) console.log('struct UserConfigObject ["core/src/core/api/UserDataAPI.ts"]:', userConfigStatus)
        setUserConfigState(userConfigStatus)

        await window.api.discord.setUserConfig(userConfigStatus)

        const initialState = await window.api.data.getInitialState()
        if (STRUCT_LOG) console.log('struct InitialStateObject ["core/src/core/api/DataSyncAPI.ts"]:', initialState)

        setWindowState({
          ...initialState,
          disableButtons: false,
        })
        setLogoScreenState({ active: false })
      } catch (err) {
        if (err instanceof Error) setWindowState({ err })
      }
    }

    const touts: NodeJS.Timeout[] = []

    const t1 = setTimeout(() => setLogoScreenState({ showText: true }), 500)
    const t2 = setTimeout(() => fn().then(() => undefined), 500)
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

    window.api.onMessage((_, message) => {
      if (STRUCT_LOG) console.log('struct MessageBoxObject [core/src/core/rendererSenders.ts]', message)
      setMessageBoxState({ message })
    })

    window.api.onDialog((_, code) => {
      return setDialogScreenState({ active: code })
    })

    window.api.onRendererConsole((_, ...val) => console.log(...val))

    window.api.onRhythmverseQueue((_, queue) => setRhythmverseScreenState({ queue }))
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
        <AboutScreen />
        <BuzyLoadScreen />
        <ConfigScreen />
        <CreateNewPackageScreen />
        <DeluxeConfigScreen />
        <DialogScreen />
        <EditAllSongsScreen />
        <EditSongScreen />
        <ExportPackageModal />
        <FatalErrorScreen />
        <FirstTimeScreen />
        <ImageCropScreen />
        <InstallRB3FileScreen />
        <LogoScreen />
        <MainScreen />
        <MergePackageModal />
        <MessageBox />
        <MusicStoreScreen />
        <MyPackagesScreen />
        <PackageDetails />
        <RBIconsSelector />
        <RhythmverseScreen />
        <SongDetails />
      </WindowFrame>
    </>
  )
}
