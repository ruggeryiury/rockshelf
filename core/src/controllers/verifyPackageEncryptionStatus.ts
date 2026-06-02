import { FilePath, pathLikeToDirPath } from 'node-lib'
import { useHandler } from '../core.exports'
import type { RPCS3SongPackagesObjectExtra, RSPackImageEncryptionStatusValues } from '../lib.exports'
import { EDATFile, MOGGFile } from '../lib/rbtools'

export const verifyPackageEncryptionStatus = useHandler(async (win, _, packageDetails: RPCS3SongPackagesObjectExtra): Promise<Exclude<RSPackImageEncryptionStatusValues, 'unknown'>> => {
  const packagePath = pathLikeToDirPath(packageDetails.path)

  if (packageDetails.packageData.encryptionStatus === 'encrypted' || packageDetails.packageData.encryptionStatus === 'decrypted') return packageDetails.packageData.encryptionStatus

  let result: Exclude<RSPackImageEncryptionStatusValues, 'unknown'> = 'mixed'

  const files = (await packagePath.gotoDir('songs').readDir(true)).toReversed().filter((entry) => entry instanceof FilePath && (entry.ext === '.mogg' || entry.fullname.endsWith('.mid.edat'))) as FilePath[]
  const filesCount = files.length
  const encFiles: FilePath[] = []
  const decFiles: FilePath[] = []

  for (const file of files) {
    if (file.ext === '.mogg') {
      const mogg = new MOGGFile(file)
      const isMOGGEncrypted = await mogg.isEncrypted()
      if (isMOGGEncrypted) encFiles.push(file)
      else decFiles.push(file)
    } else {
      const edat = new EDATFile(file)
      const isEDATEncrypted = await edat.isEncrypted()
      if (isEDATEncrypted) encFiles.push(file)
      else decFiles.push(file)
    }
  }

  if (encFiles.length === files.length) result = 'encrypted'
  else if (decFiles.length === files.length) result = 'encrypted'
  else if (decFiles.length > 0 && decFiles.length > 0) result = 'mixed'

  return result
})
