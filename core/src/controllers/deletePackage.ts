import { DirPath } from 'node-lib'
import { getPackagesCacheFile, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import type { RPCS3SongPackagesDataExtra } from '../lib.exports'
import { utimes } from 'node:fs/promises'

export const deletePackage = useHandler(async (win, __, pkgIndex: number): Promise<false | RPCS3SongPackagesDataExtra> => {
  const cache = getPackagesCacheFile()
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
  const { path, packageSize, packageType, songsCount, packageData } = cacheContents.packages[pkgIndex]
  const pkgPath = DirPath.of(path)

  if (!pkgPath.exists) {
    sendMessageBox(win, { type: 'error', code: 'deletePackagePackageNotFound' })
    return false
  }

  sendMessageBox(win, { type: 'loading', code: 'deletePackageDeleting', messageValues: { pkgName: packageData.packageName, pkgPath: pkgPath.path } })
  await pkgPath.deleteDir(true)

  cacheContents.packages.splice(pkgIndex, 1)

  cacheContents.allPackagesCount -= 1
  cacheContents.allPackagesSize -= packageSize
  cacheContents.allSongsCount -= songsCount
  cacheContents.allSongsPlusRB3 -= songsCount
  cacheContents.starsCount -= songsCount * 5
  if (packageType === 'rb3') {
    cacheContents.rb3PackagesSongsCount -= songsCount
    cacheContents.rb3PackagesCount--
  } else {
    cacheContents.rb1PackagesSongsCount -= songsCount
    cacheContents.rb1PackagesCount--
  }

  await cache.write(JSON.stringify(cacheContents))
  const now = new Date()
  await utimes(cache.path, now, now)

  return cacheContents
})
