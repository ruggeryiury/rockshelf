import { createHashFromBuffer, pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { DTAParser, EDATFile } from 'rbtools'
import { getOfficialSongPackageStatsFromHash, rpcs3GenSongPackageManifest } from 'rbtools/lib'
import { getRockshelfModuleRootDir } from '../../core.exports'
import { createRSPackImageV1, parseRSPackImageFile, type RPCS3SongPackagesObjectExtra, type RSPackImageV1Object } from '../../lib.exports'

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
  let packageData: RSPackImageV1Object

  if (!thumbnailSrc.exists) {
    let newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/${official?.code}.jpg`)
    if (!newPackageImage.exists) newPackageImage = getRockshelfModuleRootDir().gotoFile(`bin/icons/custom.jpg`)

    packageData = { fileVersion: 1, installationSrc: 'merged', installationType: 'other', packageName: official?.name || packageDir.name }
    await createRSPackImageV1(newPackageImage, thumbnailSrc, packageData)
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
