import { FilePath, type FilePathLikeTypes, pathLikeToFilePath } from 'node-lib'

/**
 * Checks if the provided RPCS3 executable file path is valid. Returns an `FilePath` instance of the provided path.
 * - - - -
 * @param {FilePathLikeTypes} rpcs3ExePath The path to the RPCS3 executable file.
 * @returns {FilePath}
 * @throws {Error} If the provided path does not match the expected structure of the RPCS3 main files, or if it does not exist.
 */
export const isRPCS3ExePathValid = (rpcs3ExePath: FilePathLikeTypes): FilePath => {
  const rpcs3Exe = pathLikeToFilePath(rpcs3ExePath)
  if (!rpcs3Exe.exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" does not exist.`)
  if (rpcs3Exe.fullname !== 'rpcs3.exe') throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" has invalid filename.`)
  if (!rpcs3Exe.gotoFile('avcodec-61.dll').exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required DLL file "avcodec-61.dll".`)
  if (!rpcs3Exe.gotoFile('avformat-61.dll').exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required DLL file "avformat-61.dll".`)
  if (!rpcs3Exe.gotoFile('config/games.yml').exists) throw new Error(`Provided RPCS3 Executable file path "${rpcs3Exe.path}" is missing required configuration file "config/games.yml".`)

  return rpcs3Exe
}
