import { MinimizeIcon, RestoreWinIcon, MaximizeIcon, CloseIcon, FolderWithPlusIcon } from '@renderer/assets/icons'
import { useWindowState } from '@renderer/stores/Window.store'
import { useTranslation } from 'react-i18next'

export function Topbar() {
  const { t } = useTranslation()

  const isWinMaximized = useWindowState((state) => state.isWinMaximized)
  const setWindowState = useWindowState((state) => state.setWindowState)
  const disableTopBarButtons = useWindowState((state) => state.disableTopBarButtons)

  return (
    <header id="TopBar" className="laptop-lg:max-h-[4%] laptop-lg:min-h-[4%] max-h-[5%] min-h-[5%] w-full flex-row! items-center bg-[#1c1c1c] pl-4">
      <p className="mr-auto font-sans text-xs">{t('appTitle')}</p>
      {import.meta.env.DEV && (
        <>
          <button onClick={async () => await window.api.openUserDataFolder()} className="h-full justify-center px-3 duration-200 hover:bg-green-500/50" title={t('openUserDataFolder')}>
            <FolderWithPlusIcon className="text-lg" />
          </button>
          <div className="mx-2 h-full w-px py-1.5">
            <div className="bg-default-white/25 h-full w-full" />
          </div>
        </>
      )}
      <button onClick={async () => await window.api.windowMinimize()} className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopBarButtons}>
        <MinimizeIcon />
      </button>
      <button
        onClick={async () => {
          const isWinMax = await window.api.windowMaximize()
          setWindowState({ isWinMaximized: isWinMax })
        }}
        className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600"
        disabled={disableTopBarButtons}
      >
        {isWinMaximized ? <RestoreWinIcon /> : <MaximizeIcon />}
      </button>
      <button onClick={async () => await window.api.windowClose()} className="h-full justify-center px-3 duration-200 hover:bg-red-500 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopBarButtons}>
        <CloseIcon />
      </button>
    </header>
  )
}
