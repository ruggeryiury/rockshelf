import { getOfficialSongPackageStatsFromHash, type OfficialSongPackageStats, type OfficialSongPackageStatsJSON } from 'rbtools/lib'
import { getLocaleStringFromRenderer, sendMessage, useHandler } from '../core.exports'
import { PKGFile, type PKGFileJSONRepresentation } from 'rbtools'
import { dialog } from 'electron'
import { MyObject, pathLikeToFilePath } from 'node-lib'

export type SelectedPKGFileType = 'dx' | 'songPackage' | OfficialSongPackageStats['code']

export interface SelectPKGFileReturnObject {
  /**
   * The path to the PKG file.
   */
  pkgPath: string
  /**
   * The type of the package. Defaults to `'songPackage'` excepts when it's a recognizable PKG file.
   */
  pkgType: SelectedPKGFileType
  /**
   * The size of the PKG file.
   */
  pkgSize: number
  /**
   * General stats of the package.
   */
  stat: PKGFileJSONRepresentation
  /**
   * The short commit hash of the RB3DX version. This property will always be `undefined` if the selected PKG is not a RB3DX patch PKG.
   */
  dxHash?: string
  /**
   * Tells if the selected package is an official package.
   */
  official: OfficialSongPackageStatsJSON | undefined
}

export const selectPKGFileToInstall = useHandler(async (win, _): Promise<SelectPKGFileReturnObject | false> => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: await getLocaleStringFromRenderer(win, 'pkgFile'), extensions: ['pkg'] }] })

  if (selection.canceled) {
    sendMessage(win, {
      type: 'info',
      method: 'selectPKGFileToInstall',
      code: 'actionCancelledByUser',
    })
    return false
  }

  const [pkgFile] = selection.filePaths
  const pkg = new PKGFile(pkgFile)

  try {
    await pkg.checkFileIntegrity()
  } catch (err) {
    sendMessage(win, {
      type: 'error',
      method: 'selectPKGFileToInstall',
      code: 'invalidFileSignature',
      messageValues: { path: pkg.path.path },
    })
    return false
  }

  const stat = await pkg.toJSON()
  const official = getOfficialSongPackageStatsFromHash('pkg', stat.contentsHash)

  let pkgType: SelectedPKGFileType = 'songPackage'
  let dxHash: string | undefined

  if (stat.titleID === 'BLUS30050' && !official) {
    sendMessage(win, {
      type: 'error',
      method: 'selectPKGFileToInstall',
      code: 'rb2PKGNotAllowed',
      timeout: 6000,
      messageValues: { path: pkg.path.path },
    })

    return false
  } else if ((stat.titleID === 'BLUS30050' || stat.titleID === 'BLUS30463') && official) pkgType = official.code
  else if (stat.titleID === 'BLUS30463' && stat.pkgCodeID.startsWith('RB3DXNITE')) {
    pkgType = 'dx'
    dxHash = stat.pkgCodeID.slice('RB3DXNITE'.length).toLowerCase()
  }

  if (stat.titleID !== 'BLUS30463' && stat.titleID !== 'BLUS30050') {
    sendMessage(win, {
      type: 'error',
      method: 'selectPKGFileToInstall',
      code: 'notRockBandPKG',
      messageValues: { path: pkg.path.path },
    })

    return false
  }

  return {
    pkgPath: pkg.path.path,
    pkgType,
    pkgSize: stat.fileSize,
    stat,
    dxHash,
    official,
  }
})
