import { useHandler } from '../core.exports'
import { createRB3FileFromRPCS3PackageFolder, type CreateRB3FileOptions } from '../lib.exports'

export const exportPackage = useHandler(async (win, _, packagePath: string, destPath: string, options?: CreateRB3FileOptions) => {
  await createRB3FileFromRPCS3PackageFolder(win, packagePath, destPath, options)
  return true
})
