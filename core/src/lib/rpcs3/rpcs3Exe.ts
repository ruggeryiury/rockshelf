import { pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { getLocaleStringFromRenderer, sendMessage, useHandler } from '../../lib'
import { dialog } from 'electron'

/**
 * Checks if the provided RPCS3 executable file path is valid.
 * - - - -
 * @param {FilePathLikeTypes} rpcs3ExePath The RPCS3 executable file path you want to check.
 * @returns {boolean}
 */
export const isRPCS3ExePathValid = (rpcs3ExePath: FilePathLikeTypes): boolean => {
  let proof = true
  const rpcs3Exe = pathLikeToFilePath(rpcs3ExePath)
  if (!rpcs3Exe.exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" does not exist`)
  if (rpcs3Exe.fullname !== 'rpcs3.exe') proof = false
  if (!rpcs3Exe.gotoFile('avcodec-61.dll').exists) proof = false
  if (!rpcs3Exe.gotoFile('avformat-61.dll').exists) proof = false
  if (!rpcs3Exe.gotoFile('config/games.yml').exists) proof = false

  return proof
}

export const selectRPCS3Exe = useHandler(async (win, _): Promise<string | false> => {
  const rpcs3ExeFilterName = await getLocaleStringFromRenderer(win, 'rpcs3Exe')
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: rpcs3ExeFilterName, extensions: ['exe'] }] })
  if (selection.canceled) {
    sendMessage(win, {
      type: 'info',
      module: 'rpcs3',
      method: 'selectRPCS3Exe',
      code: 'actionCancelledByUser',
    })
    return false
  }
  const [rpcs3Exe] = selection.filePaths.map((file) => pathLikeToFilePath(file))

  if (!isRPCS3ExePathValid(rpcs3Exe)) {
    sendMessage(win, {
      type: 'error',
      module: 'rpcs3',
      method: 'selectRPCS3Exe',
      code: 'invalidExecutable',
      messageValues: { path: rpcs3Exe.path },
    })
    return false
  }
  return rpcs3Exe.path
})
