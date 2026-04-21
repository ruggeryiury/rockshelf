import { createHashFromBuffer, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { getRockshelfModuleRootDir } from '../../core.exports'
import { createRSPackImage, parseRSPackImageFile, type RPCS3SongPackagesObjectExtra, type ParsedRSPackImageObject } from '../../lib.exports'
import { temporaryFile } from 'tempy'
import { DTAParser, EDATFile, TextureFile } from '../rbtools'
import { rpcs3GenSongPackageManifest, getOfficialSongPackageStatsFromHash } from '../rbtools/lib.exports'

export const getSongPackageStatsFromFolder = async (packagePath: DirPathLikeTypes): Promise<RPCS3SongPackagesObjectExtra | undefined> => {
  const packageDir = pathLikeToDirPath(packagePath)
  const dtaFilePath = packageDir.gotoFile('songs/songs.dta')

  if (!dtaFilePath.exists) return

  let parsedData: DTAParser
  try {
    parsedData = await DTAParser.fromFile(dtaFilePath)
  } catch (err) {
    return
  }

  parsedData.sort('ID')

  const devklic = EDATFile.genDevKLicHash(packageDir.name)
  const { manifest, packageSize, packageFiles } = await rpcs3GenSongPackageManifest(packageDir)
  const contentsHash = createHashFromBuffer(Buffer.from(manifest))
  const official = getOfficialSongPackageStatsFromHash('extractedRPCS3', contentsHash)
  if (official?.isDuplicatedForRB3) return

  const songsCount = parsedData.songs.length
  const entriesIDs = parsedData.songs.map((song) => song.id).toSorted()
  const songnames = parsedData.songs.map((song) => song.songname).toSorted()
  const songIDs = parsedData.songs.map((song) => song.song_id).toSorted()

  const thumbnailSrc = packageDir.gotoFile('folder.jpg')
  let packageData: ParsedRSPackImageObject

  if (!thumbnailSrc.exists) {
    if (parsedData.songs.length === 1) {
      const onlySong = parsedData.songs[0]
      const texture = new TextureFile(packageDir.gotoFile(`songs/${onlySong.songname}/gen/${onlySong.songname}_keep.png_ps3`))
      if (texture.path.exists) {
        const temp = await texture.convertToImage(temporaryFile({ extension: '.jpg' }), 'jpg')
        packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: `${onlySong.name} - ${onlySong.artist}` }
        await createRSPackImage(temp.path, thumbnailSrc, packageData)
        await temp.path.delete()
      } else {
        let newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
        if (!newPackageImage.exists) newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

        packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: official?.name || packageDir.name }
        await createRSPackImage(newPackageImage, thumbnailSrc, packageData)
      }
    } else {
      let newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
      if (!newPackageImage.exists) newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

      packageData = { fileVersion: 1, source: 'merged', type: 'other', encryptionStatus: 'unknown', packageName: official?.name || packageDir.name }
      await createRSPackImage(newPackageImage, thumbnailSrc, packageData)
    }
  } else {
    packageData = await parseRSPackImageFile(thumbnailSrc)
  }

  return {
    name: packageDir.name,
    path: packageDir.path,
    thumbnailSrc: `rb3packimg://${packageDir.name}`,
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
  } as RPCS3SongPackagesObjectExtra
}
