import { isRPCS3Devhdd0PathValid } from 'rbtools/lib'
import { getRB1USRDIR, getRB3USRDIR, readUserConfigFile, useHandler } from '../core.exports'
import { DirPath } from 'node-lib'

/**
 * Deletes the user configuraton file and reload the window.
 */
export const deletePackageThumbnails = useHandler(async (win, _) => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) return false

  const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)

  const rb1USRDIR = getRB1USRDIR(devhdd0)

  if (rb1USRDIR.exists) {
    for (const entry of await rb1USRDIR.readDir()) {
      if (entry instanceof DirPath) {
        const thumbnailPath = entry.gotoFile('folder.jpg')

        if (thumbnailPath.exists) await thumbnailPath.delete()
      }
    }
  }
  const rb3USRDIR = getRB3USRDIR(devhdd0)

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
