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
          appTitle: 'Rockshelf',
          versionText: 'Version {{version}}',
          introFooterText: 'Rockshelf © 2025-2026 Ruggery Iury Corrêa (Ruggy). All rights reserved',
          welcomeScreenTitle: 'Welcome to Rockshelf!',
          welcomeScreenDescription: "Your ultimate music library manager. Let's get started by setting up your music folders.",
        },
      },
      pt: {
        translation: {
          appTitle: 'Rockshelf',
          versionText: 'Versão {{version}}',
          introFooterText: 'Rockshelf © 2025-2026 Ruggery Iury Corrêa (Ruggy). Todos os direitos reservados',
          welcomeScreenTitle: 'Bem-vindo ao Rockshelf!',
        },
      },
    },
    fallbackLng: 'en',
  })
