import { CloseIcon, FolderWithPlusIcon, MaximizeIcon, MinimizeIcon, RestoreWinIcon } from '@renderer/assets/icons'
import { useWindowState } from '@renderer/stores/Window.state'
import { useTranslation } from 'react-i18next'

export function Topbar() {
  const { t } = useTranslation()

  const isWinMaximized = useWindowState((x) => x.isWinMaximized)
  const disableTopbarButtons = useWindowState((x) => x.disableTopbarButtons)
  const setWindowState = useWindowState((x) => x.setWindowState)

  return (
    <header id="Topbar" className="laptop-lg:max-h-[4%] laptop-lg:min-h-[4%] max-h-[5%] min-h-[5%] w-full flex-row! items-center bg-[#1c1c1c] pl-4">
      <p className="mr-auto font-sans text-xs">{t('appTitle')}</p>
      {import.meta.env.DEV && (
        <>
          <button className="h-full justify-center px-3 duration-200 hover:bg-green-500/50" onClick={async () => await window.api.openUserDataFolder()}>
            <FolderWithPlusIcon />
          </button>
          <div className="mx-2 h-full w-px py-1.5">
            <div className="bg-default-white/25 h-full w-full" />
          </div>
        </>
      )}
      <button className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopbarButtons} onClick={async () => await window.api.windowMinimize()}>
        <MinimizeIcon />
      </button>
      <button
        className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600"
        disabled={disableTopbarButtons}
        onClick={async () => {
          const isWinMax = await window.api.windowMaximize()
          setWindowState({ isWinMaximized: isWinMax })
        }}
      >
        {isWinMaximized ? <RestoreWinIcon /> : <MaximizeIcon />}
      </button>
      <button className="h-full justify-center px-3 duration-200 hover:bg-red-500 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopbarButtons} onClick={async () => await window.api.windowClose()}>
        <CloseIcon />
      </button>
    </header>
  )
}
