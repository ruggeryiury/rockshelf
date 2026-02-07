import { type DirPathLikeTypes, pathLikeToDirPath } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'

export interface ExtractSongPackageOptions {
  rootFiles: boolean
  songs: string[]
}

export const extractSongPackage = async (destPath: DirPathLikeTypes, options?: ExtractSongPackageOptions) => {
  await this.checkFileIntegrity()
  const { rootFiles, songs } = useDefaultOptions({ rootFiles: true, songs: [] }, options)
  if (!rootFiles && songs.length === 0) throw new Error('')

  const dest = pathLikeToDirPath(destPath)

  const extractFiles: string[] = []

  if (rootFiles) extractFiles.push('ICON0.PNG', 'PARAM.SFO', 'PS3LOGO.DAT')
  const stat = await this.stat()
  const song = await this.songPackageStat()
  extractFiles.push(`${song.folderName}songs.dta`)

  return extractFiles
}
