import { createHashFromBuffer, DirPath, FilePath, MyObject, parseReadableBytesSize, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import { getRB1USRDIR, getRB3USRDIR, getRockshelfModuleRootDir } from '../../core.exports'
import { createRSPackImage, parseRSPackImageFile, type ParsedRSPackImageObject } from '../../lib.exports'
import { temporaryFile } from 'tempy'
import { RBTools, EDATFile, DTAParser, TextureFile } from '../rbtools'
import { type RB3CompatibleDTAFile, type OfficialSongPackageStats, type RPCS3SongPackageStatsOptions, isRPCS3Devhdd0PathValid, rpcs3GenSongPackageManifest, getOfficialSongPackageStatsFromHash } from '../rbtools/lib.exports'

// #region Types

export interface RPCS3SongPackagesObjectExtra {
  /**
   * The folder name of the song package.
   */
  name: string
  /**
   * The path to the song package folder name.
   */
  path: string
  /**
   * The source of the package thumbnail file
   */
  thumbnailSrc: string
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
   * An object with values that will be used exclusively on Rockshelf.
   */
  packageData: ParsedRSPackImageObject
  /**
   * An object with known properties of the official song package where the installed song package belongs to. The value might be `undefined` if the song package contents hash does not match any official song package contents hash.
   */
  official?: OfficialSongPackageStats

  // Rockshelf
}

export interface RPCS3SongPackagesDataExtra {
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
  packages: RPCS3SongPackagesObjectExtra[]
  /**
   * An array with paths to packages where the DTA parsing process went wrong
   */
  parsingErrors: string[]
}

// #region Functions

/**
 * Returns an object with statistics of installed Rock Band song packages on RPCS3 emulator.
 * - - - -
 * @param {DirPathLikeTypes} devhdd0Path The path to the `dev_hdd0` folder of your RPCS3 installation.
 * @param {RPCS3SongPackageStatsOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the stat data fetching process.
 * @returns {Promise<RPCS3SongPackagesData>}
 */
export const rpcs3GetSongPackagesStatsExtra = async (devhdd0Path: DirPathLikeTypes, options?: RPCS3SongPackageStatsOptions): Promise<RPCS3SongPackagesDataExtra> => {
  const { excludeRB3Songs } = useDefaultOptions<RPCS3SongPackageStatsOptions>({ excludeRB3Songs: false }, options)
  const devhdd0 = isRPCS3Devhdd0PathValid(devhdd0Path)

  const packages: RPCS3SongPackagesObjectExtra[] = []
  const parsingErrors: string[] = []

  if (!excludeRB3Songs) {
    const rb3SongsJSON = await RBTools.dbFolder.gotoFile('rb3.json').readJSON<RB3CompatibleDTAFile[]>()
    const rb3Pack = new MyObject<RPCS3SongPackagesObjectExtra>({
      name: 'Rock Band 3',
      path: '_ark/songs',
      thumbnailSrc: 'rbicons://rb3',
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
      packageData: {
        fileVersion: 1,
        packageName: 'Rock Band 3',
        source: 'pkg',
        type: 'other',
        encryptionStatus: 'unknown',
      },
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

  const rb3UsrDir = getRB3USRDIR(devhdd0)
  if (rb3UsrDir.exists) {
    const allRB3PackagesFolder = (await rb3UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'custom_textures') as DirPath[]

    if (allRB3PackagesFolder.length > 0) {
      for (const packagePath of allRB3PackagesFolder) {
        const dtaFilePath = packagePath.gotoFile('songs/songs.dta')

        if (!dtaFilePath.exists) continue

        let parsedData: DTAParser
        try {
          parsedData = await DTAParser.fromFile(dtaFilePath)
        } catch (err) {
          parsingErrors.push(`BLUS30463/USRDIR/${packagePath.name}`)
          continue
        }

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

        const thumbnailSrc = packagePath.gotoFile('folder.jpg')
        let packageData: ParsedRSPackImageObject

        if (!thumbnailSrc.exists) {
          if (parsedData.songs.length === 1 && !official) {
            const onlySong = parsedData.songs[0]
            const texture = new TextureFile(packagePath.gotoFile(`songs/${onlySong.songname}/gen/${onlySong.songname}_keep.png_ps3`))
            if (texture.path.exists) {
              const temp = await texture.convertToImage(temporaryFile({ extension: '.jpg' }), 'jpg')
              packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: `${onlySong.name} - ${onlySong.artist}` }
              await createRSPackImage(temp.path, thumbnailSrc, packageData)
              await temp.path.delete()
            } else {
              const newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

              packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: packagePath.name }
              await createRSPackImage(newPackageImage, thumbnailSrc, packageData)
            }
          } else {
            let newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
            if (!newPackageImage.exists) newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

            packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: official?.name || packagePath.name }
            await createRSPackImage(newPackageImage, thumbnailSrc, packageData)
          }
        } else {
          packageData = await parseRSPackImageFile(thumbnailSrc)
        }

        const pack = new MyObject<RPCS3SongPackagesObjectExtra>({
          name: packagePath.name,
          path: packagePath.path,
          thumbnailSrc: `rb3packimg://${encodeURIComponent(packagePath.name)}`,
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
          packageData,
          official,
        })

        packages.push(pack.toJSON())
      }
    }
  }

  const rb1UsrDir = getRB1USRDIR(devhdd0)
  if (rb1UsrDir.exists) {
    const allRB1PackagesFolder = (await rb1UsrDir.readDir()).filter((entry) => entry instanceof DirPath && entry.name !== 'gen' && entry.name !== 'CCF0099') as DirPath[]

    if (allRB1PackagesFolder.length > 0) {
      for (const packagePath of allRB1PackagesFolder) {
        const dtaFilePath = packagePath.gotoFile('songs/songs.dta')

        if (!dtaFilePath.exists) continue

        let parsedData: DTAParser
        try {
          parsedData = await DTAParser.fromFile(dtaFilePath)
        } catch (err) {
          parsingErrors.push(`BLUS30050/USRDIR/${packagePath.name}`)
          continue
        }
        await parsedData.applyDXUpdatesOnSongs(true)

        if (parsedData.songs.length === 0) continue
        parsedData.sort('ID')

        const devklic = EDATFile.genDevKLicHash(packagePath.name)
        const { manifest, packageSize, packageFiles } = await rpcs3GenSongPackageManifest(packagePath)
        const contentsHash = createHashFromBuffer(Buffer.from(manifest))
        const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)

        // Comment the next line if you want to see the extracted RPCS3 of unknown RB1 packages
        if (!official) continue
        if (official?.isDuplicatedForRB3) continue

        rb1PackagesCount++
        rb1PackagesSongsCount += parsedData.songs.length
        allPackagesSize += packageSize

        const songsCount = parsedData.songs.length
        if (songsCount === 0) continue
        const entriesIDs = parsedData.songs.map((song) => song.id).toSorted()
        const songnames = parsedData.songs.map((song) => song.songname).toSorted()
        const songIDs = parsedData.songs.map((song) => song.song_id).toSorted()

        const thumbnailSrc = packagePath.gotoFile('folder.jpg')
        let packageData: ParsedRSPackImageObject

        if (!thumbnailSrc.exists) {
          if (parsedData.songs.length === 1 && !official) {
            const onlySong = parsedData.songs[0]
            const texture = new TextureFile(packagePath.gotoFile(`songs/${onlySong.songname}/gen/${onlySong.songname}_keep.png_ps3`))
            if (texture.path.exists) {
              const temp = await texture.convertToImage(temporaryFile({ extension: '.jpg' }), 'jpg')
              packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: `${onlySong.name} - ${onlySong.artist}` }
              await createRSPackImage(temp.path, thumbnailSrc, packageData)
              await temp.path.delete()
            } else {
              const newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

              packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: packagePath.name }
              await createRSPackImage(newPackageImage, thumbnailSrc, packageData)
            }
          } else {
            let newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
            if (!newPackageImage.exists) newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

            packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: official?.name || packagePath.name }
            await createRSPackImage(newPackageImage, thumbnailSrc, packageData)
          }
        } else {
          packageData = await parseRSPackImageFile(thumbnailSrc)
        }

        const pack = new MyObject<RPCS3SongPackagesObjectExtra>({
          name: packagePath.name,
          path: packagePath.path,
          thumbnailSrc: `rb1packimg://${packagePath.name}`,
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
          packageData,
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

  const obj = new MyObject<RPCS3SongPackagesDataExtra>({
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
    parsingErrors,
  })

  return obj.toJSON()
}
