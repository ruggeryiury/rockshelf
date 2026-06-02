import { useHandler } from '../core.exports'
import { getSongPackageDescriptionFileFromFolder } from '../lib.exports'

export const getSongPackageDescriptionFileFromFolderHandler = useHandler((_, __, packagePath: string) => getSongPackageDescriptionFileFromFolder(packagePath))
