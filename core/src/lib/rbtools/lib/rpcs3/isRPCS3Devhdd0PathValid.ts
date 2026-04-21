import { DirPath, type DirPathLikeTypes, pathLikeToDirPath } from 'node-lib'

/**
 * Checks if the provided `dev_hdd0` folder path is valid. Returns an `DirPath` instance of the provided path.
 * - - - -
 * @param {DirPathLikeTypes} devhdd0Path The path to the `dev_hdd0` folder of your RPCS3 installation.
 * @returns {DirPath}
 * @throws {Error} If the provided path does not match the expected structure of a `dev_hdd0` folder, or if it does not exist.
 */
export const isRPCS3Devhdd0PathValid = (devhdd0Path: DirPathLikeTypes): DirPath => {
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  if (!devhdd0.exists) throw new Error(`Provided dev_hdd0 folder path "${devhdd0.path}" does not exist.`)
  if (!devhdd0.gotoDir('game').exists) throw new Error(`"game" folder not found on provided dev_hdd0 folder path "${devhdd0.path}".`)
  if (!devhdd0.gotoDir('home').exists) throw new Error(`"home" folder not found on provided dev_hdd0 folder path "${devhdd0.path}".`)

  return devhdd0
}
