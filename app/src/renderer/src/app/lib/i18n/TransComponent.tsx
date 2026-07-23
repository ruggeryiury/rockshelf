import { bandIcon, bassIcon, drumsIcon, guitarIcon, harm3Icon, keysIcon, proBassIcon, proDrumsIcon, proGuitarIcon, proKeysIcon, vocalsIcon } from '@renderer/assets/images'
import { Trans as TC } from 'react-i18next'

export interface TranslationComponentProps {
  /**
   * The key for the translation string.
   */
  i18nKey: string
  /**
   * Optional components to be used within the translation string.
   */
  components?: Record<string, React.JSX.Element>
  /**
   * Optional values to be interpolated within the translation string.
   */
  values?: Record<string, string | number | boolean>
  className?: string
}

const defaultComponents = {
  n: <br />,
  code: <code />,
  bandIcon: <img className="inline w-4 opacity-80" src={bandIcon} />,
  guitarIcon: <img className="inline w-4 opacity-80" src={guitarIcon} />,
  bassIcon: <img className="inline w-4 opacity-80" src={bassIcon} />,
  drumsIcon: <img className="inline w-4 opacity-80" src={drumsIcon} />,
  vocalsIcon: <img className="inline w-4 opacity-80" src={vocalsIcon} />,
  keysIcon: <img className="inline w-4 opacity-80" src={keysIcon} />,
  proGuitarIcon: <img className="inline w-4 opacity-80" src={proGuitarIcon} />,
  proBassIcon: <img className="inline w-4 opacity-80" src={proBassIcon} />,
  proDrumsIcon: <img className="inline w-4 opacity-80" src={proDrumsIcon} />,
  harm3Icon: <img className="inline w-4 opacity-80" src={harm3Icon} />,
  proKeysIcon: <img className="inline w-4 opacity-80" src={proKeysIcon} />,
} as const

export function TransComponent({ i18nKey, values, components, className }: TranslationComponentProps) {
  return <TC className={className} i18nKey={i18nKey} components={{ ...defaultComponents, ...components }} values={values} />
}
