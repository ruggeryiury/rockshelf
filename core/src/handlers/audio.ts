import { dialog } from 'electron'
import { pathLikeToDirPath } from 'node-lib'

import { type LightRB3SongPackagesDataObject, getLocaleStringFromRenderer, sendMessageBox, useHandler } from '../core.exports'
import { MOGGFile, type MOGGTracksExtractorOptions, PythonAPI } from '../lib/rbtools'
import type { RB3CompatibleDTAFile } from '../lib/rbtools/lib.exports'

export const extractMOGGTracksFromSong = useHandler(async (win, __, packageDetails: LightRB3SongPackagesDataObject, songDetails: RB3CompatibleDTAFile, options?: MOGGTracksExtractorOptions) => {
	const packPath = pathLikeToDirPath(packageDetails.path)
	const songname = songDetails.songname

	const mogg = new MOGGFile(packPath.gotoFile(`songs/${songname}/${songname}.mogg`))

	if (!mogg.path.exists) {
		sendMessageBox(win, { type: 'error', code: 'extractMultitrackFromSongMOGGFileNotFound', messageValues: { songname } })
		return false
	}

	try {
		await mogg.checkFileIntegrity()
	} catch (err) {
		sendMessageBox(win, { type: 'error', code: 'extractMultitrackFromSongInvalidMOGGFile', messageValues: { path: mogg.path.path } })
		return false
	}

	if (typeof songDetails.multitrack !== 'string' && !packageDetails?.official) {
		const buttonLabel = await getLocaleStringFromRenderer(win, 'save')
		const wavExtName = await getLocaleStringFromRenderer(win, 'wavFile')
		const title = await getLocaleStringFromRenderer(win, 'saveSingleAudioTrackTitle')

		const selection = await dialog.showSaveDialog({ buttonLabel, filters: [{ extensions: ['wav'], name: wavExtName }], title, properties: ['showOverwriteConfirmation'] })

		if (selection.canceled) {
			sendMessageBox(win, { type: 'info', code: 'extractMultitrackFromSongCancelledByUser' })
			return false
		}

		sendMessageBox(win, { type: 'loading', code: 'extractingSingleTrackFromSong', messageValues: { path: mogg.path.path } })
		await PythonAPI.extractSongAudioSingleTrack(mogg.path, selection.filePath, songDetails)
		sendMessageBox(win, { type: 'success', code: 'extractSingleTrackFromSong' })
		return true
	} else {
		const buttonLabel = await getLocaleStringFromRenderer(win, 'selectFolder')
		const selection = await dialog.showOpenDialog({ buttonLabel, properties: ['openDirectory'] })
		if (selection.canceled) {
			sendMessageBox(win, { type: 'info', code: 'extractMultitrackFromSongCancelledByUser' })
			return false
		}

		sendMessageBox(win, { type: 'loading', code: 'extractingMultitrackFromSong', messageValues: { path: mogg.path.path } })
		await mogg.extractTracks(songDetails, selection.filePaths[0], options)
		sendMessageBox(win, { type: 'success', code: 'extractMultitrackFromSong' })
		return true
	}
})
