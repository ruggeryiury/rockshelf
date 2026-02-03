import { dialog } from 'electron'
import { pathLikeToFilePath } from 'node-lib'
import { sendMessage, useHandler } from '../../lib'
import { PKGFile, type PKGFileSongPackageStatObject } from 'rbtools'
import type { PKGData } from 'rbtools/lib'

export type OfficialSongPackagesTypes = 'rb1' | 'rb2' | 'lrb'
export type SelectedPKGFileType = 'tu5' | 'dx' | 'songPackage' | OfficialSongPackagesTypes

export interface SelectPKGFileReturnObject {
  /**
   * The path to the PKG file.
   */
  pkgPath: string
  /**
   * The name of the package. Defaults to the file name itself, except when it's a recognizable PKG file.
   */
  pkgName: string
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
  stat: PKGData
  /**
   * The short commit hash of the RB3DX version. This property will always be `undefined` if the selected PKG is not a RB3DX patch PKG.
   */
  dxHash?: string
  /**
   * The stats related to song package PKG files. Default is `undefined` is the selected PKG file is not a song package file.
   */
  songPackage?: PKGFileSongPackageStatObject
}

/**
 * Checks for known PKG entries hash for PKG files that's installed on the original Rock Band USRDIR folder (BLUS30050).
 * - - - -
 * @param {string} entriesHash The entries hash of the PKG file.
 * @returns 
 */
export const checkOfficialPreRB3PackagesIDs = (entriesHash: string): [SelectedPKGFileType, string] | false => {
  switch (entriesHash) {
    // Rock Band 1 (On-disc)
    case 'e386b8ab41e844ff087400533920cccca99c4fe3d455756bab35223592b0e683':
      return ['rb1', 'Rock Band']

    // LEGO Rock Band (On-disc)
    case '7b76d701a8513dd7a2a50065d34d0eb0b10aee4980e0ae6814baeb43f3caae87':
      return ['lrb', 'LEGO Rock Band']
    default:
      return false
  }
}

/**
 * Checks for known PKG entries hash for PKG files that's installed on the Rock Band 3 USRDIR folder (BLUS30463).
 * - - - -
 * @param {string} entriesHash The entries hash of the PKG file.
 * @returns 
 */
export const checkOfficialRB3PackagesIDs = (entriesHash: string): [SelectedPKGFileType, string] | false => {
  switch (entriesHash) {
    // Title Update 5 (not song package)
    case 'cba38dc92d6b7327e0a4c6efb014f3269d183ba475fce6d863b33d2178d28778':
      return ['tu5', 'Title Update 5']

    // Rock Band 2 (On-disc)
    case '92462fe7347aa14446b5b38409c7a91c48564fd4932d76e0b4e83a52fb3ca5ce':
      return ['rb2', 'Rock Band 2']
    default:
      return false
  }
}

export const selectPKGFileToInstall = useHandler(async (win, _, lang: string): Promise<SelectPKGFileReturnObject | false> => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: lang.startsWith('pt') ? 'Arquivo de Pacote do PS3' : lang.startsWith('es') ? '' : 'PS3 Package File', extensions: ['pkg'] }] })

  // If the selection is cancelled, return false
  if (selection.canceled) {
    sendMessage(win, {
      type: 'info',
      module: 'rpcs3',
      method: 'selectPKGFileToInstall',
      code: 'actionCancelledByUser',
    })
    return false
  }

  // Transform file into FilePath instance
  const [pkgFile] = selection.filePaths.map((file) => pathLikeToFilePath(file))

  let pkgType: SelectedPKGFileType = 'songPackage'
  let pkgName = pkgFile.name
  let dxHash: SelectPKGFileReturnObject['dxHash']
  let isOfficialPreRB3Package: boolean = false

  // Get package stats
  const pkg = new PKGFile(pkgFile)

  // File magic signature check
  try {
    await pkg.checkFileIntegrity()
  } catch (err) {
    sendMessage(win, {
      type: 'error',
      module: 'rpcs3',
      method: 'selectPKGFileToInstall',
      code: 'invalidFileSignature',
      messageValues: { filePath: pkgFile.path },
    })
    return false
  }

  // Get PKG file stats
  const stat = await pkg.stat()

  dev

  // Not Rock Band 3 song package
  if (stat.header.cidTitle1 !== 'BLUS30463') {
    // Is Rock Band 1 package
    if (stat.header.cidTitle1 === 'BLUS30050') {
      // Check for official packs by entries SHA256
      const officialPkgType = checkOfficialPreRB3PackagesIDs(stat.entries.sha256)
      if (officialPkgType) {
        isOfficialPreRB3Package = true
        pkgType = officialPkgType[0]
        pkgName = officialPkgType[1]

        // Probably is a custom converted to RB2, not compatible anyway...
      } else {
        sendMessage(win, {
          type: 'error',
          module: 'rpcs3',
          method: 'selectPKGFileToInstall',
          code: 'preRB3PKG',
          timeout: 6000,
          messageValues: { filePath: pkgFile.path },
        })

        return false
      }

      // If it's not a Rock Band 3 nor any Rock Band content
    } else {
      sendMessage(win, {
        type: 'error',
        module: 'rpcs3',
        method: 'selectPKGFileToInstall',
        code: 'notRBPKG',
        messageValues: { filePath: pkgFile.path },
      })

      return false
    }
  }

  // Rock Band 3 song package
  if (!isOfficialPreRB3Package) {
    const officialPkgType = checkOfficialRB3PackagesIDs(stat.entries.sha256)
    if (officialPkgType) {
      pkgType = officialPkgType[0]
      pkgName = officialPkgType[1]
    }
    // Is a RB3DX patch package
    else if (stat.header.cidTitle2.startsWith('RB3DXNITE')) {
      pkgType = 'dx'
      dxHash = stat.header.cidTitle2.slice(9)
    }
  }

  // If the package has a songs.dta file
  let songPackage: SelectPKGFileReturnObject['songPackage'] = undefined
  try {
    songPackage = await pkg.songPackageStat()
  } catch (err) { }

  return {
    pkgPath: pkgFile.path,
    pkgName,
    pkgType,
    pkgSize: stat.fileSize,
    dxHash,
    stat,
    songPackage,
  }
})
