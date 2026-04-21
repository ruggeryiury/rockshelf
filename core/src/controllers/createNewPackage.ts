import { getPackagesCacheFile, getRB3USRDIR, rbiconsToPath, readUserConfigFile, sendBuzyLoad, sendDialog, tempjpgToPath, useHandler } from '../core.exports'
import { DirPath, pathLikeToFilePath } from 'node-lib'
import { createRSPackImage, extractPackagesForRPCS3Extra, isValidFolderName, rpcs3GetSongPackagesStatsExtra, type RPCS3SongPackagesDataExtra, type RSPackImageSourceValues } from '../lib.exports'
import { utimes } from 'node:fs/promises'
import { isRB3FolderNameFreeOnRPCS3, isRPCS3Devhdd0PathValid, officialPackages, type RB3CompatibleDTAFile, type RPCS3ExtractionOptions } from '../lib/rbtools/lib.exports'

export interface CreateNewPackageOptions {
  packages: string[]
  packageName: string
  packageFolderName: string
  forceEncryption: NonNullable<RPCS3ExtractionOptions['forceEncryption']>
  thumbnail: string | null
}

export interface SerializedRPCS3PackageExtractionObject {
  path: string
  packageSize: number
  songsInstalled: number
  songs: RB3CompatibleDTAFile[]
  installedSongIDs: string[]
  installedSongSongnames: string[]
  packagesData: RPCS3SongPackagesDataExtra
}

export const createNewPackage = useHandler(async (win, __, options: CreateNewPackageOptions): Promise<SerializedRPCS3PackageExtractionObject | false> => {
  console.log('struct CreateNewPackageOptions', options)
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const { packageFolderName, forceEncryption, packages, thumbnail, packageName } = options

  let devhdd0: DirPath
  try {
    devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
  } catch (err) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  sendBuzyLoad(win, { code: 'init', title: 'creatingNewPackage', steps: ['validatingPackageFolderName', 'extractingPackageFiles', 'processingPackageFiles', 'exportingNewDTAFile', 'movingFilesToNewPackageFolder', 'creatingPackageImage', 'updatingInstalledPackagesData'], onCompleted: ['resetCreateNewPackageScreenState'] })

  const packageFolder = getRB3USRDIR(devhdd0).gotoDir(packageFolderName)
  const folderNameTestResults = isValidFolderName(packageFolderName)

  if (typeof folderNameTestResults === 'string') {
    sendBuzyLoad(win, {
      code: 'throwError',
      key: `errorCreateNewPackage${folderNameTestResults.charAt(0).toUpperCase()}${folderNameTestResults.slice(1)}`,
      messageValues: { packageFolderName },
    })
    return false
  }

  if (packageFolderName.length > 42) {
    sendBuzyLoad(win, {
      code: 'throwError',
      key: 'errorCreateNewPackageFolderNameTooBig',
      messageValues: { packageFolderName },
    })
    return false
  }

  const isPackageFolderNameAvailable = await isRB3FolderNameFreeOnRPCS3(devhdd0, packageFolderName)

  if (!isPackageFolderNameAvailable) {
    let errorType: 'restrictedFolderName' | 'folderNameInUse'
    if (officialPackages.map((pack) => pack.folderName).includes(packageFolderName)) errorType = 'restrictedFolderName'
    else errorType = 'folderNameInUse'

    sendBuzyLoad(win, {
      code: 'throwError',
      key: errorType === 'folderNameInUse' ? 'errorCreateNewPackageFolderNameInUse' : 'errorCreateNewPackageRestrictedFolderName',
      messageValues: { packageFolderName },
    })
    return false
  }

  sendBuzyLoad(win, { code: 'incrementStep' })

  try {
    const results = await extractPackagesForRPCS3Extra(win, packages, devhdd0, packageFolderName, { forceEncryption })
    if (!results) return false

    sendBuzyLoad(win, { code: 'incrementStep' })
    let packageSource: RSPackImageSourceValues
    if (packages.length === 1) {
      const packagePath = pathLikeToFilePath(packages[0])
      if (packagePath.ext === '.pkg') packageSource = 'pkg'
      else packageSource = 'stfs'
    } else packageSource = 'merged'

    await createRSPackImage(thumbnail !== null ? tempjpgToPath('tempjpg://thumbnail') : rbiconsToPath('rbicons://custom').gotoFile('custom.jpg'), packageFolder.gotoFile('folder.jpg'), { packageName, type: 'rockshelf', source: packageSource, encryptionStatus: forceEncryption === 'enabled' ? 'encrypted' : 'decrypted' })
    sendBuzyLoad(win, { code: 'incrementStep' })

    const cache = getPackagesCacheFile()
    const packagesData = await rpcs3GetSongPackagesStatsExtra(devhdd0)
    await cache.write(JSON.stringify(packagesData))
    const now = new Date()
    await utimes(cache.path, now, now)
    if (packagesData.parsingErrors.length > 0) sendDialog(win, 'parsingErrorsOnPackagesDTA')

    sendBuzyLoad(win, { code: 'callSuccess' })

    return {
      path: results.path.path,
      packageSize: results.packSize,
      songs: results.songs,
      songsInstalled: results.songsInstalled,
      installedSongIDs: results.installedSongIDs,
      installedSongSongnames: results.installedSongSongnames,
      packagesData,
    }
  } catch (err) {
    if (packageFolder.exists) await packageFolder.deleteDir(true)
    throw err
  }
})
