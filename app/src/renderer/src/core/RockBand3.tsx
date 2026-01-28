import { LoadingIcon } from '@renderer/assets/icons'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import { useWindowState } from '@renderer/states/WindowState'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function RockBand3() {
  const { t } = useTranslation()
  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
  const rb3Stats = useWindowState((state) => state.rb3Stats)

  useEffect(() => {
    const fetchData = async () => {
      if (rb3Stats === null) {
        const newRB3Stats = await window.api.rpcs3.getRB3Data(devhdd0Path, rpcs3ExePath)
        console.log('Rock Band 3 Data:', newRB3Stats)
      }
    }

    fetchData()
  }, [])
  return (
    <>
      {rb3Stats === null && (
        <div className="h-full w-full p-24">
          <LoadingIcon className="mb-2 animate-spin text-3xl" />
          <h1 className="text-neutral-600">{t('loadingRB3StatData')}</h1>
        </div>
      )}
    </>
  )
}
