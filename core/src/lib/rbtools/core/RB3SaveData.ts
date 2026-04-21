import { BinaryReader, type FilePathLikeTypes } from 'node-lib'
import { bytesToScore, getMostPlayedInstrument, getProfileName, getScoresListBytesWii, getScoresListBytesXboxPS3, getXboxPS3BandName } from '../lib.exports'

// #region Types

export type RB3SaveDataPlatformTypes = 'xbox' | 'ps3' | 'wii'

export interface RB3InstrumentScores {
  /**
   * The top score of the song on the instrument.
   */
  topScore: number
  /**
   * The difficulty that the top score were earned.
   */
  topScoreDifficulty: number
  /**
   * The stars earned on Easy difficulty.
   */
  starsEasy: number
  /**
   * The percentage achieved on Easy difficulty.
   */
  percentEasy: number
  /**
   * The stars earned on Medium difficulty.
   */
  starsMedium: number
  /**
   * The percentage achieved on Medium difficulty.
   */
  percentMedium: number
  /**
   * The stars earned on Hard difficulty.
   */
  starsHard: number
  /**
   * The percentage achieved on Hard difficulty.
   */
  percentHard: number
  /**
   * The stars earned on Expert difficulty.
   */
  starsExpert: number
  /**
   * The percentage achieved on Expert difficulty.
   */
  percentExpert: number
}

export interface RB3Scores {
  /**
   * A numerical, unique number ID of the song.
   */
  song_id: number
  /**
   * The lighter rating given to this song.
   */
  lighterRating: number
  /**
   * The amount of times this song were played.
   */
  playCount: number
  /**
   * An object with scores for Drums.
   */
  drums: RB3InstrumentScores
  /**
   * An object with scores for Bass.
   */
  bass: RB3InstrumentScores
  /**
   * An object with scores for Guitar.
   */
  guitar: RB3InstrumentScores
  /**
   * An object with scores for Solo Vocals.
   */
  vocals: RB3InstrumentScores
  /**
   * An object with scores for Harmonies.
   */
  harmonies: RB3InstrumentScores
  /**
   * An object with scores for Keys.
   */
  keys: RB3InstrumentScores
  /**
   * An object with scores for PRO Drums.
   */
  proDrums: RB3InstrumentScores
  /**
   * An object with scores for PRO Guitar.
   */
  proGuitar: RB3InstrumentScores
  /**
   * An object with scores for PRO Bass.
   */
  proBass: RB3InstrumentScores
  /**
   * An object with scores for PRO Keys.
   */
  proKeys: RB3InstrumentScores
  /**
   * An object with scores for Band.
   */
  band: RB3InstrumentScores
}

export type DifficultyTypes = 0 | 1 | 2 | 3 | 'easy' | 'medium' | 'hard' | 'expert'
export type ScoreDataInstrumentTypes = 'drums' | 'bass' | 'guitar' | 'vocals' | 'harmonies' | 'keys' | 'proDrums' | 'proBass' | 'proGuitar' | 'proKeys' | 'band'

export interface ParsedRB3SaveData {
  /**
   * The platform of the parsed save file.
   */
  platform: RB3SaveDataPlatformTypes
  /**
   * The player's name.
   */
  profileName: string
  /**
   * The index of the profile, used only reading Rock Band 3 Wii save files.
   */
  profileIndex?: number
  /**
   * The most played instrument by the player.
   */
  mostPlayedInstrument: ScoreDataInstrumentTypes
  /**
   * An array with all played songs scores.
   */
  scores: RB3Scores[]
}

export interface InstrumentScoreData {
  /**
   * The instrument selected to gather scores from.
   */
  instrument: ScoreDataInstrumentTypes
  /**
   * The difficulty selected to gather scores from.
   */
  difficulty: DifficultyTypes
  /**
   * The amount of songs played.
   */
  songsPlayed: number
  /**
   * An array with the song ID of every song played.
   */
  playedSongIDs: number[]
  /**
   * The total amount of score the player's won with the selected instrument.
   */
  scoreCount: number
  /**
   * The amount of stars the player's won with the selected instrument.
   */
  starsCount: number
  /**
   * The amount of golden stars the player's won with the selected instrument.
   */
  goldStars: number
}

/**
 * `RB3SaveData` is a class that represents a Rock Band 3 save data.
 */
export class RB3SaveData {
  // #region Static Methods

  /**
   * Asynchronously parses a Rock Band 3 save data file buffer.
   * - - - -
   * @param {Buffer | BinaryReader} bufferOrReader A `Buffer` object with the contents of the Rock Band 3 save data file, or a `BinaryReader` instance for the the Rock Band 3 save data file.
   * @param {FilePathLikeTypes | undefined} [file] `OPTIONAL` The path of the Rock Band 3 save data file you're working upon, if you're working with an actual file. Providing a `BinaryReader` argument for `bufferOrReader` and not provide an argument for this parameter will result on an `Error`.
   * @param {number} [wiiProfile] `OPTIONAL` The index of the desired profile. This is only used on Wii save data files. Default is `0`.
   * @returns {Promise<ParsedRB3SaveData>}
   */
  static async parseBuffer(bufferOrReader: Buffer | BinaryReader, file?: FilePathLikeTypes, wiiProfile: number = 0): Promise<ParsedRB3SaveData> {
    let reader: BinaryReader
    if (Buffer.isBuffer(bufferOrReader)) reader = BinaryReader.fromBuffer(bufferOrReader)
    else if (file && bufferOrReader instanceof BinaryReader) reader = bufferOrReader
    else throw new Error(`Invalid argument pairs for "bufferOrReader" and "file" provided while trying to read Rock Band 3 save data file or buffer.`)
    if (reader.length === 0x43a99c) throw new Error('Tried to read an encrypted PS3 save file, but this class only supports decrypted PS3 save files.')

    let platform: RB3SaveDataPlatformTypes

    if (reader.length === 0xc00000) platform = 'wii'
    else if (reader.length === 0x43a929) platform = 'xbox'
    else if (reader.length === 0x43a99d) platform = 'ps3'
    else throw new Error('Unknown Rock Band 3 save data format.')

    let blockStart: number
    switch (platform) {
      case 'ps3':
      default:
        blockStart = 0x2c7197
        break
      case 'wii': {
        blockStart = 0
        if (wiiProfile === 1) blockStart = 0x6c0000
        else if (wiiProfile === 2) blockStart = 0x840000
        else if (wiiProfile === 3) blockStart = 0x9c0000
        else blockStart = 0x540000
        break
      }
      case 'xbox':
        blockStart = 0x2c7123
        break
    }

    if (platform !== 'wii') {
      const scoresBytes = await getScoresListBytesXboxPS3(reader, blockStart)
      const scoresList: RB3Scores[] = []
      if (scoresBytes.length > 0) {
        let isWiiScore = false
        if (scoresBytes[0].length === 0x1d6) isWiiScore = true
        for (const scoreBytes of scoresBytes) {
          const score = bytesToScore(scoreBytes, isWiiScore)
          scoresList.push(score)
        }
      }

      const profileName = await getXboxPS3BandName(reader, platform)

      await reader.close()

      return {
        platform,
        mostPlayedInstrument: scoresList.length > 0 ? getMostPlayedInstrument(scoresList) : 'band',
        profileName,
        scores: scoresList,
      }
    }

    const scoresBytes = await getScoresListBytesWii(reader, blockStart)
    const scoresList: RB3Scores[] = []
    if (scoresBytes.length > 0) {
      let isWiiScore = false
      if (scoresBytes[0].length === 0x1d6) isWiiScore = true
      for (const scoreBytes of scoresBytes) {
        const score = bytesToScore(scoreBytes, isWiiScore)
        scoresList.push(score)
      }
    }

    const profileName = await getProfileName(reader, wiiProfile)

    await reader.close()

    return {
      platform,
      mostPlayedInstrument: scoresList.length > 0 ? getMostPlayedInstrument(scoresList) : 'band',
      profileName,
      scores: scoresList,
      profileIndex: wiiProfile,
    }
  }

  /**
   * Asynchronously parses a Rock Band 3 save data file.
   * - - - -
   * @param {FilePathLikeTypes} filePath The path to the Rock Band 3 save data file.
   * @returns {Promise<ParsedRB3SaveData>}
   */
  static async parseFromFile(filePath: FilePathLikeTypes): Promise<ParsedRB3SaveData> {
    const reader = await BinaryReader.fromFile(filePath)
    const content = await this.parseBuffer(reader, filePath)
    await reader.close()
    return content
  }

  /**
   * Returns  detailed information of saved scores specific for an instrument and difficulty.
   * - - - -
   * @param {ParsedRB3SaveData} saveData A parsed save data object.
   * @param {ScoreDataInstrumentTypes} instrument The instrument you want to retrieve score data about.
   * @param {DifficultyTypes | undefined} [difficulty] `OPTIONAL` The difficulty of the played songs to calculate scores. Default is `'expert'`.
   * @returns {InstrumentScoreData}
   */
  static getInstrumentScoreData(saveData: ParsedRB3SaveData, instrument: ScoreDataInstrumentTypes, difficulty: DifficultyTypes = 'expert'): InstrumentScoreData {
    const diff = (() => {
      switch (difficulty) {
        case 'easy':
        case 0:
          return 0
        case 'medium':
        case 1:
          return 1
        case 'hard':
        case 2:
          return 2
        case 'expert':
        case 3:
        default:
          return 3
      }
    })()
    const starsName = (() => {
      switch (diff) {
        case 0:
          return 'starsEasy'
        case 1:
          return 'starsMedium'
        case 2:
          return 'starsHard'
        case 3:
        default:
          return 'starsExpert'
      }
    })()

    let songsPlayed = 0
    const playedSongIDs = []
    let scoreCount: number = 0
    let starsCount = 0
    let goldStars = 0
    for (const score of saveData.scores) {
      songsPlayed++
      playedSongIDs.push(score.song_id)
      scoreCount += score[instrument].topScore
      starsCount += score[instrument][starsName] === 6 ? 5 : score[instrument][starsName]
      if (score[instrument][starsName] === 6) goldStars++
    }

    return {
      instrument,
      difficulty,
      songsPlayed,
      playedSongIDs,
      scoreCount,
      starsCount,
      goldStars,
    }
  }
}
