import { DirPath } from 'node-lib'
import { getPackagesCacheFile, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { editRSPackImage, type RPCS3SongPackagesDataExtra } from '../lib.exports'

export const useSongArtworkFromUniqueSongPKG = useHandler(async (win, __, pkgIndex: number): Promise<boolean> => {
  const cache = getPackagesCacheFile()
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
  const { path, songs } = cacheContents.packages[pkgIndex]
  const firstSong = songs[0]
  const pkgPath = DirPath.of(path)

  if (!pkgPath.exists) {
    sendMessageBox(win, { type: 'error', code: 'deletePackagePackageNotFound' })
    return false
  }

  const thumbnail = pkgPath.gotoFile('folder.jpg')
  await editRSPackImage(thumbnail, { imgPath: DirPath.of(path).gotoFile(`songs/${firstSong.songname}/gen/${firstSong.songname}_keep.png_ps3`).path })

  return true
})
