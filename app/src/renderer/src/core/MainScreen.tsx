import { MusicLibIcon, StarCircleIcon } from '@renderer/assets/icons'
import { imgIconRB3DX, imgIconRB3, bandIcon, bassIcon, drumsIcon, guitarIcon, harm3Icon, keysIcon, proBassIcon, proDrumsIcon, proGuitarIcon, proKeysIcon, vocalsIcon } from '@renderer/assets/images'
import { useMainState } from '@renderer/states/main'
import { useTranslation } from 'react-i18next'

export function MainScreen() {
  const { t } = useTranslation()

  const stats = useMainState((x) => x.stats)
  const packages = useMainState((x) => x.packages)
  const saveData = useMainState((x) => x.saveData)
  const scores = useMainState((x) => x.scores)

  return (
    <section id="MainScreen" className="absolute! z-0 size-full p-8">
      <div className="mb-2 flex-row! items-center border-b border-neutral-400 pb-2">
        <h1 className="mr-2 text-xl uppercase">{t('welcomeText', { userName: stats?.userName })}</h1>
        <img
          src={(() => {
            switch (saveData?.mostPlayedInstrument) {
              case 'band':
              default:
                return bandIcon
              case 'bass':
                return bassIcon
              case 'drums':
                return drumsIcon
              case 'guitar':
                return guitarIcon
              case 'harmonies':
                return harm3Icon
              case 'keys':
                return keysIcon
              case 'proBass':
                return proBassIcon
              case 'proDrums':
                return proDrumsIcon
              case 'proGuitar':
                return proGuitarIcon
              case 'proKeys':
                return proKeysIcon
              case 'vocals':
                return vocalsIcon
            }
          })()}
          className="mr-auto size-6"
        />
        <MusicLibIcon className="mr-1 cursor-help" title={t('musicLibIconTitle')} />
        <p className='mr-2'>{packages?.allSongsCountWithRB3Songs}</p>
        <StarCircleIcon className="mr-1 cursor-help" />
        <p>{scores?.starsCount}/{packages?.starsCount}</p>
      </div>
      {stats?.rb3 && (
        <div className="flex-row! items-start">
          <div className="mr-3 max-w-48 min-w-48">
            <img src={stats.rb3.hasDeluxe ? imgIconRB3DX : imgIconRB3} className="size-48" />
          </div>
          <div className="w-fill">
            <div className="mb-2 w-full flex-row! items-end border-b border-neutral-400 pb-2">
              <h1 className="mr-3 text-lg uppercase">{stats.rb3.hasDeluxe ? 'Rock Band 3 Deluxe' : 'Rock Band 3'}</h1>
              <p className="text-neutral-400">{stats.rb3.gameID}</p>
            </div>
            <h2 className="mb-1 text-sm font-bold text-yellow-500 uppercase">Game path</h2>
            <p className="mb-3">{stats.rb3.gamePath}</p>
            <h2 className="text-sm font-bold text-yellow-500 uppercase">Patch Version</h2>
            <p className="mb-3">{stats.rb3.updateType === 'milohaxDX' ? 'Deluxe' : stats.rb3.updateType === 'tu5' ? 'Title Update 5' : 'No patch installed'}</p>
            <h2 className="text-sm font-bold text-yellow-500 uppercase">Has Teleport Glitch Patch installed</h2>
            <p className="mb-3">{stats.rb3.hasTeleportGlitchPatch ? t('yes') : t('no')}</p>
            <h2 className="text-sm font-bold text-yellow-500 uppercase">Has High Memory Patch installed</h2>
            <p className="mb-3">{stats.rb3.hasHighMemoryPatch ? t('yes') : t('no')}</p>
          </div>
        </div>
      )}
      {/* <p className="whitespace-pre-wrap">{stats && JSON.stringify(stats, null, 4)}</p>
      <p className="whitespace-pre-wrap">{packages && JSON.stringify(packages, null, 4)}</p>
      <p className="whitespace-pre-wrap">{saveData && JSON.stringify(saveData, null, 4)}</p>
      <p className="whitespace-pre-wrap">{scores && JSON.stringify(scores, null, 4)}</p> */}
    </section>
  )
}
