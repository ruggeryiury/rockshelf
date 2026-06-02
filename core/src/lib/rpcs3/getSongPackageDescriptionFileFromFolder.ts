import { pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'

export const getSongPackageDescriptionFileFromFolder = async (packagePath: DirPathLikeTypes): Promise<string | undefined> => {
  const packageDir = pathLikeToDirPath(packagePath)
  const descriptionFile = packageDir.gotoFile('package.md')

  if (descriptionFile.exists) return await descriptionFile.read('base64')
  return
}
