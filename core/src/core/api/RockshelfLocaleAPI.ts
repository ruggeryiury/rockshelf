import { app } from 'electron'
import { localeENUS } from '../locale/en-US'
import { localeES419 } from '../locale/es-419'
import { localeFRCA } from '../locale/fr-CA'
import { localePTBR } from '../locale/pt-BR'

/**
 * A class with static methods that handlers internationalization on backends.
 */
export class RockshelfLocaleAPI {
  static locales = ['en-US', 'es-419', 'fr-CA', 'pt-BR'] as const
  static locale = {
    'en-US': localeENUS,
    'es-419': localeES419,
    'fr-CA': localeFRCA,
    'pt-BR': localePTBR,
  }
  static getAppLocale(): string {
    return app.getLocale()
  }
  static getAvailableLocale(): 'en-US' | 'es-419' | 'fr-CA' | 'pt-BR' {
    const locale = this.getAppLocale()
    const mainLocaleIndex = this.locales.findIndex((val) => val === locale)

    if (mainLocaleIndex === -1) {
      const secondaryLocaleIndex = this.locales.findIndex((val) => val.slice(0, 2) === locale.slice(0, 2))

      if (secondaryLocaleIndex === -1) return 'en-US'
      return this.locales[secondaryLocaleIndex]
    }

    return this.locales[mainLocaleIndex]
  }
  static t(key: string): string {
    if (key in this.locale[this.getAvailableLocale()]) return this.locale[this.getAvailableLocale()][key as keyof (typeof this.locales)[keyof typeof this.locales]]
    else return key
  }
}
