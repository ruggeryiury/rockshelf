import { VscChromeMinimize, VscChromeMaximize, VscChromeClose, VscChromeRestore } from '@renderer/assets/icons'
import { useMainState } from '../states/main'

export function TopBar() {
  const isWinMaximized = useMainState((x) => x.isWinMaximized)
  const setMainState = useMainState((x) => x.setMainState)
  return (
    <>
      <header id="TopBar" className="flex-row! bg-[#1c1c1c] text-default-white w-full min-h-[5%] max-h-[5%] items-center pl-4">
        <h1 className="text-xs mr-auto">Rockshelf</h1>
        <button onClick={async () => await window.api.topbar.minimize()} className="hover:bg-white/25 px-3 h-full duration-200">
          <VscChromeMinimize />
        </button>
        <button
          onClick={async () => {
            const isWinMax = await window.api.topbar.maximize()
            setMainState({ isWinMaximized: isWinMax })
          }}
          className="hover:bg-white/25 px-3 h-full duration-200"
        >
          {isWinMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
        </button>
        <button onClick={async () => await window.api.topbar.close()} className="hover:bg-red-500 px-3 h-full duration-200">
          <VscChromeClose />
        </button>
      </header>
    </>
  )
}
