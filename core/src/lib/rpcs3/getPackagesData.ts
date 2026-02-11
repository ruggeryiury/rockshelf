import { MyObject, parseReadableBytesSize, pathLikeToDirPath } from 'node-lib'
import { useHandlerWithUserConfig } from '../electron-lib/useHandler'
import { EDATFile, RBTools } from 'rbtools'
import type { RB3CompatibleDTAFile } from 'rbtools/lib'

// #region Types

export type GamePackageOriginTypes = 'preRb3DLC' | 'rb3DLC'

export interface InstalledSongPackagesStats {
  /**
   * The name of the package folder.
   */
  name: string
  /**
   * The path of the package.
   */
  packagePath: string
  /**
   * The path of the package DTA file.
   */
  dtaFilePath: string
  /**
   * The game this pack belongs to.
   */
  origin: GamePackageOriginTypes
  /**
   * The size of the package in bytes.
   */
  packageSize: number
  /**
   * The amount of songs inside the package.
   */
  songsCount: number
  /**
   * The possible hash to decrypt its EDAT files.
   */
  devKLic: string
  /**
   * An unique identifier of the package DTA file contents using SHA3-224 hashing algorithm.
   */
  dtaHash: string
  /**
   * An unique identifier of the package contents using SHA3-224 hashing algorithm.
   */
  contentsHash: string
  allIDs: string[]
  allSongnames: string[]
  allSongIDs: (string | number)[]
  /**
   * The string used to calculate `contentsHash`.
   */
  manifest: string
  /**
   * An array with relative paths to all files included in the package.
   */
  files: string[]
  imgData?: string
}

export interface RB3PackagesData {
  /**
   * The amount of songs on the Rock Band 3.
   */
  rb3SongsCount: number
  /**
   * The amount of packs installed on the Rock Band 3 DLC folder.
   */
  rb3DLCPacksCount: number
  /**
   * The amount of songs installed on the Rock Band 3 DLC folder.
   */
  rb3DLCSongsCount: number
  /**
   * The amount of packs installed on the Rock Band 1 DLC folder.
   */
  preRB3DLCPacksCount: number
  /**
   * The amount of songs installed on the Rock Band 1 DLC folder.
   */
  preRB3DLCSongsCount: number
  /**
   * The amount of packs installed that works on both all main Rock Band titles.
   */
  allPacksCount: number
  /**
   * The amount of songs installed that works on both all main Rock Band titles.
   */
  allSongsCount: number
  /**
   * The amount of packs installed that works on both all main Rock Band titles, including the 83 songs from Rock Band 3.
   */
  allSongsCountWithRB3Songs: number
  /**
   * The amount of stars that can be earned for each song.
   */
  starsCount: number
  /**
   * An array with information about all song packages installed.
   */
  packages: InstalledSongPackagesStats[]
}

export const getPackagesData = useHandlerWithUserConfig(async (win, _, { devhdd0Path }): Promise<RB3PackagesData> => {
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  const packages: InstalledSongPackagesStats[] = []

  let rb3DLCPacksCount = 0,
    rb3DLCSongsCount = 0,
    preRB3DLCPacksCount = 0,
    preRB3DLCSongsCount = 0

  const rb3SongsJSON = await RBTools.dbFolder.gotoFile('rb3.json').readJSON<RB3CompatibleDTAFile[]>()
  const rb3 = new MyObject<InstalledSongPackagesStats>({
    name: 'Rock Band 3',
    packagePath: '_ark/songs',
    dtaFilePath: '_ark/songs/songs.dta',
    origin: 'rb3DLC',
    packageSize: parseReadableBytesSize('2.38GB'),
    songsCount: rb3SongsJSON.length,
    devKLic: EDATFile.genDevKLicHash('RB3-Rock-Band-3-Export'),
    dtaHash: Buffer.alloc(56 / 2).toString('hex'),
    contentsHash: Buffer.alloc(56 / 2).toString('hex'),
    allIDs: rb3SongsJSON.map((song) => song.id).toSorted(),
    allSongnames: rb3SongsJSON.map((song) => song.songname).toSorted(),
    allSongIDs: rb3SongsJSON.map((song) => song.song_id).toSorted(),
    manifest: '',
    files: [],
  })
  packages.push(rb3.toJSON())

  const value = new MyObject<RB3PackagesData>()
  const rb3SongsCount = 83
  const allPacksCount = preRB3DLCPacksCount + rb3DLCPacksCount
  const allSongsCount = preRB3DLCSongsCount + rb3DLCSongsCount
  const allSongsCountWithRB3Songs = allSongsCount + rb3SongsCount
  const starsCount = allSongsCountWithRB3Songs * 5

  value.setMany({
    rb3SongsCount,
    preRB3DLCPacksCount,
    preRB3DLCSongsCount,
    rb3DLCPacksCount,
    rb3DLCSongsCount,
    allPacksCount,
    allSongsCount,
    allSongsCountWithRB3Songs,
    starsCount,
    packages,
  })

  return value.toJSON()
})
