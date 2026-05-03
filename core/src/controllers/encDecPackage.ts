import { DirPath, FilePath, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { getPackagesCacheFile, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { editRSPackImage, type RPCS3SongPackagesDataExtra, type RPCS3SongPackagesObjectExtra } from '../lib.exports'
import { BinaryAPI, EDATFile, MIDIFile, MOGGFile } from '../lib/rbtools'
import { temporaryFile } from 'tempy'
import { utimes } from 'node:fs/promises'

export type EncDecPackageFunctionTypes = 'encryptAll' | 'decryptAll'

export const encDecPackage = useHandler(async (win, _, func: EncDecPackageFunctionTypes, pkgIndex: number): Promise<RPCS3SongPackagesDataExtra | false> => {
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
  const packagePath = DirPath.of(path)

  if (cacheContents.packages[pkgIndex].packageData.encryptionStatus === 'encrypted' && func === 'encryptAll') {
    sendMessageBox(win, { type: 'info', code: 'encDecPackageIsAlreadyEncrypted', messageValues: { path: packagePath.path, name: cacheContents.packages[pkgIndex].packageData.packageName } })
    return false
  } else if (cacheContents.packages[pkgIndex].packageData.encryptionStatus === 'decrypted' && func === 'decryptAll') {
    sendMessageBox(win, { type: 'info', code: 'encDecPackageIsAlreadyDecrypted', messageValues: { path: packagePath.path, name: cacheContents.packages[pkgIndex].packageData.packageName } })
    return false
  }

  if (!packagePath.exists) {
    sendMessageBox(win, { type: 'error', code: 'editPackageDataPackageNotFound' })
    return false
  }

  const files = (await packagePath.gotoDir('songs').readDir(true)).toReversed().filter((entry) => entry instanceof FilePath && (entry.ext === '.mogg' || entry.fullname.endsWith('.mid.edat'))) as FilePath[]

  if (func === 'encryptAll') sendMessageBox(win, { type: 'loading', code: 'encryptingPackageFiles' })
  else sendMessageBox(win, { type: 'loading', code: 'decryptingPackageFiles' })

  for (const file of files) {
    if (file.ext === '.mogg') {
      const mogg = new MOGGFile(file)
      const isMOGGEncrypted = await mogg.isEncrypted()
      if ((isMOGGEncrypted && func === 'encryptAll') || (!isMOGGEncrypted && func === 'decryptAll')) continue

      const tempMOGG = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

      if (func === 'encryptAll') await mogg.encrypt(tempMOGG)
      else await mogg.decrypt(tempMOGG)

      await tempMOGG.move(mogg.path, true)
    } else {
      const edat = new EDATFile(file)
      const isEDATEncrypted = await edat.isEncrypted()
      if ((isEDATEncrypted && func === 'encryptAll') || (!isEDATEncrypted && func === 'decryptAll')) continue

      const tempEDAT = pathLikeToFilePath(temporaryFile({ name: edat.path.fullname }))
      if (func === 'encryptAll') {
        const midi = new MIDIFile(file)
        await midi.encrypt({ packFolderName: cacheContents.packages[pkgIndex].name, destPath: tempEDAT })
      } else {
        await edat.decrypt({ devKLicHash: cacheContents.packages[pkgIndex].devklic, destPath: tempEDAT })
      }

      await tempEDAT.move(edat.path, true)
    }
  }

  if (func === 'encryptAll') sendMessageBox(win, { type: 'success', code: 'encryptingPackageFiles' })
  else sendMessageBox(win, { type: 'success', code: 'decryptingPackageFiles' })

  const thumbnail = packagePath.gotoFile('folder.jpg')
  await editRSPackImage(thumbnail, { encryptionStatus: func === 'decryptAll' ? 'decrypted' : 'encrypted' })

  cacheContents.packages[pkgIndex].packageData.encryptionStatus = func === 'decryptAll' ? 'decrypted' : 'encrypted'

  await cache.write(JSON.stringify(cacheContents))
  const now = new Date()
  await utimes(cache.path, now, now)

  return cacheContents
})
