import { MyObject } from 'node-lib'
import { customSourceIfdefDeconstructor, isTracksCountEmpty, sortDTAMap, type DTAFileKeys, type PartialDTAFile, type RB3CompatibleDTAFile } from '../../lib.exports'
import { slashQToQuote } from '../../utils.exports'

/**
 * Parses a DTA song content to a `RB3CompatibleDTAFile` or `PartialDTAFile` object.
 * - - - -
 * @param {string} songContent The depacked content of a song's data.
 * @returns {RB3CompatibleDTAFile | PartialDTAFile}
 */
export const parseDTA = (songContent: string): RB3CompatibleDTAFile | PartialDTAFile => {
  const keyToTracksCountIndex = (key: string): number => {
    switch (key) {
      case 'drum':
        return 0

      case 'bass':
        return 1

      case 'guitar':
        return 2

      case 'vocals':
        return 3

      case 'keys':
        return 4

      default:
        throw new Error(`DTA Parsing error: Tried to find tracks count index for unknown key "${key}"`)
    }
  }
  const map = new MyObject<RB3CompatibleDTAFile>()

  const allStrings = songContent
    .split(/"/g)
    .map((val) => val.trim())
    .filter((val, valIndex) => valIndex !== 0 && !val.startsWith(')') && !(val.startsWith('songs/') || val.startsWith('"songs/')) && !(val.startsWith('sfx/') || val.startsWith('"sfx/')) && !(val.endsWith('.mid') || val.endsWith('.mid"')) && !(val.endsWith('.cue') || val.endsWith('.cue"')))

  const splitValues = songContent.split(/[()]/).map((value) => value.replace(/'/g, '').trim())
  const splitComments = songContent
    .split(/[;]/)
    .map((value) => value.trim())
    .filter((val) => !val.startsWith('(') && !val.startsWith('Song=') && !val.startsWith('DO') && !val.startsWith('Created'))

  // Parsing MAGMA generated values
  for (const lines of splitComments) {
    const [key, ...values] = lines.split(' ')
    if (key === 'Song' && values[0] === 'authored' && values[1] === 'by' && values[2]) map.set('author', values.slice(2).join(' '))
    else if (key.startsWith('ORIG_ID=')) map.set('original_id', key.split('=')[1].slice(0, -1))
    else if (key.includes('=') && !key.startsWith('=')) {
      const proof = Boolean(Number(key.split('=')[1].slice(0, 1).trim()))
      if (proof) {
        if (key.startsWith('Karaoke=')) map.set('multitrack', 'karaoke')
        else if (key.startsWith('Multitrack=')) map.set('multitrack', 'full')
        else if (key.startsWith('DIYStems=')) map.set('multitrack', 'diy_stems')
        else if (key.startsWith('PartialMultitrack=')) map.set('multitrack', 'partial')
        else if (key.startsWith('UnpitchedVocals=')) map.set('unpitchedVocals', true)
        else if (key.startsWith('Convert=')) map.set('convert', true)
        else if (key.startsWith('2xBass=')) map.set('doubleKick', true)
        else if (key.startsWith('RhythmKeys=')) map.set('rhythmOn', 'keys')
        else if (key.startsWith('RhythmBass=')) map.set('rhythmOn', 'bass')
        else if (key.startsWith('CATemh=')) map.set('emh', 'cat')
        else if (key.startsWith('ExpertOnly=')) map.set('emh', 'expert_only')
        else if (key.startsWith('ORIG_ID=')) map.set('original_id', '1')
      }
    }
  }

  // This is the index of used strings as the file is read.
  let stringIndex = 0

  // Some strings might fill two or more split lines, that's why we must control unnecessary split lines with this trigger
  let unfinishedString = false

  // Had to declare where the tracks info has started because the instrument keys shares the same name as parsing instrument ranks
  let tracksStarted = false

  // Also, for tracks, i have to specific which instrument is being processed because the key and values might not share the same loop iteration
  let tracksName = ''

  // This count the index of the tracks info, if it reaches -1, it's done. Starts on 1
  let tracksIndex = 1

  // This is used when addressing special array values like pans, vols, tunings
  let processedArrayName = ''

  // Had to declare where the tracks info has started because the instrument keys shares the same name as parsing instrument ranks
  let ranksStarted = false

  // This count the index of the ranks info, if it reaches -1, it's done. Starts on 0
  let ranksIndex = 0

  // Workaround when parsing bloody RB1 songs
  const processedSongObject = {
    songname: false,
    pans: false,
    vols: false,
    cores: false,
    vocal_parts: false,
    crowd_channels: false,
  }

  const tracksCount: number[] = [0, 0, 0, 0, 0, 0]
  const preview: number[] = [0, 0]
  const solo: string[] = []
  const extraAuthoring: string[] = []
  const languages: string[] = []

  for (let i = 0; i < splitValues.length; i++) {
    const lines = splitValues[i]
    const [key, ...values] = lines.split(' ')
    const valuesJoin = values.join(' ')
    const valuesLength = values.length

    // console.log(i, key, values)

    // Always empty
    if (!key && valuesLength === 0 && !tracksStarted && !processedArrayName && !ranksStarted) continue
    // Song identifier must always be here on "key" variable and "values" array must always be zero
    else if (i === 1 && !key) throw new Error(`DTA Parsing error: No ID is present parsing song at index ${i.toString()}`)
    else if (i === 1 && key) map.set('id', key)
    // On unfinished strings, if key equals to `"` it means that the string has finished
    else if (unfinishedString) {
      if (key === '"') unfinishedString = false
    }

    // This is where tracks count gets counted
    else if (tracksStarted) {
      if (tracksIndex === -1) {
        tracksStarted = false
      } else if (tracksName && key) {
        tracksCount[keyToTracksCountIndex(tracksName)] = valuesLength + 1
        tracksName = ''
        tracksIndex++
      } else if (key && isNaN(Number(key))) {
        if (!key.startsWith(';')) {
          tracksName = key
          if (valuesLength === 1) {
            tracksCount[keyToTracksCountIndex(key)] = valuesLength
            tracksName = ''
          }
          tracksIndex++
        }
      } else {
        tracksIndex--
      }
    }
    // Parse special array values
    else if (processedArrayName) {
      // Numbers array
      if (processedArrayName === 'pans' || processedArrayName === 'vols' || processedArrayName === 'cores' || processedArrayName === 'real_guitar_tuning' || processedArrayName === 'real_bass_tuning') {
        if (Object.keys(processedSongObject).includes(processedArrayName) && processedSongObject[processedArrayName as keyof typeof processedSongObject]) {
          // Do nothing, probably is "song_vocals" duplicated song object.
        } else {
          if (processedArrayName in processedSongObject) processedSongObject[processedArrayName as keyof typeof processedSongObject] = true
          const numbers: number[] = []
          if (key && !isNaN(Number(key))) numbers.push(Number(key))
          if (valuesLength > 0) numbers.push(...values.map((val) => Number(val)))
          map.set(processedArrayName, numbers)
          if ((processedArrayName === 'pans' || processedArrayName === 'vols' || processedArrayName === 'cores') && tracksCount[5] === 0) {
            const allTracksCount = numbers.length

            let tracksCountDifference = 0
            for (const trackChannels of tracksCount) {
              if (trackChannels) tracksCountDifference += trackChannels
            }
            if (allTracksCount - tracksCountDifference > 2) tracksCount[5] = allTracksCount - tracksCountDifference
            else tracksCount[5] = allTracksCount - tracksCountDifference
          }
        }
      }

      // Locale key string array: solo
      else if (processedArrayName === 'solo') {
        solo.push(key, ...values)
      }
      processedArrayName = ''
    } else if (ranksStarted) {
      if (!key && valuesLength === 0) ranksIndex--
      else {
        const rankKey = `rank_${key}` as DTAFileKeys
        map.set(rankKey, Number(valuesJoin))
        ranksIndex++
      }
      if (ranksIndex === -1) ranksStarted = false
    } else {
      // Get songname used by the song files
      if (key === 'name' && !processedSongObject.songname && (valuesJoin.startsWith('songs/') || valuesJoin.startsWith('"songs/'))) {
        map.set('songname', valuesJoin.split('/')[1])
        processedSongObject.songname = true
      }
      // This is strings that's captured on "allStrings" variable
      else if (key === 'name' || key === 'artist' || key === 'album_name' || key === 'pack_name' || key === 'author' || key === 'loading_phrase' || key === 'strings_author' || key === 'keys_author') {
        if (key === 'name' && allStrings[stringIndex] === undefined) {
          // Wrong capture because of "song_vocals" object found on RB1 songs
        } else {
          map.set(key, slashQToQuote(allStrings[stringIndex]))
          stringIndex++
          if (!valuesJoin.endsWith('"')) unfinishedString = true
        }
      }
      // Parse general boolean values
      else if (key === 'master' || key === 'album_art' || key === 'fake' || key === 'alternate_path') map.set(key, valuesJoin.toLowerCase() === '1' || valuesJoin.toLowerCase() === 'true' ? true : false)
      // Parse general number values
      else if (key === 'context' || key === 'vocal_parts' || key === 'mute_volume' || key === 'mute_volume_vocals' || key === 'hopo_threshold' || key === 'song_scroll_speed' || key === 'song_length' || key === 'version' || key === 'format' || key === 'year_released' || key === 'year_recorded' || key === 'rating' || key === 'tuning_offset_cents' || key === 'guide_pitch_volume' || key === 'album_track_number' || key === 'vocal_tonic_note' || key === 'song_tonality' || key === 'song_key' || key === 'upgrade_version' || key === 'base_points') {
        if (key === 'vocal_parts' && !processedSongObject.vocal_parts) {
          map.set(key, Number(valuesJoin) as RB3CompatibleDTAFile['vocal_parts'])
          processedSongObject.vocal_parts = true
        } else map.set(key, Number(valuesJoin))
      }
      // Parse locale-dependant key strings
      else if (key === 'bank' || key === 'drum_bank' || key === 'band_fail_cue' || key === 'genre' || key === 'vocal_gender' || key === 'sub_genre' || key === 'game_origin' || key === 'encoding') map.set(key, valuesJoin.replaceAll('"', '').replaceAll("'", '') as RB3CompatibleDTAFile[typeof key])
      // Parse Song ID
      else if (key === 'song_id') {
        if (!Number.isNaN(Number(valuesJoin))) map.set('song_id', Number(valuesJoin))
        else map.set('song_id', valuesJoin)
      }
      // Parse animation tempo
      else if (key === 'anim_tempo') {
        if (valuesJoin === 'kTempoSlow' || Number(valuesJoin) === 16) {
          map.set('anim_tempo', 16)
          continue
        } else if (valuesJoin === 'kTempoMedium' || Number(valuesJoin) === 32) {
          map.set('anim_tempo', 32)
          continue
        } else if (valuesJoin === 'kTempoFast' || Number(valuesJoin) === 64) {
          map.set('anim_tempo', 64)
          continue
        } else if (!isNaN(Number(valuesJoin))) {
          map.set('anim_tempo', Number(valuesJoin) as RB3CompatibleDTAFile['anim_tempo'])
          continue
        } else throw new Error('DTA Parsing error: Invalid value for anim_tempo entry.')
      }
      // Put crowd channels
      else if (key === 'crowd_channels' && !processedSongObject.crowd_channels) {
        if (tracksCount.length === 7) tracksCount[6] = 2
        else tracksCount.push(2)

        if (tracksCount.length > 6 && tracksCount[5] > 2) tracksCount[5] -= 2

        processedSongObject.crowd_channels = true
      }
      // Parse preview
      else if (key === 'preview') {
        preview[0] = Number(values[0])
        preview[1] = Number(values[1])
      }
      // Extra authoring (only available of patch dta updates)
      else if (key === 'extra_authoring') extraAuthoring.push(...values)
      // Flags that tracks info are going to be parsed
      else if (key === 'tracks') tracksStarted = true
      // Flags that ranks info are going to be parsed
      else if (key === 'rank') ranksStarted = true
      // Starts to parse specific array values
      else if (key === 'pans' || key === 'vols' || key === 'cores' || key === 'real_guitar_tuning' || key === 'real_bass_tuning' || key === 'solo') processedArrayName = key
    }
  }

  // console.log(tracksCount)

  if (!(tracksCount[5] > 2) && !isTracksCountEmpty(tracksCount)) map.set('tracks_count', tracksCount as RB3CompatibleDTAFile['tracks_count'])
  if (tracksCount[3] > 0 && map.has('rank_vocals') && (map.get('rank_vocals') as number) > 0 && !map.has('vocal_parts')) map.set('vocal_parts', 1)
  if (preview[1] !== 0) map.set('preview', preview as RB3CompatibleDTAFile['preview'])
  if (solo.length > 0) map.set('solo', solo as RB3CompatibleDTAFile['solo'])
  if (extraAuthoring.length > 0) map.set('extra_authoring', extraAuthoring as RB3CompatibleDTAFile['extra_authoring'])
  if (languages.length > 0) map.set('languages', languages as RB3CompatibleDTAFile['languages'])

  return customSourceIfdefDeconstructor(sortDTAMap(map)).toJSON() as RB3CompatibleDTAFile | PartialDTAFile
}
