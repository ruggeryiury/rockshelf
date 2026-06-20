import { pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import type { Stats } from 'node:fs'

export interface SongFilesSizeObject {
  moggFilePath: string
  mogg: number
  midiFilePath: string
  midi: number
  artworkFilePath: string
  artwork: number
  miloFilePath: string
  milo: number
  totalSize: number
}

export const calculateSongFilesSizeFromSongname = async (packageDirPath: DirPathLikeTypes, songname: string): Promise<SongFilesSizeObject> => {
  const packagePath = pathLikeToDirPath(packageDirPath)
  const songPath = packagePath.gotoDir(`songs/${songname}`)

  if (!songPath.exists) throw new Error(`No song files found for song with internal name "${songname}" inside the song package "${packagePath.name}".`)

  let totalSize: number = 0

  const moggFilePath = songPath.gotoFile(`${songname}.mogg`)
  const moggStat = await moggFilePath.stat()
  totalSize += moggStat.size

  const midiFilePath = songPath.gotoFile(`${songname}.mid.edat`)
  const midiStat = await midiFilePath.stat()
  totalSize += midiStat.size

  const artworkFilePath = songPath.gotoFile(`gen/${songname}_keep.png_ps3`)
  let artworkStat: Stats | undefined
  if (artworkFilePath.exists) {
    artworkStat = await artworkFilePath.stat()
    totalSize += artworkStat.size
  }

  const miloFilePath = songPath.gotoFile(`gen/${songname}.milo_ps3`)
  const miloStat = await miloFilePath.stat()
  totalSize += miloStat.size

  return {
    moggFilePath: moggFilePath.path,
    mogg: moggStat.size,
    midiFilePath: midiFilePath.path,
    midi: midiStat.size,
    artworkFilePath: artworkFilePath.path,
    artwork: artworkStat?.size ?? 0,
    miloFilePath: miloFilePath.path,
    milo: miloStat.size,
    totalSize,
  }
}
