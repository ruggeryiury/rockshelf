import { DirPath } from 'node-lib'
import { getPackagesCacheFile, sendBuzyLoad, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { isValidFolderName, type RPCS3SongPackagesDataExtra } from '../lib.exports'
import { isRB3FolderNameFreeOnRPCS3, officialPackages } from '../lib/rbtools/lib.exports'
import { utimes } from 'node:fs/promises'
import { EDATFile } from '../lib/rbtools'

export const changeDecryptedPackageFolderName = useHandler(async (win, __, pkgIndex: number, newPackageFolderName: string) => {
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
  const { path } = cacheContents.packages[pkgIndex]
  const oldPKGPath = DirPath.of(path)

  if (!oldPKGPath.exists) {
    sendMessageBox(win, { type: 'error', code: 'packageNotFound' })
    return false
  }

  const folderNameTestResults = isValidFolderName(newPackageFolderName)

  if (typeof folderNameTestResults === 'string') {
    sendMessageBox(win, { type: 'error', code: `createNewPackage${folderNameTestResults.charAt(0).toUpperCase()}${folderNameTestResults.slice(1)}`, messageValues: { packageFolderName: newPackageFolderName } })
    return false
  }

  if (newPackageFolderName.length > 42) {
    sendMessageBox(win, { type: 'error', code: `createNewPackageFolderNameTooBig`, messageValues: { packageFolderName: newPackageFolderName } })
    return false
  }

  const isPackageFolderNameAvailable = await isRB3FolderNameFreeOnRPCS3(oldPKGPath.gotoDir('../../../../'), newPackageFolderName)

  if (!isPackageFolderNameAvailable) {
    let errorType: 'restrictedFolderName' | 'folderNameInUse'
    if (officialPackages.map((pack) => pack.folderName).includes(newPackageFolderName)) errorType = 'restrictedFolderName'
    else errorType = 'folderNameInUse'
    sendMessageBox(win, { type: 'error', code: `createNewPackage${errorType === 'folderNameInUse' ? 'FolderNameInUse' : 'RestrictedFolderName'}`, messageValues: { packageFolderName: newPackageFolderName } })
    return false
  }

  const newPKGPath = await oldPKGPath.renameDir(oldPKGPath.changeDirName(newPackageFolderName))

  cacheContents.packages[pkgIndex].path = newPKGPath.path
  cacheContents.packages[pkgIndex].name = newPKGPath.name
  cacheContents.packages[pkgIndex].devklic = EDATFile.genDevKLicHash(newPKGPath.name)
  cacheContents.packages[pkgIndex].dtaFilePath = newPKGPath.gotoFile('songs/songs.dta').path
  cacheContents.packages[pkgIndex].thumbnailSrc = `rb3packimg://${encodeURIComponent(newPKGPath.name)}`
  cacheContents.packages[pkgIndex].packageFiles = cacheContents.packages[pkgIndex].packageFiles.map((p) => {
    const relativePath = p.slice(oldPKGPath.path.length + 1)
    console.log(relativePath)
    return newPKGPath.gotoFile(relativePath).path
  })

  await cache.write(JSON.stringify(cacheContents))
  const now = new Date()
  await utimes(cache.path, now, now)

  return cacheContents
})
