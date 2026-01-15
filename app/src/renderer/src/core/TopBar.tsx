import { CloseIcon, DonateIcon, FolderWithPlusIcon, GitHubIcon, MaximizeIcon, MinimizeIcon, RestoreWinIcon } from '@renderer/assets/icons'
import { useWindowState } from '../states/window'
import { useTranslation } from 'react-i18next'
import { DONATE_LINK, ROCKSHELF_GITHUB_LINK } from '@renderer/app/app'

export function TopBar() {
  const { t } = useTranslation()
  const isWinMaximized = useWindowState((x) => x.isWinMaximized)
  const setWindowState = useWindowState((x) => x.setWindowState)
  const disableTopBarButtons = useWindowState((x) => x.disableTopBarButtons)
  return (
    <>
      <header id="TopBar" className="max-h-[5%] min-h-[5%] w-full flex-row! items-center bg-[#1c1c1c] pl-4">
        <h1 className="mr-auto text-xs">Rockshelf</h1>
        {import.meta.env.DEV && (
          <>
            <button onClick={async () => await window.api.topbar.openUserDataFolder()} className="h-full justify-center px-3 duration-200 hover:bg-green-500/50" title={t('openUserDataFolder')}>
              <FolderWithPlusIcon className="text-xl" />
            </button>
            <div className="h-full w-px py-1.5">
              <div className="bg-default-white/25 h-full w-full" />
            </div>
          </>
        )}
        <button
          onClick={async () => {
            await window.api.utils.openExternalLink(DONATE_LINK)
          }}
          className="h-full justify-center px-3 duration-200 hover:bg-purple-500/50"
          title={t('donateButton')}
        >
          <DonateIcon className="text-xl" />
        </button>
        <button
          onClick={async () => {
            await window.api.utils.openExternalLink(ROCKSHELF_GITHUB_LINK)
          }}
          className="h-full justify-center px-3 duration-200 hover:bg-green-500/50"
          title={t('openProjectOnGitHub')}
        >
          <GitHubIcon className="text-xl" />
        </button>
        <div className="h-full w-px py-1.5">
          <div className="bg-default-white/25 h-full w-full" />
        </div>
        <button onClick={async () => await window.api.topbar.minimize()} className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopBarButtons}>
          <MinimizeIcon />
        </button>
        <button
          onClick={async () => {
            const isWinMax = await window.api.topbar.maximize()
            setWindowState({ isWinMaximized: isWinMax })
          }}
          className="h-full justify-center px-3 duration-200 hover:bg-white/25 disabled:bg-black/50 disabled:text-neutral-600"
          disabled={disableTopBarButtons}
        >
          {isWinMaximized ? <RestoreWinIcon /> : <MaximizeIcon />}
        </button>
        <button onClick={async () => await window.api.topbar.close()} className="h-full justify-center px-3 duration-200 hover:bg-red-500 disabled:bg-black/50 disabled:text-neutral-600" disabled={disableTopBarButtons}>
          <CloseIcon />
        </button>
      </header>
    </>
  )
}
