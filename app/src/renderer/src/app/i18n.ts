import i18n from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { appENUSLocale } from './locale/en-US'
import { appPTBRLocale } from './locale/pt-BR'
import { appES419Locale } from './locale/es-419'

i18n
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    debug: true,
    resources: {
      'en-US': {
        translation: appENUSLocale,
      },
      'pt-BR': {
        translation: appPTBRLocale,
      },
      'es-419': {
        translation: appES419Locale,
      },
    },
    fallbackLng: 'en-US',
  })
