import { execAsync, pathLikeToFilePath, type FilePath, type FilePathLikeTypes } from 'node-lib'
import { temporaryFile } from 'tempy'
import type { CropImageCoordinatesObject } from '../../lib.exports'
import { getRockshelfModuleRootDir } from '../../core.exports'
import { PythonAPI } from '../rbtools'

export const cropImageToTempPNG = async (imgSrcPath: FilePathLikeTypes, cropOptions: CropImageCoordinatesObject): Promise<FilePath> => {
  const src = pathLikeToFilePath(imgSrcPath)
  const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
  const pyScriptPath = getRockshelfModuleRootDir().gotoFile('bin/python/crop_image.py')

  const command = `${PythonAPI.getPythonExecName()} "${pyScriptPath.fullname}" "${src.path}" "${tempPNG.path}" --crop_x ${cropOptions.x} --crop_width ${cropOptions.width} --crop_y ${cropOptions.y} --crop_height ${cropOptions.height} --mode ${cropOptions.mode ?? 'stretch'}`
  console.log(command)
  const { stderr } = await execAsync(command, { windowsHide: true, cwd: pyScriptPath.root })
  if (stderr) throw new Error(stderr)

  return tempPNG
}
