import { dialog } from 'electron'
import { pathLikeToFilePath } from 'node-lib'
import { useHandler } from '../electron-lib/useHandler'
import { sendMessage } from '../../lib'
import { PKGFile, type PKGFileSongPackageStatObject } from 'rbtools'

export type SelectedPKGFileType = 'tu5' | 'dx' | 'songPackage'

export interface SelectPKGFileReturnObject {
  pkgPath: string
  pkgType: SelectedPKGFileType
  pkgSize: number
  dxHash: string | null
  songPackage?: PKGFileSongPackageStatObject
}

export const selectPKGFileToInstall = useHandler(async (win, _, lang: string): Promise<SelectPKGFileReturnObject | false> => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: lang.startsWith('pt') ? 'Arquivo de Pacote do PS3' : lang.startsWith('es') ? '' : 'PS3 Package File', extensions: ['pkg'] }] })
  if (selection.canceled) {
    sendMessage(win, {
      type: 'info',
      module: 'rpcs3',
      method: 'selectPKGFileToInstall',
      code: 'actionCancelledByUser',
    })
    return false
  }
  const [pkgFile] = selection.filePaths.map((file) => pathLikeToFilePath(file))

  let pkgType: SelectedPKGFileType = 'songPackage'
  let dxHash: string | null = null

  const pkg = new PKGFile(pkgFile)
  const stat = await pkg.stat()

  try {
    await pkg.checkFileIntegrity()
  } catch (err) {
    sendMessage(win, {
      type: 'info',
      module: 'rpcs3',
      method: 'selectPKGFileToInstall',
      code: 'invalidFileSignature',
      messageValues: { filePath: pkgFile.path },
    })
    return false
  }

  if (stat.header.cidTitle1 !== 'BLUS30463') {
    sendMessage(win, {
      type: 'info',
      module: 'rpcs3',
      method: 'selectPKGFileToInstall',
      code: 'notRB3PKG',
      messageValues: { filePath: pkgFile.path },
    })
    return false
  }

  if (stat.header.cidTitle2 === 'ROCKBAND3PATCH05') pkgType = 'tu5'
  else if (stat.header.cidTitle2.startsWith('RB3DXNITE')) {
    pkgType = 'dx'
    dxHash = stat.header.cidTitle2.slice(9)
  }

  let songPackage: SelectPKGFileReturnObject['songPackage'] = undefined
  try {
    songPackage = await pkg.songPackageStat()
  } catch (err) {}

  return {
    pkgPath: pkgFile.path,
    pkgType,
    pkgSize: stat.fileSize,
    dxHash,
    songPackage,
  }
})

export const extractPKGFileToTemp = useHandler(async (win, _, pkgFilePath: string) => {})
export const deleteTempPKGFile = useHandler(async (win, _, tempFolderPath: string) => {})
