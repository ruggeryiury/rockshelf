import i18n from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    debug: true,
    resources: {
      'en-US': {
        translation: {
          appTitle: 'Rockshelf',
          versionText: 'Version {{version}}',
          introFooterText: 'Rockshelf © 2025-2026 Ruggery Iury Corrêa (Ruggy). All rights reserved',
          welcomeScreenTitle: 'Welcome to Rockshelf!',
          welcomeScreenDescription: 'Rockshelf is a Rock Band 3/Rock Band 3 Deluxe song package manager for RPCS3 users.<n /><n />Since it is your first time running the program, please choose the path to your <code>dev_hdd0</code> folder, and the RPCS3 executable <code>rpcs3.exe</code>, then click "Continue".',
          openUserDataFolder: 'Open User Data Folder',
          devhdd0Styled: '<code>dev_hdd0</code> Folder',
          devhdd0Folder: 'DEV_HDD0 Folder',
          rpcs3ExeStyled: 'RPCS3 Executable <code>rpcs3.exe</code>',
          rpcs3Exe: 'RPCS3 Executable',
          devhdd0FolderDescription: 'The path to your <code>dev_hdd0</code> folder. In this folder is where you can find your Rock Band 3 save data, your installed patches and song packages.',
          rpcs3ExeDescription: 'The path to your RPCS3 executable file. The RPCS3 directory is where you can find the configuration of Rock Band 3 for the emulator.',
        },
      },
      'pt-BR': {
        translation: {
          appTitle: 'Rockshelf',
          versionText: 'Versão {{version}}',
          introFooterText: 'Rockshelf © 2025-2026 Ruggery Iury Corrêa (Ruggy). Todos os direitos reservados',
          welcomeScreenTitle: 'Bem-vindo ao Rockshelf!',
          welcomeScreenDescription: 'Rockshelf é um gerenciador de packs instalados no emulador RPCS3 para o Rock Band 3/Rock Band 3 Deluxe.<n /><n />Como é a primeira vez que você está rodando o programa, por favor, escolha a localização da sua pasta <code>dev_hdd0</code> e do executável do RPCS3 <code>rpcs3.exe</code>, depois clique em "Continuar".',
          openUserDataFolder: 'Abrir Pasta de Dados do Usuário',
        },
      },
    },
    fallbackLng: 'pt-BR',
  })
