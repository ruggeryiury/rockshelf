import i18n from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    debug: true,
    resources: {
      en: {
        translation: {
          title: 'Rockshelf',
        },
      },
      pt: {
        translation: {},
      },
    },
    fallbackLng: 'en',
  })
