import { diffDotDevil, diffDotOn, diffDotOff } from '@renderer/assets/images'
import { useTranslation } from 'react-i18next'

export function DiffIconInline({ diff, width, mr }: { diff: number; width?: number; mr?: 'auto' | number }) {
  const { t, i18n } = useTranslation()
  return (
    <div style={{ width: `${5.625 * (width || 1)}rem`, marginRight: mr === 'auto' || !mr ? 'auto' : `${mr}rem` }} className="w-22.5 max-w-22.5 flex-row! items-center last:mr-0" title={t(diff === -1 ? 'noPart' : `diff${diff}`)}>
      {diff > -1 && (
        <>
          <img src={diff === 6 ? diffDotDevil : diff >= 1 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 2 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 3 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 4 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
          <img src={diff === 6 ? diffDotDevil : diff >= 5 ? diffDotOn : diffDotOff} style={{ width: `${width || 4}rem` }} />
        </>
      )}
      {diff === -1 && (
        <h1 style={{ fontSize: `${i18n.language === 'pt-BR' ? 0.79 * (width || 1) : i18n.language === 'en-US' ? 1.05 * (width || 1) : 0.88 * (width || 1)}rem` }} className="uppercase">
          {t('noPart')}
        </h1>
      )}
    </div>
  )
}
