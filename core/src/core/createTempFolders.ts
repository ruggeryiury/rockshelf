import type { DirPath } from 'node-lib'
import { getRockshelfTempDir } from '../core.exports'

export const createTempFolders = async (): Promise<DirPath> => {
  const tempFolder = getRockshelfTempDir()
  if (!tempFolder.exists) await tempFolder.mkDir()
  else {
    await tempFolder.deleteDir(true)
    await tempFolder.mkDir()
  }
  return tempFolder
}
