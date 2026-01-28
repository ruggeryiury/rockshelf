import { ARBYS3_LINK } from '@renderer/app/rockshelf'
import { LoadingIcon } from '@renderer/assets/icons'
import { imgIconRB3, imgIconRB3DX } from '@renderer/assets/images'
import { AnimatedDiv, genAnim, TransComponent } from '@renderer/lib'
import { useRendererState } from '@renderer/states/RendererState'
import { useUserConfigState } from '@renderer/states/UserConfigState'
import { useWindowState } from '@renderer/states/WindowState'
import clsx from 'clsx'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export function RockBand3() {
  const { t } = useTranslation()
  const devhdd0Path = useUserConfigState((state) => state.devhdd0Path)
  const rpcs3ExePath = useUserConfigState((state) => state.rpcs3ExePath)
  const isIntroActivated = useRendererState((state) => state.IntroScreen)
  const rb3Stats = useWindowState((state) => state.rb3Stats)
  const mainWindowSelectionIndex = useWindowState((state) => state.mainWindowSelectionIndex)
  const disableButtons = useWindowState((state) => state.disableButtons)

  const setWindowState = useWindowState((state) => state.setWindowState)

  useEffect(() => {
    const fetchData = async () => {
      if (!isIntroActivated) {
        const newRB3Stats = await window.api.rpcs3.getRB3Data(devhdd0Path, rpcs3ExePath)
        setWindowState({ rb3Stats: newRB3Stats })
        console.log('Rock Band 3 Data:', newRB3Stats)
      }
    }

    fetchData()
  }, [isIntroActivated])
  return (
    <AnimatedDiv condition={mainWindowSelectionIndex === 0} {...genAnim({ opacity: true, duration: 0.1 })} className="h-full w-full p-6">
      {/* Loading Data Screen */}
      {rb3Stats === null && (
        <div className="h-full w-full p-24">
          <LoadingIcon className="mb-2 animate-spin text-3xl" />
          <h1 className="text-neutral-600">{t('loadingRB3StatData')}</h1>
        </div>
      )}

      {/* Data fetched */}
      {rb3Stats && (
        <>
          <div className="mb-2 w-full flex-row! items-center bg-neutral-800 p-2">
            <h1 className="mr-auto">{t('welcomeUserText', { userName: rb3Stats.userName })}</h1>
            {!rb3Stats.hasSaveData && <p className='text-neutral-400 italic'>{t('noSaveDataFound')}</p>}
            <button
              className="ml-2 w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-xs! duration-100 hover:bg-neutral-700 active:bg-neutral-600 disabled:text-neutral-700 disabled:hover:bg-neutral-900"
              disabled={disableButtons}
              onClick={async () => {
                setWindowState({ disableButtons: true, rb3Stats: null })
                const newRB3Stats = await window.api.rpcs3.getRB3Data(devhdd0Path, rpcs3ExePath)
                setWindowState({ disableButtons: false, rb3Stats: newRB3Stats })
              }}
            >
              {t('refresh')}
            </button>
          </div>
          <div className="h-full w-full flex-row! items-start">
            <div>
              <img src={rb3Stats.hasDeluxe ? imgIconRB3DX : imgIconRB3} width={192} className={clsx('min-w-48, hover:animate-pulse', rb3Stats.path ? '' : 'grayscale')} alt={rb3Stats.hasDeluxe ? t('rb3DXLogo') : t('rb3Logo')} title={rb3Stats.hasDeluxe ? t('rb3DXLogo') : t('rb3Logo')} />
            </div>
            <div className="w-fill ml-4 h-full">
              {/* No Rock Band 3 found on RPCS3 */}
              {!rb3Stats.path && (
                <>
                  <p className="mb-2 text-neutral-600 italic">
                    <TransComponent i18nKey="noRB3FoundInstalled" />
                  </p>
                  <button className="w-fit rounded-xs bg-neutral-900 px-1 py-0.5 text-sm! duration-100 hover:bg-neutral-800 active:bg-neutral-700 disabled:text-neutral-700 disabled:hover:bg-neutral-900" onClick={async () => await window.api.utils.openExternalLink(ARBYS3_LINK)}>
                    {t('downloadArbys3Btn')}
                  </button>
                </>
              )}

              {/* Rock Band 3 found on RPCS3 */}
              {rb3Stats.path && <></>}
            </div>
          </div>
        </>
      )}
    </AnimatedDiv>
  )
}
