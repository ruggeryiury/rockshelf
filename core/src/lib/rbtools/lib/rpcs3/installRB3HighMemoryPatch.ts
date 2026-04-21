import { FilePath, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'

/**
 * Installs the high memory patch on RPCS3's `dev_hdd0` folder.
 * - - - -
 * @param {DirPathLikeTypes} devhdd0Path The path to the `dev_hdd0` folder of your RPCS3 installation.
 * @returns {Promise<FilePath>}
 */
export const installRB3HighMemoryPatch = async (devhdd0Path: DirPathLikeTypes): Promise<FilePath> => {
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  const usrdir = devhdd0.gotoDir('game/BLUS30463/USRDIR')
  if (!usrdir.exists) await usrdir.mkDir(true)
  const highMemoryDTAFile = usrdir.gotoFile('dx_high_memory.dta')
  await highMemoryDTAFile.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
  return highMemoryDTAFile
}
