import { pathLikeToDirPath } from 'node-lib'
import { dialog } from 'electron'
import { getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import { MOGGFile, PythonAPI } from '../lib/rbtools'
import type { RB3CompatibleDTAFile } from '../lib/rbtools/lib.exports'

export const extractMultitrackOrSongAudioFromSong = useHandler(async (win, __, packagePath: string, song: RB3CompatibleDTAFile) => {
  const packPath = pathLikeToDirPath(packagePath)

  const mogg = new MOGGFile(packPath.gotoFile(`songs/${song.songname}/${song.songname}.mogg`))

  if (!mogg.path.exists) {
    sendMessageBox(win, { type: 'error', code: 'extractMultitrackFromSongMOGGFileNotFound', messageValues: { songname: song.songname } })
    return false
  }

  try {
    await mogg.checkFileIntegrity()
  } catch (err) {
    sendMessageBox(win, { type: 'error', code: 'extractMultitrackFromSongInvalidMOGGFile', messageValues: { path: mogg.path.path } })
    return false
  }

  if (!song.multitrack || song.multitrack === null) {
    const buttonLabel = await getLocaleStringFromRenderer(win, 'saveAudioFile')
    const wavExtName = await getLocaleStringFromRenderer(win, 'wavFile')
    const title = await getLocaleStringFromRenderer(win, 'saveSingleAudioTrackTitle')

    const selection = await dialog.showSaveDialog({ buttonLabel, filters: [{ extensions: ['wav'], name: wavExtName }], title, properties: ['showOverwriteConfirmation'] })

    if (selection.canceled) {
      sendMessageBox(win, { type: 'info', code: 'extractMultitrackFromSongCancelledByUser' })
      return false
    }

    sendMessageBox(win, { type: 'loading', code: 'extractingSingleTrackFromSong', messageValues: { path: mogg.path.path } })
    await PythonAPI.extractSongAudioSingleTrack(mogg.path, selection.filePath, song)
    sendMessageBox(win, { type: 'success', code: 'extractSingleTrackFromSong' })
  } else {
    const buttonLabel = await getLocaleStringFromRenderer(win, 'selectFolder')
    const selection = await dialog.showOpenDialog({ buttonLabel, properties: ['openDirectory'] })
    if (selection.canceled) {
      sendMessageBox(win, { type: 'info', code: 'extractMultitrackFromSongCancelledByUser' })
      return false
    }

    sendMessageBox(win, { type: 'loading', code: 'extractingMultitrackFromSong', messageValues: { path: mogg.path.path } })
    await mogg.extractTracks(song, selection.filePaths[0], true)
    sendMessageBox(win, { type: 'success', code: 'extractMultitrackFromSong' })
    return true
  }
})
