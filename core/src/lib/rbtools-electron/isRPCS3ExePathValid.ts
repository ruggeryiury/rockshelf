import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { sendErrorMessage } from '../electron-lib/sendErrorMessage'

export const isRPCS3ExePathValid = (win: BrowserWindow, __: IpcMainInvokeEvent, rpcs3exePath: FilePathLikeTypes): boolean => {
  let proof = true
  const exe = pathLikeToFilePath(rpcs3exePath)
  if (exe.fullname !== 'rpcs3.exe') proof = false

  const avcodec61 = exe.gotoFile('avcodec-61.dll')
  if (!avcodec61.exists) proof = false
  const avformat61 = exe.gotoFile('avformat-61.dll')
  if (!avformat61.exists) proof = false

  const gamesConfig = exe.gotoFile('config/games.yml')
  if (!gamesConfig.exists) proof = false

  if (!proof)
    return sendErrorMessage(win, {
      type: 'error',
      module: 'rbtools',
      method: 'isRPCS3ExePathValid',
      code: 'invalid_rpcs3exe_path',
      message: `Provided RPCS3 Executable file path "${exe.path}" is invalid`,
      messageValues: {
        rpcs3exe: exe.path,
      },
    })
  return proof
}
