import axios from 'axios'
import { BrowserWindow } from 'electron'

import { getLocaleStringFromRenderer } from '../../../core.exports'
import type { ScoreDataInstrumentTypes } from '../core.exports'

export type GoCentralRoleIDValues = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export interface GoCentralLeaderboardRawResponse {
	leaderboard:
		| {
				pid: number
				name: string
				diff_id: number
				rank: number
				score: number
				is_percentile: number
				inst_mask: number
				notes_pct: number
				unnamed_band: number
				pguid: string
				orank: number
				stars: number
		  }[]
		| null
}

export interface GoCentralLeaderboardResultObject {
	/**
	 * The song ID used on the query.
	 */
	songID: number
	/**
	 * The instrument used on the query.
	 */
	instrument: ScoreDataInstrumentTypes
	/**
	 * An array of objects representing scores of the song. If the song has no scores or no instrument part, it will be `false`.
	 */
	scores: GoCentralLeaderboardObject[] | false
}

export interface GoCentralLeaderboardObject {
	/**
	 * The name of the player/band.
	 */
	name: string
	/**
	 * The difficulty ID of the score entry.
	 */
	difficulty: number
	/**
	 * The score of the entry.
	 */
	score: number
	/**
	 * The percentage of the score.
	 */
	scorePercent: number
	/**
	 * The amount of stars of the score.
	 */
	stars: number
	/**
	 * The player's platform used to play.
	 */
	platform: null | 'xbox' | 'ps3' | 'rpcs3' | 'wii'
}

/**
 * A class with static methods to fetch data from GoCentral leaderboards.
 * - - - -
 */
export class GoCentralAPI {
	/**
	 * Gets the instrument role ID for the leaderboard search params.
	 * - - - -
	 * @param {ScoreDataInstrumentTypes} instrument The instrument name.
	 * @returns {GoCentralRoleIDValues}
	 */
	private static instrumentToRoleID(instrument: ScoreDataInstrumentTypes): GoCentralRoleIDValues {
		switch (instrument) {
			case 'band':
				return 10
			case 'bass':
				return 1
			case 'drums':
				return 0
			case 'guitar':
				return 2
			case 'harmonies':
				return 4
			case 'keys':
				return 5
			case 'proBass':
				return 8
			case 'proDrums':
				return 6
			case 'proGuitar':
				return 7
			case 'proKeys':
				return 9
			case 'vocals':
				return 3
		}
	}

	/**
	 * Fetches leaderboard data from a specific song.
	 * - - - -
	 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
	 * @param {number} songID The song ID.
	 * @param {ScoreDataInstrumentTypes} [instrument] `OPTIONAL` The instrument to get data from. Default is `'band'`.
	 * @returns {Promise<GoCentralLeaderboardResultObject> }
	 */
	static async getScores(win: BrowserWindow, songID: number, instrument: ScoreDataInstrumentTypes = 'band'): Promise<GoCentralLeaderboardResultObject> {
		if (Number.isNaN(songID)) throw new Error(`Provided song ID parameter must be a number, received argument of type "${typeof songID}".`)
		if (songID <= 0) throw new Error('Provided song ID must be a number above zero.')
		if (!Number.isInteger(songID)) throw new Error('Provided song ID must be an integer.')

		const params = new URLSearchParams()
		params.append('role_id', GoCentralAPI.instrumentToRoleID(instrument).toString())
		params.append('song_id', songID.toString())

		const unnamedBandText = await getLocaleStringFromRenderer(win, 'unnamedBand')

		const res = await axios.get<GoCentralLeaderboardRawResponse>(`https://gocentral-service.rbenhanced.rocks/leaderboards`, { params, responseType: 'json' })

		if (res.data.leaderboard === null)
			return {
				songID,
				instrument,
				scores: false,
			}
		return {
			songID,
			instrument,
			scores: res.data.leaderboard.map<GoCentralLeaderboardObject>((score) => {
				let name = score.name
				let platform: GoCentralLeaderboardObject['platform'] = null

				if (name.endsWith(' [360]')) {
					name = name.slice(0, name.length - ' [360]'.length)
					platform = 'xbox'
				} else if (name.endsWith(' [RPCS3]')) {
					name = name.slice(0, name.length - ' [RPCS3]'.length)
					platform = 'rpcs3'
				} else if (name.endsWith(' [PS3]')) {
					name = name.slice(0, name.length - ' [PS3]'.length)
					platform = 'ps3'
				} else if (name.endsWith(' [Wii]')) {
					name = name.slice(0, name.length - ' [Wii]'.length)
					platform = 'wii'
				}
				return { name: name.toLowerCase() === 'unnamed band' ? unnamedBandText : name, difficulty: score.diff_id, score: score.score, scorePercent: score.notes_pct, stars: score.stars, platform }
			}),
		}
	}
}
