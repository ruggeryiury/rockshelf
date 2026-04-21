import { readUserConfigFile, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { type RPCS3SongPackagesObjectExtra } from '../lib.exports'
import { DirPath } from 'node-lib'
import { TextureFile } from '../lib/rbtools'
import type { RB3CompatibleDTAFile } from '../lib/rbtools/lib.exports'

export const getSongArtworkDataURL = useHandler(async (win, _, packageDetails: RPCS3SongPackagesObjectExtra, songDetails: RB3CompatibleDTAFile) => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const artworkPath = new TextureFile(DirPath.of(packageDetails.path).gotoFile(`songs/${songDetails.songname}/gen/${songDetails.songname}_keep.png_ps3`))

  if (!artworkPath.path.exists) {
    sendMessageBox(win, { method: 'getSongArtworkDataURL', type: 'error', code: 'noArtworkFile', messageValues: { path: artworkPath.path.path } })
    return false
  }

  return await artworkPath.toDataURL()
})
