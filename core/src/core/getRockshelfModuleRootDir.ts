import { thisFilePath } from 'rbtools/lib'

export const getRockshelfModuleRootDir = () => thisFilePath(import.meta.url).gotoDir('../')
