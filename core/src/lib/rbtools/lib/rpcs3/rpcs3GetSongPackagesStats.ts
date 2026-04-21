import { createHashFromBuffer, DirPath, FilePath, MyObject, parseReadableBytesSize, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { DTAParser, EDATFile, RBTools } from '../../core.exports'
import { getOfficialSongPackageStatsFromHash, isRPCS3Devhdd0PathValid, type OfficialSongPackageStats, type RB3CompatibleDTAFile } from '../../lib.exports'
import { useDefaultOptions } from 'use-default-options'

export interface RPCS3SongPackagesObject {
  /**
   * The folder name of the song package.
   */
  name: string
  /**
   * The path to the song package folder name.
   */
  path: string
  /**
   * The game where the song package is installed.
   */
  packageType: 'rb3' | 'rb1'
  /**
   * The path to the song package DTA file.
   */
  dtaFilePath: string
  /**
   * The size of the song package.
   */
  packageSize: number
  /**
   * The amount of songs available on the song package.
   */
  songsCount: number
  /**
   * A 16-bytes hash used to decrypt the song package's EDAT files.
   */
  devklic: string
  /**
   * A SHA256 hash of the song package contents.
   */
  contentsHash: string
  /**
   * An array with parsed songs objects of the song package.
   */
  songs: RB3CompatibleDTAFile[]
  /**
   * An array with all song's entry IDs.
   */
  entriesIDs: string[]
  /**
   * An array with all song's internal names.
   */
  songnames: string[]
  /**
   * An array with all song's IDs (can have non-numerical IDs).
   */
  songIDs: (string | number)[]
  // manifest: string
  /**
   * An array with relative paths of all package files (excluding the song package's DTA file itself).
   */
  packageFiles: string[]
  /**
   * An object with known properties of the official song package where the installed song package belongs to. The value might be `undefined` if the song package contents hash does not match any official song package contents hash.
   */
  official: OfficialSongPackageStats | undefined
}

export interface RPCS3SongPackagesData {
  /**
   * The amount of songs from the Rock Band 3 alone. Always `83`.
   */
  rb3SongsCount: number
  /**
   * The amount of song packages installed on the Rock Band 1's USRDIR folder.
   */
  rb1PackagesCount: number
  /**
   * The amount of songs installed on the Rock Band 1's USRDIR folder.
   */
  rb1PackagesSongsCount: number
  /**
   * The amount of song packages installed on the Rock Band 3's USRDIR folder.
   */
  rb3PackagesCount: number
  /**
   * The amount of songs installed on the Rock Band 3's USRDIR folder.
   */
  rb3PackagesSongsCount: number
  /**
   * The amount of song packages installed on all Rock Band title's USRDIR folders.
   */
  allPackagesCount: number
  /**
   * The amount of songs installed on all Rock Band title's USRDIR folders.
   */
  allSongsCount: number
  /**
   * The amount of songs installed on all Rock Band title's USRDIR folders, including the 83 songs from Rock Band 3.
   */
  allSongsPlusRB3: number
  /**
   * The amount of stars that can be earned from all songs.
   */
  starsCount: number
  /**
   * The size in bytes of all song packages combined.
   */
  allPackagesSize: number
  /**
   * An array with objects that represents an installed song package and its properties.
   */
  packages: RPCS3SongPackagesObject[]
}

export interface RPCS3PackageFilesManifestData {
  /**
   * A string with the name and size of all files formatted to create contents hash from it.
   */
  manifest: string
  /**
   * The size of all files from the package.
   */
  packageSize: number
  /**
   * An array with relative paths of all package files (excluding the song package's DTA file itself).
   */
  packageFiles: string[]
}

/**
 * Generates a manifest string with name and size of all files from an installed song package.
 * - - - -
 * @param {DirPathLikeTypes} packageDirPath The path to the installed song package to generate the manifest string from.
 * @returns {Promise<RPCS3PackageFilesManifestData>}
 */
export const rpcs3GenSongPackageManifest = async (packageDirPath: DirPathLikeTypes): Promise<RPCS3PackageFilesManifestData> => {
  const packagePath = pathLikeToDirPath(packageDirPath)
  const insideSongsFolderPath = packagePath.gotoDir('songs').path
  const files = (await packagePath.gotoDir('songs').readDir(true))
    .filter((entry) => entry instanceof FilePath)
    .map((entry) => entry.path.slice(packagePath.gotoDir('songs').path.length + 1).replace(/\\/g, '/'))
    .toReversed()
    .filter((val) => val !== 'songs.dta' && val !== 'folder.jpg')
    .map((file) => FilePath.of(insideSongsFolderPath, file))
  let manifest = ''
  let packageSize = 0
  let i = 0

  for (const file of files) {
    const fileStat = await file.stat()
    manifest += `| file=${files[i].path.slice(insideSongsFolderPath.length + 1).replace(/\\/g, '/')} | size=${fileStat.size}\n`
    packageSize += fileStat.size
    i++
  }

  return { manifest, packageSize, packageFiles: files.map((file) => file.path) }
}

export interface RPCS3SongPackageStatsOptions {
  /**
   * Excludes the Rock Band 3 on-disc song package. Default is `false`.
   */
  excludeRB3Songs?: boolean
}

/**
 * Returns an object with statistics of installed Rock Band song packages on RPCS3 emulator.
 * - - - -
 * @param {DirPathLikeTypes} devhdd0Path The path to the `dev_hdd0` folder of your RPCS3 installation.
 * @param {RPCS3SongPackageStatsOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the stat data fetching process.
 * @returns {Promise<RPCS3SongPackagesData>}
 */
export const rpcs3GetSongPackagesStats = async (devhdd0Path: DirPathLikeTypes, options?: RPCS3SongPackageStatsOptions): Promise<RPCS3SongPackagesData> => {
  const { excludeRB3Songs } = useDefaultOptions<RPCS3SongPackageStatsOptions>({ excludeRB3Songs: false }, options)
  const devhdd0 = isRPCS3Devhdd0PathValid(devhdd0Path)

  const packages: RPCS3SongPackagesObject[] = []

  if (!excludeRB3Songs) {
    const rb3SongsJSON = await RBTools.dbFolder.gotoFile('rb3.json').readJSON<RB3CompatibleDTAFile[]>()
    const rb3Pack = new MyObject<RPCS3SongPackagesObject>({
      name: 'Rock Band 3',
      path: '_ark/songs',
      packageType: 'rb3',
      dtaFilePath: '_ark/songs/songs.dta',
      packageSize: parseReadableBytesSize('2.38GB'),
      songsCount: rb3SongsJSON.length,
      devklic: EDATFile.genDevKLicHash('_ark/songs'),
      contentsHash: Buffer.alloc(28).toString('hex'),
      songs: rb3SongsJSON,
      entriesIDs: rb3SongsJSON.map((song) => song.id).toSorted(),
      songnames: rb3SongsJSON.map((song) => song.songname).toSorted(),
      songIDs: rb3SongsJSON.map((song) => song.song_id).toSorted(),
      packageFiles: [],
      official: {
        name: 'Rock Band 3',
        code: 'rb3',
        outdated: false,
        folderName: '_ark/songs',
        packageType: 'rb3',
        hashes: {
          extractedRPCS3: '',
          pkg: '',
          stfs: '',
        },
      },
    })

    packages.push(rb3Pack.toJSON())
  }

  let rb1PackagesSongsCount = 0,
    rb1PackagesCount = 0,
    rb3PackagesSongsCount = 0,
    rb3PackagesCount = 0,
    allPackagesSize = 0

  const rb3UsrDir = devhdd0.gotoDir('game/BLUS30463/USRDIR')
  if (rb3UsrDir.exists) {
    const allRB3PackagesFolder = (await rb3UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'custom_textures') as DirPath[]

    if (allRB3PackagesFolder.length > 0) {
      for (const packagePath of allRB3PackagesFolder) {
        const dtaFilePath = packagePath.gotoFile('songs/songs.dta')

        if (!dtaFilePath.exists) continue

        const parsedData = await DTAParser.fromFile(dtaFilePath)
        parsedData.sort('ID')

        const devklic = EDATFile.genDevKLicHash(packagePath.name)
        const { manifest, packageSize, packageFiles } = await rpcs3GenSongPackageManifest(packagePath)
        const contentsHash = createHashFromBuffer(Buffer.from(manifest))
        const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)
        if (official?.isDuplicatedForRB3) continue
        rb3PackagesCount++
        rb3PackagesSongsCount += parsedData.songs.length
        allPackagesSize += packageSize

        const songsCount = parsedData.songs.length
        if (songsCount === 0) continue
        const entriesIDs = parsedData.songs.map((song) => song.id).toSorted()
        const songnames = parsedData.songs.map((song) => song.songname).toSorted()
        const songIDs = parsedData.songs.map((song) => song.song_id).toSorted()

        const pack = new MyObject<RPCS3SongPackagesObject>({
          name: packagePath.name,
          path: packagePath.path,
          packageType: 'rb3',
          dtaFilePath: dtaFilePath.path,
          packageSize,
          songsCount,
          devklic,
          contentsHash,
          songs: parsedData.songs,
          entriesIDs,
          songnames,
          songIDs,
          packageFiles,
          official,
        })

        packages.push(pack.toJSON())
      }
    }
  }

  const rb1UsrDir = devhdd0.gotoDir('game/BLUS30050/USRDIR')
  if (rb1UsrDir.exists) {
    const allRB1PackagesFolder = (await rb1UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'CCF0099') as DirPath[]

    if (allRB1PackagesFolder.length > 0) {
      for (const packagePath of allRB1PackagesFolder) {
        const dtaFilePath = packagePath.gotoFile('songs/songs.dta')

        if (!dtaFilePath.exists) continue

        const parsedData = await DTAParser.fromFile(dtaFilePath)
        await parsedData.applyDXUpdatesOnSongs(true)

        if (parsedData.songs.length === 0) continue
        parsedData.sort('ID')

        const devklic = EDATFile.genDevKLicHash(packagePath.name)
        const { manifest, packageSize, packageFiles } = await rpcs3GenSongPackageManifest(packagePath)
        const contentsHash = createHashFromBuffer(Buffer.from(manifest))
        const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)

        // Comment the next line if you want to see the extracted RPCS3 of unknown RB1 packages
        // if (!official) continue
        // if (official?.isDuplicatedForRB3) continue

        rb1PackagesCount++
        rb1PackagesSongsCount += parsedData.songs.length
        allPackagesSize += packageSize

        const songsCount = parsedData.songs.length
        if (songsCount === 0) continue
        const entriesIDs = parsedData.songs.map((song) => song.id).toSorted()
        const songnames = parsedData.songs.map((song) => song.songname).toSorted()
        const songIDs = parsedData.songs.map((song) => song.song_id).toSorted()

        const pack = new MyObject<RPCS3SongPackagesObject>({
          name: packagePath.name,
          path: packagePath.path,
          packageType: 'rb1',
          dtaFilePath: dtaFilePath.path,
          packageSize,
          songsCount,
          devklic,
          contentsHash,
          songs: parsedData.songs,
          entriesIDs,
          songnames,
          songIDs,
          packageFiles,
          official,
        })

        packages.push(pack.toJSON())
      }
    }
  }

  const rb3SongsCount = 83
  const allPackagesCount = rb1PackagesCount + rb3PackagesCount
  const allSongsCount = rb1PackagesSongsCount + rb3PackagesSongsCount
  const allSongsPlusRB3 = allSongsCount + rb3SongsCount
  const starsCount = allSongsPlusRB3 * 5

  const obj = new MyObject<RPCS3SongPackagesData>({
    rb3SongsCount,
    rb1PackagesCount,
    rb1PackagesSongsCount,
    rb3PackagesCount,
    rb3PackagesSongsCount,
    allPackagesCount,
    allSongsCount,
    allSongsPlusRB3,
    starsCount,

    allPackagesSize,
    packages,
  })

  return obj.toJSON()
}
