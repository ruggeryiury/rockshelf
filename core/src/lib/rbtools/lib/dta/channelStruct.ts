import type { DrumTracksTypes, RB3CompatibleDTAFile, DTATracksCountArray, InstrumentChannelsTypes } from '../../lib.exports'

export interface AudioTracksCountObject {
  /**
   * The tracks from the drums.
   */
  drum?: number[]
  /**
   * The tracks from the bass.
   */
  bass?: number[]
  /**
   * The tracks from the guitar.
   */
  guitar?: number[]
  /**
   * The tracks from the vocals.
   */
  vocals?: number[]
  /**
   * The tracks from the keys.
   */
  keys?: number[]
  /**
   * The tracks from the backing.
   */
  backing?: number[]
  /**
   * The tracks from the crowd.
   */
  crowd?: number[]
  /**
   * The counting of all tracks available.
   */
  allTracksCount: number
  /**
   * An array with default values for pans.
   */
  defaultPans: number[]
  /**
   * An array with default values for vols.
   */
  defaultVols: number[]
  /**
   * An array with default values for cores.
   */
  defaultCores: number[]
}

/**
 * Generates an array with numbers of then position and counting of each track on the audio file structure.
 * - - - -
 * @param {DTATracksCountArray} tracksCount The tracks count of the song.
 * @returns {AudioTracksCountObject} An object with the array of all used tracks.
 */
export const genTracksCountArray = (tracksCount: DTATracksCountArray): AudioTracksCountObject => {
  const genDefaultTrackVols = (channelCount: number): number[] => {
    switch (channelCount) {
      case 1:
        return [0]
      case 2:
        return [-1, 1]
      case 3:
        return [0, -1, 1]
      case 4:
        return [0, 0, -1, 1]
      case 5:
        return [0, -1, 1, -1, 1]
      case 6:
        return [-1, 1, -1, 1, -1, 1]
      default:
        throw new TypeError(`Track count must be from 1 to 6, received ${channelCount.toString()}`)
    }
  }
  const [allDrum, bass, guitar, vocals, keys, backing, crowd] = tracksCount

  const drumsArray: number[] = []
  const bassArray: number[] = []
  const guitarArray: number[] = []
  const vocalsArray: number[] = []
  const keysArray: number[] = []
  const backingArray: number[] = []
  const crowdArray: number[] = []
  let arrayFillCount = 0

  for (let i = 0; i < allDrum; i++) {
    drumsArray.push(arrayFillCount)
    arrayFillCount++
  }
  for (let i = 0; i < bass; i++) {
    bassArray.push(arrayFillCount)
    arrayFillCount++
  }
  for (let i = 0; i < guitar; i++) {
    guitarArray.push(arrayFillCount)
    arrayFillCount++
  }
  for (let i = 0; i < vocals; i++) {
    vocalsArray.push(arrayFillCount)
    arrayFillCount++
  }
  for (let i = 0; i < keys; i++) {
    keysArray.push(arrayFillCount)
    arrayFillCount++
  }
  for (let i = 0; i < backing; i++) {
    backingArray.push(arrayFillCount)
    arrayFillCount++
  }
  if (crowd !== undefined) {
    for (let i = 0; i < crowd; i++) {
      crowdArray.push(arrayFillCount)
      arrayFillCount++
    }
  }

  const defaultPans: number[] = []

  if (allDrum > 0) defaultPans.push(...genDefaultTrackVols(allDrum))
  if (bass > 0) defaultPans.push(...genDefaultTrackVols(bass))
  if (guitar > 0) defaultPans.push(...genDefaultTrackVols(guitar))
  if (vocals > 0) defaultPans.push(...genDefaultTrackVols(vocals))
  if (keys > 0) defaultPans.push(...genDefaultTrackVols(keys))
  if (backing > 0) defaultPans.push(...genDefaultTrackVols(backing))
  if (crowd) defaultPans.push(...[-2.5, 2.5])

  return {
    drum: drumsArray.length === 0 ? undefined : drumsArray,
    bass: bassArray.length === 0 ? undefined : bassArray,
    guitar: guitarArray.length === 0 ? undefined : guitarArray,
    vocals: vocalsArray.length === 0 ? undefined : vocalsArray,
    keys: keysArray.length === 0 ? undefined : keysArray,
    backing: backingArray.length === 0 ? undefined : backingArray,
    crowd: crowdArray.length === 0 ? undefined : crowdArray,
    allTracksCount: arrayFillCount,
    defaultPans,
    defaultVols: Array<number>(arrayFillCount).fill(0),
    defaultCores: Array<number>(arrayFillCount)
      .fill(-1)
      .map((core, coreI) => {
        if (guitarArray.includes(coreI)) return 1
        return -1
      }),
  }
}

/**
 * Generates an array of pan values based on the provided track count.
 * - - - -
 * @param {DrumTracksTypes | InstrumentChannelsTypes} count The type of tracks.
 * @returns {number[]} An array of pan values based on the track count.
 */
export const channelsCountToPanArray = (count: DrumTracksTypes | InstrumentChannelsTypes): number[] => {
  switch (count) {
    case 'Mono':
    case 1:
      return [0]
    case 'Stereo':
    case 'Stereo Else':
    case 2:
      return [-1, 1]
    case 'Mono Kick + Stereo Else':
    case 3:
      return [0, -1, 1]
    case 'Mono Kick + Mono Snare + Stereo Else':
    case 4:
      return [0, 0, -1, 1]
    case 'Mono Kick + Stereo Snare + Stereo Else':
    case 5:
      return [0, -1, 1, -1, 1]
    case 'Stereo Kick + Stereo Snare + Stereo Else':
    case 6:
      return [-1, 1, -1, 1, -1, 1]
  }
}

/**
 * An object containing detailed informations about the song's audio file track structure.
 */
export interface AudioFileTracksStructureDocument {
  /**
   * Quantity of channels of all tracks.
   */
  allTracksCount: number
  /**
   * An array with default values for pans.
   */
  defaultPans: number[]
  /**
   * An array with default values for vols.
   */
  defaultVols: number[]
  /**
   * An array with default values for cores.
   */
  defaultCores: number[]
  /**
   * Information about the drum tracks.
   */
  drum: {
    /**
     * Tells if the song has playable drums part.
     */
    enabled: boolean
    /**
     * Quantity of channels of all drum tracks.
     */
    channels: number
    /**
     * The layout of the drum channels.
     */
    drum_layout: 'drum_layout_kit' | 'drum_layout_kit_kick' | 'drum_layout_kit_kick_snare'
    /**
     * An array with the channels count from start channel to the last one.
     */
    array?: number[]
    /**
     * The panning of all drum tracks.
     */
    pan: number[]
    /**
     * The volume of all drum tracks.
     */
    vol: number[]
    /**
     * Tells if the drum has more than just one stereo channels for the entire kit.
     */
    hasSepDrums: boolean
    /**
     * Tells if the drum has solo sections.
     */
    hasSolo: boolean
    /**
     * Tells if the drum has separated kick drum stems.
     */
    kickEnabled: boolean
    /**
     * Quantity of channels of the kick drum tracks.
     */
    kickChannels: number
    /**
     * The panning of the kick drum tracks.
     */
    kickPan: number[]
    /**
     * The volume of the kick drum tracks.
     */
    kickVol: number[]
    /**
     * Tells if the drum has separated snare drum stems.
     */
    snareEnabled: boolean
    /**
     * Quantity of channels of the snare drum tracks.
     */
    snareChannels: number
    /**
     * The panning of the snare drum tracks.
     */
    snarePan: number[]
    /**
     * The volume of the snare drum tracks.
     */
    snareVol: number[]
    /**
     * Tells if the drum has separated kit drum stems.
     *
     * This is always `true`, even for songs with only one stereo track for the entire kit.
     */
    kitEnabled: boolean
    /**
     * Quantity of channels of the drum kit tracks.
     *
     * This is always `Stereo`, even for songs with only one stereo track for the entire kit.
     */
    kitChannels: number
    /**
     * The panning of the drum kit tracks.
     */
    kitPan: number[]
    /**
     * The volume of the drum kit tracks.
     */
    kitVol: number[]
  }
  /**
   * Information about the bass tracks.
   */
  bass: {
    /**
     * Tells if the song has playable bass part.
     */
    enabled: boolean
    /**
     * Quantity of channels of the bass tracks.
     */
    channels: number
    /**
     * An array with the channels count from start channel to the last one.
     */
    array?: number[]
    /**
     * The panning of the bass tracks.
     */
    pan: number[]
    /**
     * The volume of the bass tracks.
     */
    vol: number[]
    /**
     * Tells if the bass has solo sections.
     */
    hasSolo: boolean
  }
  /**
   * Information about the guitar tracks.
   */
  guitar: {
    /**
     * Tells if the song has playable guitar part.
     */
    enabled: boolean
    /**
     * Quantity of channels of the guitar tracks.
     */
    channels: number
    /**
     * An array with the channels count from start channel to the last one.
     */
    array?: number[]
    /**
     * The panning of the guitar tracks.
     */
    pan: number[]
    /**
     * The volume of the guitar tracks.
     */
    vol: number[]
    /**
     * Tells if the guitar has solo sections.
     */
    hasSolo: boolean
  }
  /**
   * Information about the vocals tracks.
   */
  vocals: {
    /**
     * Tells if the song has playable vocals part.
     */
    enabled: boolean
    /**
     * Quantity of channels of the vocals tracks.
     */
    channels: number
    /**
     * An array with the channels count from start channel to the last one.
     */
    array?: number[]
    /**
     * The panning of the vocals tracks.
     */
    pan: number[]
    /**
     * The volume of the vocals tracks.
     */
    vol: number[]
    /**
     * Tells if the vocals has percussion sections.
     */
    hasSolo: boolean
  }
  /**
   * Information about the keys tracks.
   */
  keys: {
    /**
     * Tells if the song has playable keys part.
     */
    enabled: boolean
    /**
     * Quantity of channels of the keys tracks.
     */
    channels: number
    /**
     * An array with the channels count from start channel to the last one.
     */
    array?: number[]
    /**
     * The panning of the keys tracks.
     */
    pan: number[]
    /**
     * The volume of the keys tracks.
     */
    vol: number[]
    /**
     * Tells if the keys has solo sections.
     */
    hasSolo: boolean
  }
  /**
   * Information about the backing tracks.
   */
  backing: {
    /**
     * Tells if the song has backing tracks.
     */
    enabled: boolean
    /**
     * Quantity of channels of the backing tracks.
     */
    channels: number
    /**
     * An array with the channels count from start channel to the last one.
     */
    array?: number[]
    /**
     * The panning of the backing tracks.
     */
    pan: number[]
    /**
     * The volume of the backing tracks.
     */
    vol: number[]
  }
  /**
   * Information about the crowd tracks.
   */
  crowd: {
    /**
     * Tells if the song has crowd tracks. Crowd tracks are always stereo with panning of `-2.5` (for left channel) and `2.5` (for right channel).
     */
    enabled: boolean
    /**
     * An array with the channels count from start channel to the last one.
     */
    array?: number[]
    /**
     * The volume of the crowd tracks, This value with apply equally on both tracks.
     */
    vol?: number
  }
}

/**
 * Generates an object with detailed informations about the song's audio file track structure.
 * - - - -
 * @param {RB3CompatibleDTAFile} song The song you want the panning and volume information from.
 * @returns {AudioFileTracksStructureDocument} An object with all panning and volume informations.
 */
export const genAudioFileStructure = (song: RB3CompatibleDTAFile): AudioFileTracksStructureDocument => {
  const { tracks_count, pans: dtaPans, vols: dtaVols, solo } = song
  const [allDrum, bass, guitar, vocals, keys, backing, crowd] = tracks_count
  const { backing: backingArray, bass: bassArray, crowd: crowdArray, drum: drumsArray, guitar: guitarArray, keys: keysArray, vocals: vocalsArray, defaultPans, defaultVols, defaultCores } = genTracksCountArray(tracks_count)
  const drumkick = allDrum >= 3 ? (allDrum === 6 ? 2 : 1) : 0
  const drumsnare = allDrum >= 4 ? (allDrum >= 5 ? 2 : 1) : 0
  const drumkit = allDrum > 0 ? 2 : 0
  const drumLayout = allDrum === 0 || allDrum === 2 ? 'drum_layout_kit' : allDrum === 3 ? 'drum_layout_kit_kick' : 'drum_layout_kit_kick_snare'
  const allTracksCount = allDrum + bass + guitar + vocals + keys + backing + (crowd !== undefined ? 2 : 0)

  const pans = dtaPans ?? defaultPans
  const vols = dtaVols ?? defaultVols

  return {
    allTracksCount,
    defaultPans: defaultPans,
    defaultVols: defaultVols,
    defaultCores: defaultCores,
    drum: {
      // All drums stems
      enabled: allDrum !== 0,
      channels: allDrum,
      drum_layout: drumLayout,
      array: drumsArray,
      pan: allDrum === 0 ? [] : pans.slice(0, allDrum),
      vol: allDrum === 0 ? [] : vols.slice(0, allDrum),
      hasSepDrums: allDrum > 2,
      hasSolo: solo ? solo.some((value) => value === 'drum') : false,

      // Drum kick
      kickEnabled: drumkick !== 0,
      kickChannels: drumkick,
      kickPan: allDrum < 3 ? [] : pans.slice(0, drumkick),
      kickVol: allDrum < 3 ? [] : vols.slice(0, drumkick),

      // Drum snare
      snareEnabled: drumsnare !== 0,
      snareChannels: drumsnare,
      snarePan: allDrum < 4 ? [] : pans.slice(drumkick, drumkick + drumsnare),
      snareVol: allDrum < 4 ? [] : vols.slice(drumkick, drumkick + drumsnare),

      // Drum kit
      kitEnabled: drumkit !== 0,
      kitChannels: drumkit,
      kitPan: allDrum < 3 ? pans.slice(0, allDrum) : pans.slice(drumkick + drumsnare, drumkick + drumsnare + drumkit),
      kitVol: allDrum < 3 ? vols.slice(0, allDrum) : vols.slice(drumkick + drumsnare, drumkick + drumsnare + drumkit),
    },
    bass: {
      enabled: bass !== 0,
      channels: bass,
      array: bassArray,
      pan: bass === 0 ? [] : pans.slice(allDrum, allDrum + bass),
      vol: bass === 0 ? [] : vols.slice(allDrum, allDrum + bass),
      hasSolo: solo ? solo.some((value) => value === 'bass') : false,
    },
    guitar: {
      enabled: guitar !== 0,
      channels: guitar,
      array: guitarArray,
      pan: guitar === 0 ? [] : pans.slice(allDrum + bass, allDrum + bass + guitar),
      vol: guitar === 0 ? [] : vols.slice(allDrum + bass, allDrum + bass + guitar),
      hasSolo: solo ? solo.some((value) => value === 'guitar') : false,
    },
    vocals: {
      enabled: vocals !== 0,
      channels: vocals,
      array: vocalsArray,
      pan: vocals === 0 ? [] : pans.slice(allDrum + bass + guitar, allDrum + bass + guitar + vocals),
      vol: vocals === 0 ? [] : vols.slice(allDrum + bass + guitar, allDrum + bass + guitar + vocals),
      hasSolo: solo ? solo.some((value) => value === 'vocal_percussion') : false,
    },
    keys: {
      enabled: keys !== 0,
      channels: keys,
      array: keysArray,
      pan: keys === 0 ? [] : pans.slice(allDrum + bass + guitar + vocals, allDrum + bass + guitar + vocals + keys),
      vol: keys === 0 ? [] : vols.slice(allDrum + bass + guitar + vocals, allDrum + bass + guitar + vocals + keys),
      hasSolo: solo ? solo.some((value) => value === 'keys') : false,
    },
    backing: {
      enabled: backing !== 0,
      channels: backing,
      array: backingArray,
      pan: backing === 0 ? [] : pans.slice(allDrum + bass + guitar + vocals + keys, allDrum + bass + guitar + vocals + keys + backing),
      vol: backing === 0 ? [] : vols.slice(allDrum + bass + guitar + vocals + keys, allDrum + bass + guitar + vocals + keys + backing),
    },
    crowd: {
      enabled: crowd !== undefined,
      array: crowdArray,
      vol: crowd === undefined ? undefined : vols.slice(allDrum + bass + guitar + vocals + keys + backing)[0],
    },
  }
}

/**
 * Checks if a tracks count array is empty (having all tracks with 0 channels).
 * - - - -
 * @param {number[]} tracksCount An array with the counting of all audio tracks.
 * @returns {boolean} A boolean value that tells if the provided tracks count array is empty.
 */
export const isTracksCountEmpty = (tracksCount: number[]): boolean => {
  let proof = true
  for (const track of tracksCount) {
    if (track !== 0) proof = false
  }

  return proof
}
