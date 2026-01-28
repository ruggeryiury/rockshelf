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
          'en-US': 'English',
          'es-ES': 'Spanish',
          'pt-BR': 'Portuguese (Brazil)',
          appTitle: 'Rockshelf',
          changeLang: 'Change Language',
          continue: 'Continue',
          devhdd0Folder: 'DEV_HDD0 Folder',
          devhdd0FolderDescription: 'The path to your <code>dev_hdd0</code> folder. In this folder is where you can find your Rock Band 3 save data, your installed patches and song packages.',
          devhdd0Styled: '<code>dev_hdd0</code> Folder',
          downloadArbys3Btn: 'Download Rock Band 3 (5,35 GB)',
          error: 'Error',
          info: 'Information',
          introFooterText: 'Rockshelf © 2025-2026 Ruggery Iury Corrêa (Ruggy). All rights reserved',
          loadingRB3StatData: 'Loading Rock Band 3 Data...',
          noPathSelected: 'No Path Selected',
          noRB3FoundInstalled: "It looks like you don't have Rock Band 3 downloaded and recognized on RPCS3.<n /><n />You can download Rock Band 3 clicking the button below.",
          noSaveDataFound: 'No save data found, start the game once to get more info',
          openUserDataFolder: 'Open User Data Folder',
          rb3DXLogo: 'Rock Band 3 Deluxe',
          rb3Logo: 'Rock Band 3',
          refresh: 'Refresh',
          rockBand3Title: 'Rock Band 3',
          rpcs3Exe: 'RPCS3 Executable',
          rpcs3ExeDescription: 'The path to your RPCS3 executable file. The RPCS3 directory is where you can find the configuration of Rock Band 3 for the emulator.',
          rpcs3ExeStyled: 'RPCS3 Executable <code>rpcs3.exe</code>',
          select: 'Select',
          versionText: 'Version {{version}}',
          welcomeScreenDescription: 'Rockshelf is a Rock Band 3/Rock Band 3 Deluxe song package manager for RPCS3 users.<n /><n />Since it is your first time running the program, please choose the path to your <code>dev_hdd0</code> folder, and the RPCS3 executable <code>rpcs3.exe</code>, then click "Continue".',
          welcomeScreenTitle: 'Welcome to Rockshelf!',
          welcomeUserText: 'Welcome, {{userName}}',

          // Info
          infoSelectDevhdd0FolderActionCancelledByUser: '<code>dev_hdd0</code> folder selection aborted by the user.',
          infoSelectRPCS3ExeActionCancelledByUser: 'RPCS3 executable file <code>rpcs3.exe</code> selection aborted by the user.',

          // Error
          errorSelectDevhdd0FolderInvalidFolder: 'The selected <code>dev_hdd0</code> folder is not valid.',
          errorSelectRPCS3ExeInvalidFolder: 'The selected RPCS3 executable is not valid.',
        },
      },
      'pt-BR': {
        translation: {
          'en-US': 'Inglês',
          'es-ES': 'Espanhol',
          'pt-BR': 'Português (Brasil)',
          appTitle: 'Rockshelf',
          changeLang: 'Mudar Idioma',
          continue: 'Continuar',
          devhdd0Folder: 'Pasta DEV_HDD0',
          devhdd0FolderDescription: 'O caminho da sua pasta <code>dev_hdd0</code>. Nesta pasta é aonde se encontra seu dados salvos do Rock Band 3, seus patchs e seus pacotes de música instalados.',
          devhdd0Styled: 'Pasta <code>dev_hdd0</code>',
          downloadArbys3Btn: 'Baixar Rock Band 3 (5,35 GB)',
          error: 'Erro',
          info: 'Informação',
          introFooterText: 'Rockshelf © 2025-2026 Ruggery Iury Corrêa (Ruggy). Todos os direitos reservados',
          loadingRB3StatData: 'Carregando Dados do Rock Band 3...',
          noPathSelected: 'Caminho não selecionado',
          noRB3FoundInstalled: 'Parece que você não tem o Rock Band 3 baixado e reconhecido no RPCS3.<n /><n />Você pode baixar o Rock Band 3 clicando no botão abaixo',
          noSaveDataFound: 'Nenhum dados salvos do jogo encontrado, inicie o jogo pela primeira vez para obter mais informações',
          openUserDataFolder: 'Abrir Pasta de Dados do Usuário',
          rb3DXLogo: 'Rock Band 3 Deluxe',
          rb3Logo: 'Rock Band 3',
          refresh: 'Atualizar',
          rockBand3Title: 'Rock Band 3',
          rpcs3Exe: 'Executável do RPCS3',
          rpcs3ExeDescription: 'O caminho do executável do RPCS3. A pasta do RPCS3 é aonde se encontra a configuração do Rock Band 3 no emulador.',
          rpcs3ExeStyled: 'Executável do RPCS3 <code>rpcs3.exe</code>',
          select: 'Selecionar',
          versionText: 'Versão {{version}}',
          welcomeScreenDescription: 'Rockshelf é um gerenciador de packs instalados no emulador RPCS3 para o Rock Band 3/Rock Band 3 Deluxe.<n /><n />Como é a primeira vez que você está rodando o programa, por favor, escolha a localização da sua pasta <code>dev_hdd0</code> e do executável do RPCS3 <code>rpcs3.exe</code>, depois clique em "Continuar".',
          welcomeScreenTitle: 'Bem-vindo ao Rockshelf!',
          welcomeUserText: 'Bem-vindo(a), {{userName}}',

          // Info
          infoSelectDevhdd0FolderActionCancelledByUser: 'A seleção da pasta <code>dev_hdd0</code> foi abortada pelo usuário.',
          infoSelectRPCS3ExeActionCancelledByUser: 'A seleção do executável do RPCS3 <code>rpcs3.exe</code> foi abortada pelo usuário.',

          // Error
          errorSelectDevhdd0FolderInvalidFolder: 'A pasta <code>dev_hdd0</code> selecionada não é válida.',
          errorSelectRPCS3ExeInvalidFolder: 'O executável do RPCS3 selecionado não é válido.',
        },
      },
    },
    // fallbackLng: 'en-US',
  })
