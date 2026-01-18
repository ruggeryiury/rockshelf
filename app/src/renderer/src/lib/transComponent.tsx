import { Trans as TC } from 'react-i18next'

const components = {
  copyrightSymbol: <>&copy;</>,
  n: <br />,
  code: <code />,
} as const

export function TransComponent({ i18nKey, values }: { i18nKey: string; values?: Record<string, string | number | boolean> }) {
  return <TC i18nKey={i18nKey} components={components} values={values} />
}
