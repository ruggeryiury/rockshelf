import { dialog } from 'electron'
import { pathLikeToFilePath } from 'node-lib'
import { useHandler } from '../electron-lib/useHandler'
import { sendMessage } from '../../lib'

export type SelectedPKGFileType = 'tu5' | 'dx' | 'unknown'
export interface SelectPKGFileReturnObject {
  pkgPath: string
  pkgType: SelectedPKGFileType
  dxHash: string | null
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

  let pkgType: SelectedPKGFileType = 'unknown'
  let dxHash: string | null = null

  if (pkgFile.name === 'UP8802-BLUS30463_00-ROCKBAND3PATCH05-A0105-V0100-PE') pkgType = 'tu5'
  else if (pkgFile.name.startsWith('UP8802-BLUS30463_00-RB3DXNITE')) {
    pkgType = 'dx'
    dxHash = pkgFile.name.slice(29)
  }

  const reader = await pkgFile.openReader()
  const magic = await reader.readHex(0x04)

  if (magic !== '0x7f504b47') {
    sendMessage(win, {
      type: 'info',
      module: 'rpcs3',
      method: 'selectPKGFileToInstall',
      code: 'invalidFileSignature',
      messageValues: { filePath: pkgFile.path },
    })
    return false
  }

  await reader.close()
  return {
    pkgPath: pkgFile.path,
    pkgType,
    dxHash,
  }
})

export const extractPKGFileToTemp = useHandler(async (win, _, pkgFilePath: string) => {})
export const deleteTempPKGFile = useHandler(async (win, _, tempFolderPath: string) => {})
