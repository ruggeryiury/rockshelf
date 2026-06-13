import type { DirPath } from 'node-lib'
import { getRockshelfPackagesDir, getRockshelfTempDir } from '../core.exports'

export const createTempFolders = async (): Promise<void> => {
  const tempFolder = getRockshelfTempDir()
  if (!tempFolder.exists) await tempFolder.mkDir()
  else {
    await tempFolder.deleteDir(true)
    await tempFolder.mkDir()
  }

  const packagesFolder = getRockshelfPackagesDir()
  if (!packagesFolder.exists) await packagesFolder.mkDir()
}
