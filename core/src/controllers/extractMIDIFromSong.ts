import { pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import type { RPCS3SongPackagesObjectExtra } from '../lib.exports'
import type { RB3CompatibleDTAFile } from '../lib/rbtools/lib.exports'
import { EDATFile } from '../lib/rbtools'
import { dialog } from 'electron'
import { temporaryFile } from 'tempy'

export const extractMIDIFromSong = useHandler(async (win, _, packageDetails: RPCS3SongPackagesObjectExtra, song: RB3CompatibleDTAFile): Promise<boolean> => {
  const packPath = pathLikeToDirPath(packageDetails.path)

  const edat = new EDATFile(packPath.gotoFile(`songs/${song.songname}/${song.songname}.mid.edat`))

  if (!edat.path.exists) {
    sendMessageBox(win, { type: 'error', code: 'extractMIDIFromSongFileNotFound', messageValues: { songname: song.songname } })
    return false
  }

  const buttonLabel = await getLocaleStringFromRenderer(win, 'save')
  const midExtName = await getLocaleStringFromRenderer(win, 'midiFile')
  const title = await getLocaleStringFromRenderer(win, 'saveMIDIFile')

  const selection = await dialog.showSaveDialog({ buttonLabel, filters: [{ extensions: ['mid'], name: midExtName }], title, properties: ['showOverwriteConfirmation'] })

  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'extractMIDIFromSongCancelledByUser' })
    return false
  }

  const newFilePath = pathLikeToFilePath(selection.filePath[0])
  newFilePath.changeThisFileExt('.mid')

  if (await edat.isEncrypted()) {
    const tempMIDI = pathLikeToFilePath(temporaryFile({ extension: 'mid' }))
    await edat.decrypt({ destPath: tempMIDI, devKLicHash: packageDetails.devklic })
    await tempMIDI.copy(newFilePath, true)
    await tempMIDI.delete()
  } else await edat.path.copy(newFilePath)

  return true
})
