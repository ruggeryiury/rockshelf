import { CloseIcon, MaximizeIcon, MinimizeIcon, RestoreWinIcon } from '@renderer/assets/icons'
import { useMainState } from '../states/main'

export function TopBar() {
  const isWinMaximized = useMainState((x) => x.isWinMaximized)
  const setMainState = useMainState((x) => x.setMainState)
  return (
    <>
      <header id="TopBar" className="text-default-white max-h-[5%] min-h-[5%] w-full flex-row! items-center bg-[#1c1c1c] pl-4">
        <h1 className="mr-auto text-xs">Rockshelf</h1>
        <button onClick={async () => await window.api.topbar.minimize()} className="h-full justify-center px-3 duration-200 hover:bg-white/25">
          <MinimizeIcon />
        </button>
        <button
          onClick={async () => {
            const isWinMax = await window.api.topbar.maximize()
            setMainState({ isWinMaximized: isWinMax })
          }}
          className="h-full justify-center px-3 duration-200 hover:bg-white/25"
        >
          {isWinMaximized ? <RestoreWinIcon /> : <MaximizeIcon />}
        </button>
        <button onClick={async () => await window.api.topbar.close()} className="h-full justify-center px-3 duration-200 hover:bg-red-500">
          <CloseIcon />
        </button>
      </header>
    </>
  )
}
