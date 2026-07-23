import { shell } from 'electron'
import { UserConfigAPI, RockshelfFileSystemAPI, useHandler } from '../core.exports'
import { DirPath } from 'node-lib'
import { isRPCS3Devhdd0PathValid } from '../lib/rbtools/lib.exports'

export type RockshelfFileSystemAPItemCommand = 'coreModuleRootDir' | 'appUserDataDir' | 'appTempDir' | 'appDownloadableContentDir' | 'rb1UsrDir' | 'rb2UsrDir' | 'rb3UsrDir'

export const openFSFolderInExplorer = useHandler(async (win, __, command: RockshelfFileSystemAPItemCommand): Promise<string | false> => {
  let path: DirPath

  switch (command) {
    case 'coreModuleRootDir': {
      path = RockshelfFileSystemAPI.coreModuleRootDir()
    }
    case 'appUserDataDir': {
      path = RockshelfFileSystemAPI.appUserDataDir()
    }
    case 'appTempDir': {
      path = RockshelfFileSystemAPI.appTempDir()
    }
    case 'appDownloadableContentDir': {
      path = RockshelfFileSystemAPI.appDownloadableContentDir()
    }
    case 'rb1UsrDir':
    case 'rb2UsrDir':
    case 'rb3UsrDir': {
      const userConfig = await UserConfigAPI.readFile()
      if (!userConfig) return false
      const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
      path = command === 'rb1UsrDir' ? RockshelfFileSystemAPI.rb1UsrDir(devhdd0) : command === 'rb2UsrDir' ? RockshelfFileSystemAPI.rb2UsrDir(devhdd0) : RockshelfFileSystemAPI.rb3UsrDir(devhdd0)
    }
  }

  return await shell.openPath(path.path)
})
