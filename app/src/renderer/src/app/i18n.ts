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
          welcomeText: "Welcome to Rockshelf\nSince it's your time running it, please choose the location of your <code>dev_hdd0</code> folder and the RPCS3 Executable <code>rpcs3.exe</code> file",
          selectFolder: 'Select Folder',
          selectFile: 'Select File',
          selectExe: 'Select Executable',
          noPathSelected: 'No path selected',
          introFooterText: 'Rockshelf <copy /> 2025-2026 Ruggery Iury Corrêa (a.k.a. Ruggy). All rights reserved',
          versionText: 'Version {{version}}',
          continue: 'Continue',
          yes: 'Yes',
          no: 'No',
          rpcs3Exe: 'RPCS3 Executable',

          // Errors
          errSelectDevHDD0FolderInitActionCancelledByUser: 'DEVHDD0 folder selection cancelled by the user',
          errIsDevHDD0PathValidInvalidPath: 'Provided DEVHDD0 path "{{devhdd0Path}}" is not valid',
          errSelectRPCS3ExeFileInitActionCancelledByUser: 'RPCS3 executable selection cancelled by the user',
          errIsRPCS3ExePathValidInvalidPath: 'Provided RPCS3 executable path "{{rpcs3ExePath}}" is not valid',
        },
      },
      pt: {
        translation: {
          title: 'Rockshelf',
          welcomeText: 'Bem-vindo(a) ao Rockshelf\nComo é a primeira vez que você está rodando o programa, por favor, escolha a localização da sua pasta <code>dev_hdd0</code> e o executável do RPCS3 <code>rpcs3.exe</code>',
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
          refreshRPCS3Stats: 'Atualizar estatísticas',

          // Success
          successInstallHighMemotyPatchSuccess: 'Patch de Ampliação de Memória instalado com sucesso',

          // Errors
          errorSelectDevHDD0FolderInitActionCancelledByUser: 'A seleção da pasta DEVHDD0 foi cancelada pelo usuário',
          errorIsDevHDD0PathValidInvalidPath: 'A pasta DEVHDD0 escolhida "{{devhdd0Path}}" não é válida',
          errorSelectRPCS3ExeFileInitActionCancelledByUser: 'A seleção do executável do RPCS3 foi cancelada pelo usuário',
          errorIsRPCS3ExePathValidInvalidPath: 'O executável do RPCS3 escolhido "{{rpcs3ExePath}}" não é válido',
        },
      },
    },
    fallbackLng: 'en',
  })
