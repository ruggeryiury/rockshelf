import { DirPath, pathLikeToFilePath } from 'node-lib'
import { RockshelfFileSystemAPI, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { getSongPackageStatsFromFolder, rpcs3GetSongPackagesStatsExtra, type RPCS3SongPackagesDataExtra } from '../lib.exports'
import { utimes } from 'node:fs/promises'
import { DTAParser } from '../lib/rbtools'

export const batchDeleteSongs = useHandler(async (win, _, pkgIndex: number, songs: string[]): Promise<false | RPCS3SongPackagesDataExtra> => {
  const cache = RockshelfFileSystemAPI.packagesCacheFile()
  if (!cache.exists) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }
  const cacheContents = await cache.readJSON<RPCS3SongPackagesDataExtra>()
  if (typeof cacheContents !== 'object' || (typeof cacheContents === 'object' && cacheContents === null)) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }

  if (!(pkgIndex in cacheContents.packages)) {
    sendDialog(win, 'corruptedPackagesCache')
    return false
  }
  const { path } = cacheContents.packages[pkgIndex]
  const pkgPath = DirPath.of(path)

  if (!pkgPath.exists) {
    sendMessageBox(win, { type: 'error', code: 'editPackageDataPackageNotFound' })
    return false
  }

  const dtaPath = pathLikeToFilePath(cacheContents.packages[pkgIndex].dtaFilePath)
  const oldDTASize = (await dtaPath.stat()).size
  const parser = await DTAParser.fromFile(dtaPath)

  const firstSelectedSong = cacheContents.packages[pkgIndex].songs.find((val) => val.songname === songs[0])
  if (songs.length === 1) {
    if (!firstSelectedSong) {
      sendMessageBox(win, { type: 'error', code: 'batchDeleteSongs' })
      return false
    }
    sendMessageBox(win, { type: 'loading', code: 'batchDeleteSongsIndividual', messageValues: { name: firstSelectedSong.name } })
  } else sendMessageBox(win, { type: 'loading', code: 'batchDeleteSongs', messageValues: { songsCount: songs.length } })

  let songsDeleted = 0,
    sizeRemoved = 0
  for (const song of songs) {
    const songFolder = pkgPath.gotoDir(`songs/${song}`)
    if (songFolder.exists) {
      for (const file of (await songFolder.readDir(true)).toReversed()) {
        const stat = await file.stat()
        sizeRemoved += stat.size
      }

      await songFolder.deleteDir(true)
    }

    songsDeleted++
  }

  parser.removeSongs(songs, 'songname')

  parser.sort('ID')
  parser.patchInvalidValues()
  parser.patchCores()
  parser.patchSongsEncodings()
  parser.patchIDs()
  await parser.export(dtaPath)

  const newDTASize = (await dtaPath.stat()).size

  cacheContents.allPackagesSize -= sizeRemoved + (oldDTASize - newDTASize)
  cacheContents.allSongsCount -= songsDeleted
  cacheContents.allSongsPlusRB3 -= songsDeleted
  if (cacheContents.packages[pkgIndex].packageType === 'rb1') cacheContents.rb1PackagesSongsCount -= songsDeleted
  else cacheContents.rb3PackagesSongsCount -= songsDeleted

  const newPkg = await getSongPackageStatsFromFolder(path)
  if (newPkg) cacheContents.packages[pkgIndex] = newPkg

  await cache.write(JSON.stringify(cacheContents))
  const now = new Date()
  await utimes(cache.path, now, now)

  if (songs.length === 1) {
    if (!firstSelectedSong) {
      sendMessageBox(win, { type: 'error', code: 'batchDeleteSongs' })
      return false
    }
    sendMessageBox(win, { type: 'success', code: 'batchDeleteSongsIndividual', messageValues: { name: firstSelectedSong.name } })
  } else sendMessageBox(win, { type: 'success', code: 'batchDeleteSongs', messageValues: { songsCount: songs.length } })

  return cacheContents
})
