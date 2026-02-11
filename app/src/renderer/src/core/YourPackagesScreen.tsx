import { AnimatedDiv, genAnim } from '@renderer/lib'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import { useWindowState } from '@renderer/states/WindowState'
import { useEffect } from 'react'

export function YourPackagesScreen() {
  const mainWindowSelectionIndex = useWindowState((state) => state.mainWindowSelectionIndex)
  const packages = useWindowState((state) => state.packages)

  const getUserConfigState = useUserConfigState((state) => state.getUserConfigState)
  const setWindowState = useWindowState((state) => state.setWindowState)

  useEffect(
    function FetchPackagesData() {
      const start = async () => {
        if (!packages) {
          const newPackagesData = await window.api.rpcs3.getPackagesData(getUserConfigState())
          setWindowState({ packages: newPackagesData })
          if (import.meta.env.DEV) console.log('struct RB3PackagesData ["core\\src\\lib\\rpcs3\\getPackagesData.ts"]:', newPackagesData)
        }
      }

      start()
    },
    [mainWindowSelectionIndex]
  )
  return <AnimatedDiv id="YourPackagesScreen" condition={mainWindowSelectionIndex === 1} {...genAnim({ opacity: true, duration: 0.1 })} className="absolute! h-full w-full overflow-hidden break-all">
    {packages && JSON.stringify(packages)}
  </AnimatedDiv>
}
