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
          
        },
      },
      pt: {
        translation: {
          title: 'Rockshelf',
          firstTimeHeader: 'Bem-vindo(a) ao Rockshelf',
          firstTimeDesc: 'Rockshelf é um gerenciador de packs instalados no emulador RPCS3 para o Rock Band 3/Rock Band 3 Deluxe.\n\nComo é a primeira vez que você está rodando o programa, por favor, escolha a localização da sua pasta <code>dev_hdd0</code> e o executável do RPCS3 <code>rpcs3.exe</code>',
          selectFolder: 'Selecionar Pasta',
          selectFile: 'Selecionar Arquivo',
          selectExe: 'Selecionar Executável',
          noPathSelected: 'Nenhum caminho selecionado',
          introFooterText: 'Rockshelf <copy /> 2025-2026 Ruggery Iury Corrêa (Ruggy). Todos os direitos reservados',
          versionText: 'Versão {{version}}',
          continue: 'Continuar',
          yes: 'Sim',
          no: 'Não',
          rpcs3Exe: 'Executável do RPCS3',
          gamePatchType: 'Tipo de Patch do jogo',
          milohaxDX: 'Deluxe (MiloHax)',
          welcome: 'Bem-vindo(a)!',
          teleportGlitchPatch: 'Patch de Correção do Teleport Glitch',
          highMemoryPatch: 'Patch de Ampliação de Memória',
          installed: 'Instalado',
          highMemoryNotInstalled: 'Não instalado, <invoker>clique aqui para instalar</invoker>',
          teleportGlitchPatchNotInstalled: 'Não instalado, <invoker>clique aqui para baixar uma versão do Rock Band 3 com o Patch de Correção do Teleport Glitch instalado</invoker>',
          refresh: 'Atualizar',
          openUserDataFolder: 'Abrir pasta de dados do usuário',
          openProjectOnGitHub: 'Abrir repositório do Rockshelf no GitHub',
          donateButton: 'Faça um donate ao criador do programa!',

          // Success
          successInstallHighMemotyPatchSuccess: 'Patch de Ampliação de Memória instalado com sucesso',

          // Errors and Warnings
          warnSelectDevHDD0FolderInitActionCancelledByUser: 'A seleção da pasta DEVHDD0 foi cancelada pelo usuário',
          errorIsDevHDD0PathValidInvalidPath: 'A pasta DEVHDD0 escolhida "{{devhdd0Path}}" não é válida',
          warnSelectRPCS3ExeFileInitActionCancelledByUser: 'A seleção do executável do RPCS3 foi cancelada pelo usuário',
          errorIsRPCS3ExePathValidInvalidPath: 'O executável do RPCS3 escolhido "{{rpcs3ExePath}}" não é válido',
        },
      },
    },
    fallbackLng: 'en',
  })
