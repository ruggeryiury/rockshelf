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
        translation: {},
      },
      pt: {
        translation: {
          title: 'Rockshelf',
          firstTimeHeader: 'Bem-vindo(a) ao Rockshelf',
          firstTimeDesc: 'Rockshelf é um gerenciador de packs instalados no emulador RPCS3 para o Rock Band 3/Rock Band 3 Deluxe.<n /><n />Como é a primeira vez que você está rodando o programa, por favor, escolha a localização da sua pasta <code>dev_hdd0</code> e do executável do RPCS3 <code>rpcs3.exe</code>, depois clique em "Continuar".',
          introFooterText: 'Rockshelf <copyrightSymbol /> 2025-2026 Ruggery Iury Corrêa (Ruggy). Todos os direitos reservados',
          versionText: 'Versão {{version}}',
          devhdd0Folder: 'Pasta <code>dev_hdd0</code>',
          rpcs3ExeFile: 'Executável do RPCS3',
          noPathSelected: 'Nenhum caminho escolhido',
          selectFolder: 'Selecionar Pasta',
          openUserDataFolder: 'Abrir pasta de dados do usuário',
          donateButton: 'Faça uma doação',
          openProjectOnGitHub: 'Abrir projeto no GitHub',
          selectFile: 'Selecionar Arquivo',
          selectExe: 'Selecionar Executável',
          continue: 'Continuar',
          ok: 'OK',
          yes: 'Sim',
          no: 'Não',

          // Warnings
          warnSelectDevHDD0FolderInitActionCancelledByUser: 'Seleção de pasta <code>dev_hdd0</code> abortada pelo usuário.',
          warnSelectRPCS3ExeFileInitActionCancelledByUser: 'Seleção do executável do RPCS3 abortada pelo usuário.',
        },
      },
    },
    fallbackLng: 'en',
  })
