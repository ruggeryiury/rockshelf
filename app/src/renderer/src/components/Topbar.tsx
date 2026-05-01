import { CloseIcon, FolderWithPlusIcon, LoadingIcon, MinimizeIcon } from '@renderer/assets/icons'
import { animate, AnimatedDiv } from '@renderer/lib.exports'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'

export function Topbar() {
  const { t } = useTranslation()
  const { disableButtons, disableTopbarButtons, richPresence } = useWindowState(useShallow((x) => ({ disableButtons: x.disableButtons, setWindowState: x.setWindowState, isWinMaximized: x.isWinMaximized, disableTopbarButtons: x.disableTopbarButtons, richPresence: x.richPresence })))

  return (
    <header id="Topbar" className="laptop-lg:max-h-[4%] laptop-lg:min-h-[4%] max-h-[5%] min-h-[5%] w-full flex-row! items-center bg-[#1c1c1c] pl-4">
      <p className="mr-2 font-sans text-xs">{t('appTitle')}</p>
      {
        <AnimatedDiv condition={richPresence} {...animate({ opacity: true })} className="mr-1 animate-pulse flex-row! items-center rounded-sm border border-cyan-900 bg-cyan-950 px-1 py-0.5">
          <div className="mr-1 h-2 w-2 rounded-full bg-cyan-600"></div>
          <h1 className="text-neutral-300 uppercase">{t('richPresenceOn')}</h1>
        </AnimatedDiv>
      }
      <AnimatedDiv {...animate({ opacity: true })} condition={disableButtons}>
        <LoadingIcon className="animate-spin" />
      </AnimatedDiv>
      <div className="mr-auto" />
      {import.meta.env.DEV && (
        <>
          <button className="h-full justify-center px-3 duration-200 hover:bg-green-500/50" onClick={async () => await window.api.openUserDataFolder()}>
            <FolderWithPlusIcon className="text-base" />
          </button>
          <div className="mx-2 h-full w-px py-1.5">
            <div className="bg-default-white/25 h-full w-full" />
          </div>
        </>
      )}
      <button className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopbarButtons} onClick={async () => await window.api.windowMinimize()}>
        <MinimizeIcon className="text-base" />
      </button>
      {/* <button
        className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600"
        disabled={disableTopbarButtons}
        onClick={async () => {
          const isWinMax = await window.api.windowMaximize()
          setWindowState({ isWinMaximized: isWinMax })
        }}
      >
        {isWinMaximized ? <RestoreWinIcon className="text-base" /> : <MaximizeIcon className="text-base" />}
      </button> */}
      <button className="h-full justify-center px-3 duration-200 hover:bg-red-500 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopbarButtons} onClick={async () => await window.api.windowClose()}>
        <CloseIcon className="text-base" />
      </button>
    </header>
  )
}
