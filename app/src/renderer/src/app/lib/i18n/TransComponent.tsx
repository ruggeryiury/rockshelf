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
}

const defaultComponents = {
  n: <br />,
  code: <code />,
} as const

export function TransComponent({ i18nKey, values, components }: TranslationComponentProps) {
  return <TC i18nKey={i18nKey} components={{ ...defaultComponents, ...components }} values={values} />
}
