import { pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'

/**
 * Reads a song package description file (`package.md`) and returns the file contents encoded as Base64. Returns `false` if the song package doesn't have a song package description file on it.
 * - - - -
 * @param {DirPathLikeTypes} packagePath The path to an installed song package folder on the RPCS3's USRDIR folder.
 * @returns {Promise<string | undefined>}
 */
export const getSongPackageDescriptionFileFromFolder = async (packagePath: DirPathLikeTypes): Promise<string | false> => {
  const packageDir = pathLikeToDirPath(packagePath)
  const descriptionFile = packageDir.gotoFile('package.md')

  if (descriptionFile.exists) return await descriptionFile.read('base64')
  return false
}
