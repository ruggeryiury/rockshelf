import { DirPath } from 'node-lib'
import { RockshelfFileSys, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { editRSPackImage, type EditPackageDataOptions, type RPCS3SongPackagesDataExtra } from '../lib.exports'
import { utimes } from 'node:fs/promises'

export const editPackageData = useHandler(async (win, _, pkgIndex: number, options: EditPackageDataOptions): Promise<false | RPCS3SongPackagesDataExtra> => {
  const cache = RockshelfFileSys.packagesCacheFile()
  if (!cache.exists) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }
  const cacheContents = await cache.readJSON<RPCS3SongPackagesDataExtra>()
  if (typeof cacheContents !== 'object' || (typeof cacheContents === 'object' && cacheContents === null)) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }

  if (!(pkgIndex in cacheContents.packages)) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }
  const { path } = cacheContents.packages[pkgIndex]
  const pkgPath = DirPath.of(path)

  if (!pkgPath.exists) {
    sendMessageBox(win, { type: 'error', code: 'editPackageDataPackageNotFound' })
    return false
  }

  const thumbnail = pkgPath.gotoFile('folder.jpg')
  await editRSPackImage(thumbnail, options)

  if (options.packageName) cacheContents.packages[pkgIndex].packageData.packageName = options.packageName
  if (options.encryptionStatus) cacheContents.packages[pkgIndex].packageData.encryptionStatus = options.encryptionStatus
  if (options.category) cacheContents.packages[pkgIndex].packageData.category = options.category

  await cache.write(JSON.stringify(cacheContents))
  const now = new Date()
  await utimes(cache.path, now, now)

  return cacheContents
})
