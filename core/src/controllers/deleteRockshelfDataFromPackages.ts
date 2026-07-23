import { RockshelfFileSystemAPI, UserConfigAPI, useHandler } from '../core.exports'
import { DirPath } from 'node-lib'
import { isRPCS3Devhdd0PathValid } from '../lib/rbtools/lib.exports'

export const deleteRockshelfDataFromPackages = useHandler(async (win, _): Promise<boolean> => {
  const userConfig = await UserConfigAPI.readFile()
  if (!userConfig) return false

  const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)

  const rb1USRDIR = RockshelfFileSystemAPI.rb1UsrDir(devhdd0)

  if (rb1USRDIR.exists) {
    for (const entry of await rb1USRDIR.readDir()) {
      if (entry instanceof DirPath) {
        const thumbnailPath = entry.gotoFile('folder.jpg')
        if (thumbnailPath.exists) await thumbnailPath.delete()
      }
    }
  }
  const rb3USRDIR = RockshelfFileSystemAPI.rb3UsrDir(devhdd0)

  if (rb3USRDIR.exists) {
    for (const entry of await rb3USRDIR.readDir()) {
      if (entry instanceof DirPath) {
        const thumbnailPath = entry.gotoFile('folder.jpg')

        if (thumbnailPath.exists) await thumbnailPath.delete()
      }
    }
  }

  return true
})
