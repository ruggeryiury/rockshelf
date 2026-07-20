import { shell } from 'electron'
import { readUserConfigFile, RockshelfFileSys, useHandler } from '../core.exports'
import { DirPath } from 'node-lib'
import { isRPCS3Devhdd0PathValid } from '../lib/rbtools/lib.exports'

export type RockshelfFileSystemCommand = 'coreModuleRootDir' | 'appUserDataDir' | 'appTempDir' | 'appDownloadableContentDir' | 'rb1UsrDir' | 'rb2UsrDir' | 'rb3UsrDir'

export const openFSFolderInExplorer = useHandler(async (win, __, command: RockshelfFileSystemCommand): Promise<string | false> => {
  let path: DirPath

  switch (command) {
    case 'coreModuleRootDir': {
      path = RockshelfFileSys.coreModuleRootDir()
    }
    case 'appUserDataDir': {
      path = RockshelfFileSys.appUserDataDir()
    }
    case 'appTempDir': {
      path = RockshelfFileSys.appTempDir()
    }
    case 'appDownloadableContentDir': {
      path = RockshelfFileSys.appDownloadableContentDir()
    }
    case 'rb1UsrDir':
    case 'rb2UsrDir':
    case 'rb3UsrDir': {
      const userConfig = await readUserConfigFile()
      if (!userConfig) return false
      const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
      path = command === 'rb1UsrDir' ? RockshelfFileSys.rb1UsrDir(devhdd0) : command === 'rb2UsrDir' ? RockshelfFileSys.rb2UsrDir(devhdd0) : RockshelfFileSys.rb3UsrDir(devhdd0)
    }
  }

  return await shell.openPath(path.path)
})
