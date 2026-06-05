import { utimes } from 'node:fs/promises'
import { getPackagesCacheFile, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { getSongPackageStatsFromFolder, type RPCS3SongPackagesDataExtra } from '../lib.exports'
import { DTAParser } from '../lib/rbtools'
import { pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { rpcs3GenSongPackageManifest } from '../lib/rbtools/lib.exports'

export const mergePackages = useHandler(async (win, _, selectedPackageIndex: number, mainPackageIndex: number) => {
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

  if (!(selectedPackageIndex in cacheContents.packages) || !(mainPackageIndex in cacheContents.packages)) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }
  const toBeMergedPackage = cacheContents.packages[selectedPackageIndex]
  const toBeMergedPackagePath = pathLikeToDirPath(toBeMergedPackage.path)
  const { packageFiles } = await rpcs3GenSongPackageManifest(toBeMergedPackagePath)
  const mainPackage = cacheContents.packages[mainPackageIndex]
  const mainPackagePath = pathLikeToDirPath(mainPackage.path)

  if (toBeMergedPackage.packageData.encryptionStatus !== 'decrypted' || mainPackage.packageData.encryptionStatus !== 'decrypted') {
    sendMessageBox(win, { type: 'error', code: 'mergePackagesOnlyDecrypted' })
    return false
  }

  for (const songnames of toBeMergedPackage.songs.map((song) => song.songname)) {
    const genDir = mainPackagePath.gotoDir(`songs/${songnames}/gen`)
    if (!genDir.exists) await genDir.mkDir(true)
  }

  for (const file of packageFiles) {
    const oldFilePath = pathLikeToFilePath(file)
    const relativePath = oldFilePath.path.slice(pathLikeToFilePath(toBeMergedPackage.dtaFilePath).gotoDir('').path.length + 1)
    const newFilePath = mainPackagePath.gotoFile(`songs/${relativePath}`)

    await oldFilePath.copy(newFilePath, true)
    await oldFilePath.delete()
  }

  const newMainDTA = new DTAParser([...mainPackage.songs, ...toBeMergedPackage.songs])
  newMainDTA.sort('ID')
  await newMainDTA.export(mainPackage.dtaFilePath)

  const packageUpdatedData = await getSongPackageStatsFromFolder(mainPackagePath)

  if (!packageUpdatedData) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }

  cacheContents.allPackagesCount--
  cacheContents.allPackagesSize = cacheContents.allPackagesSize - mainPackage.packageSize - toBeMergedPackage.packageSize + packageUpdatedData.packageSize
  cacheContents.rb3PackagesCount--

  cacheContents.packages[mainPackageIndex] = packageUpdatedData

  if (toBeMergedPackagePath.exists) await toBeMergedPackagePath.deleteDir(true)
  cacheContents.packages.splice(selectedPackageIndex, 1)

  await cache.write(JSON.stringify(cacheContents))
  const now = new Date()
  await utimes(cache.path, now, now)

  return cacheContents
})
