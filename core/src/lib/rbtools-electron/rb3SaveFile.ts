import { BinaryReader, MyObject, type FilePathLikeTypes } from 'node-lib'

// #region Types
const instruments = {
  band: 'Band',
  bass: 'Bass',
  drums: 'Drums',
  guitar: 'Guitar',
  keys: 'Keys',
  real_drums: 'PRO Drums',
  real_bass: 'PRO Bass',
  real_guitar: 'PRO Guitar',
  real_keys: 'PRO Keys',
  vocals: 'Solo Vocals',
  harmonies: 'Harmonies',
} as const

export type InstrumentTypes = keyof typeof instruments
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
   * The title of the song.
   */
  name?: string
  /**
   * The artist of the song.
   */
  artist?: string
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
  mostPlayedInstrument: InstrumentTypes | null
  /**
   * An array with all played songs scores.
   */
  scores: RB3Scores[]
}

/**
 * `RB3SaveData` is a class that represents a Rock Band 3 save data.
 */
export class RB3SaveData {
  // #region Static Methods

  private static _dtbXOR(key: number): number {
    let val = (((key - Math.floor(key / 0x1f31d) * 0x1f31d) * 0x41a7) >>> 0) - ((Math.floor(key / 0x1f31d) * 0xb14) >>> 0)
    if (val <= 0) val = (val - 0x80000000 - 1) >>> 0
    return val
  }

  private static _newDTBCrypt(input: Buffer): Buffer {
    let key = input.readUInt32LE(0)
    const outSize = input.length - 4
    const output = Buffer.alloc(outSize)
    for (let i = 0; i < outSize; i++) {
      key = this._dtbXOR(key)
      output[i] = (input[i + 4] & 0xff) ^ (key & 0xff)
    }
    return output
  }

  private static _getMostPlayedInstrument(scoresList: RB3Scores[]): InstrumentTypes | null {
    const results: InstrumentTypes[] = []
    if (scoresList.length === 0) return null
    for (const score of scoresList) {
      if (score.bass.topScore > 0) results.push('bass')
      if (score.drums.topScore > 0) results.push('drums')
      if (score.guitar.topScore > 0) results.push('guitar')
      if (score.vocals.topScore > 0) results.push('vocals')
      if (score.keys.topScore > 0) results.push('keys')
      if (score.proBass.topScore > 0) results.push('real_bass')
      if (score.proDrums.topScore > 0) results.push('real_drums')
      if (score.proGuitar.topScore > 0) results.push('real_guitar')
      if (score.proKeys.topScore > 0) results.push('real_keys')
      if (score.harmonies.topScore > 0) results.push('harmonies')
    }

    const mostFrequent = Array.from(new Set(results)).reduce((prev, curr) => (results.filter((el) => el === curr).length > results.filter((el) => el === prev).length ? curr : prev))

    return mostFrequent
  }

  private static async _getScoresListBytesXboxPS3(reader: BinaryReader, blockStart: number): Promise<Buffer[]> {
    reader.seek(blockStart)
    const encScoresBlock = await reader.read(0x15b33c)
    let decScoresBlock = this._newDTBCrypt(encScoresBlock)

    const xboxPS3UnknownBytes = Buffer.alloc(0x84)
    decScoresBlock.copy(xboxPS3UnknownBytes, 0, 0x15b2b4, 0x15b2b4 + 0x84)
    decScoresBlock = decScoresBlock.subarray(0x04)

    const scores: Buffer[] = []
    for (let i = 0; i < decScoresBlock.length; i++) {
      const testVal = decScoresBlock.readUInt32LE(i * 0x1da)

      if (testVal === 0 || i === 0xbb8) {
        if (i === 0xbb8) console.warn('RB3SaveData WARN: More than 3000 songs were detected, but only 2999 can be stored. Only returning the first 2999 songs.')
        break
      }
      const score = Buffer.alloc(0x1da)
      decScoresBlock.copy(score, 0, i * 0x1da, i * 0x1da + 0x1da)
      scores.push(score)
    }

    return scores
  }

  private static async _getScoresListBytesWii(reader: BinaryReader, blockStart: number): Promise<Buffer[]> {
    const wiiScoreBlockLength = 0x1d6 * 1000
    reader.seek(blockStart)
    const scoresBlock = await reader.read(wiiScoreBlockLength)
    const scores: Buffer[] = []
    for (let i = 0; i < scoresBlock.length; i += 0x1d6) {
      const testVal = scoresBlock.readUInt32LE(i)
      if (testVal === 0) break
      const score = Buffer.alloc(0x1d6)
      scoresBlock.copy(score, 0, i, i + 0x1d6)
      scores.push(score)
    }

    return scores
  }

  private static _removeDupeID0x04(input: Buffer): Buffer {
    // Get the first 4 bytes
    const first = input.subarray(0, 4)

    // Skip the 4 bytes at index 4 and get the rest
    const second = input.subarray(8)

    // Concatenate the two parts into a new Buffer
    const output = Buffer.concat([first, second])

    return output
  }

  private static _bytesToScore(input: Buffer, isWiiScore: boolean): RB3Scores {
    const score = new MyObject<RB3Scores>()
    score.set('song_id', input.readUInt32LE(0x00))
    if (!isWiiScore) {
      score.set('song_id', input.readUInt32LE(0x04))
      input = this._removeDupeID0x04(input)
    }
    score.set('lighterRating', input[0x06])
    score.set('playCount', input.readInt32LE(0x0b))

    // Drums
    const drums = new MyObject<RB3InstrumentScores>()
    drums.set('topScore', input.readInt32LE(0x3f))
    drums.set('topScoreDifficulty', input[0x43])
    drums.set('starsEasy', input[0x44])
    drums.set('percentEasy', input[0x45])
    drums.set('starsMedium', input[0x4c])
    drums.set('percentMedium', input[0x4d])
    drums.set('starsHard', input[0x54])
    drums.set('percentHard', input[0x55])
    drums.set('starsExpert', input[0x5c])
    drums.set('percentExpert', input[0x5d])
    score.set('drums', drums.toObject())

    // Bass
    const bass = new MyObject<RB3InstrumentScores>()
    bass.set('topScore', input.readInt32LE(0x64))
    bass.set('topScoreDifficulty', input[0x68])
    bass.set('starsEasy', input[0x69])
    bass.set('percentEasy', input[0x6a])
    bass.set('starsMedium', input[0x71])
    bass.set('percentMedium', input[0x72])
    bass.set('starsHard', input[0x79])
    bass.set('percentHard', input[0x7a])
    bass.set('starsExpert', input[0x81])
    bass.set('percentExpert', input[0x82])
    score.set('bass', bass.toObject())

    // Guitar
    const guitar = new MyObject<RB3InstrumentScores>()
    guitar.set('topScore', input.readInt32LE(0x89))
    guitar.set('topScoreDifficulty', input[0x8d])
    guitar.set('starsEasy', input[0x8e])
    guitar.set('percentEasy', input[0x8f])
    guitar.set('starsMedium', input[0x96])
    guitar.set('percentMedium', input[0x97])
    guitar.set('starsHard', input[0x9e])
    guitar.set('percentHard', input[0x9f])
    guitar.set('starsExpert', input[0xa6])
    guitar.set('percentExpert', input[0xa7])
    score.set('guitar', guitar.toObject())

    // Vocals
    const vocals = new MyObject<RB3InstrumentScores>()
    vocals.set('topScore', input.readInt32LE(0xae))
    vocals.set('topScoreDifficulty', input[0xb2])
    vocals.set('starsEasy', input[0xb3])
    vocals.set('percentEasy', input[0xb4])
    vocals.set('starsMedium', input[0xbb])
    vocals.set('percentMedium', input[0xbc])
    vocals.set('starsHard', input[0xc3])
    vocals.set('percentHard', input[0xc4])
    vocals.set('starsExpert', input[0xcb])
    vocals.set('percentExpert', input[0xcc])
    score.set('vocals', vocals.toObject())

    // Harmonies
    const harmonies = new MyObject<RB3InstrumentScores>()
    harmonies.set('topScore', input.readInt32LE(0xd3))
    harmonies.set('topScoreDifficulty', input[0xd7])
    harmonies.set('starsEasy', input[0xd8])
    harmonies.set('percentEasy', input[0xd9])
    harmonies.set('starsMedium', input[0xe0])
    harmonies.set('percentMedium', input[0xe1])
    harmonies.set('starsHard', input[0xe8])
    harmonies.set('percentHard', input[0xe9])
    harmonies.set('starsExpert', input[0xf0])
    harmonies.set('percentExpert', input[0xf1])
    score.set('harmonies', harmonies.toObject())

    // Keys
    const keys = new MyObject<RB3InstrumentScores>()
    keys.set('topScore', input.readInt32LE(0xf8))
    keys.set('topScoreDifficulty', input[0xfc])
    keys.set('starsEasy', input[0xfd])
    keys.set('percentEasy', input[0xfe])
    keys.set('starsMedium', input[0x105])
    keys.set('percentMedium', input[0x106])
    keys.set('starsHard', input[0x10d])
    keys.set('percentHard', input[0x10e])
    keys.set('starsExpert', input[0x115])
    keys.set('percentExpert', input[0x116])
    score.set('keys', keys.toObject())

    // PRO Drums
    const proDrums = new MyObject<RB3InstrumentScores>()
    proDrums.set('topScore', input.readInt32LE(0x11d))
    proDrums.set('topScoreDifficulty', input[0x121])
    proDrums.set('starsEasy', input[0x122])
    proDrums.set('percentEasy', input[0x123])
    proDrums.set('starsMedium', input[0x12a])
    proDrums.set('percentMedium', input[0x12b])
    proDrums.set('starsHard', input[0x132])
    proDrums.set('percentHard', input[0x133])
    proDrums.set('starsExpert', input[0x13a])
    proDrums.set('percentExpert', input[0x13b])
    score.set('proDrums', proDrums.toObject())

    // PRO Guitar
    const proGuitar = new MyObject<RB3InstrumentScores>()
    proGuitar.set('topScore', input.readInt32LE(0x142))
    proGuitar.set('topScoreDifficulty', input[0x146])
    proGuitar.set('starsEasy', input[0x147])
    proGuitar.set('percentEasy', input[0x148])
    proGuitar.set('starsMedium', input[0x14f])
    proGuitar.set('percentMedium', input[0x150])
    proGuitar.set('starsHard', input[0x157])
    proGuitar.set('percentHard', input[0x158])
    proGuitar.set('starsExpert', input[0x15f])
    proGuitar.set('percentExpert', input[0x160])
    score.set('proGuitar', proGuitar.toObject())

    // PRO Bass
    const proBass = new MyObject<RB3InstrumentScores>()
    proBass.set('topScore', input.readInt32LE(0x167))
    proBass.set('topScoreDifficulty', input[0x16b])
    proBass.set('starsEasy', input[0x16c])
    proBass.set('percentEasy', input[0x16d])
    proBass.set('starsMedium', input[0x174])
    proBass.set('percentMedium', input[0x175])
    proBass.set('starsHard', input[0x17c])
    proBass.set('percentHard', input[0x17d])
    proBass.set('starsExpert', input[0x184])
    proBass.set('percentExpert', input[0x185])
    score.set('proBass', proBass.toObject())

    // PRO Keys
    const proKeys = new MyObject<RB3InstrumentScores>()
    proKeys.set('topScore', input.readInt32LE(0x18c))
    proKeys.set('topScoreDifficulty', input[0x190])
    proKeys.set('starsEasy', input[0x191])
    proKeys.set('percentEasy', input[0x192])
    proKeys.set('starsMedium', input[0x199])
    proKeys.set('percentMedium', input[0x19a])
    proKeys.set('starsHard', input[0x1a1])
    proKeys.set('percentHard', input[0x1a2])
    proKeys.set('starsExpert', input[0x1a9])
    proKeys.set('percentExpert', input[0x1aa])
    score.set('proKeys', proKeys.toObject())

    // Band
    const band = new MyObject<RB3InstrumentScores>()
    band.set('topScore', input.readInt32LE(0x1b1))
    band.set('topScoreDifficulty', input[0x1b5])
    band.set('starsEasy', input[0x1b6])
    band.set('percentEasy', input[0x1b7])
    band.set('starsMedium', input[0x1be])
    band.set('percentMedium', input[0x1bf])
    band.set('starsHard', input[0x1c6])
    band.set('percentHard', input[0x1c7])
    band.set('starsExpert', input[0x1ce])
    band.set('percentExpert', input[0x1cf])
    score.set('band', band.toObject())

    return score.toObject()
  }

  private static async _getProfileName(reader: BinaryReader, profileIndex: number): Promise<string> {
    let output = ''
    for (let i = 0; i < 0x2e; i++) {
      const start = 0x7c + profileIndex * 0x3b + i
      reader.seek(start)
      const c = await reader.readASCII(1)
      if (c !== '\u0000') output += c
      else break
    }
    return output
  }

  private static async _getXboxPS3BandName(reader: BinaryReader, platform: RB3SaveDataPlatformTypes): Promise<string> {
    const startOffset = platform === 'ps3' ? 0x43a7e7 : 0x43a773
    let output = ''
    for (let i = 0; i < 0x2e; i++) {
      const start = startOffset + (i >>> 0)
      reader.seek(start)
      const c = await reader.readASCII(1)
      if (c !== '\u0000') output += c
      else break
    }

    return output
  }

  /**
   * Asynchronously parses a Rock Band 3 save data file buffer.
   * - - - -
   * @param {Buffer | BinaryReader} bufferOrReader A `Buffer` object with the contents of the Rock Band 3 save data file, or a `BinaryReader` instance for the the Rock Band 3 save data file.
   * @param {FilePathLikeTypes | undefined} [file] `OPTIONAL` The path of the Rock Band 3 save data file you're working upon, if you're working with an actual file. Providing a `BinaryReader` argument for `bufferOrReader` and not provide an argument for this parameter will result on an `Error`.
   * @param {number} [wiiProfile] `OPTIONAL` The index of the desired profile. This is only used on Wii save data files. Default is `0`.
   * @returns {Promise<ParsedRB3SaveData>}
   */
  static async parseBuffer(bufferOrReader: Buffer | BinaryReader, file?: FilePathLikeTypes, wiiProfile = 0): Promise<ParsedRB3SaveData> {
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
      const scoresBytes = await this._getScoresListBytesXboxPS3(reader, blockStart)
      const scoresList: RB3Scores[] = []
      if (scoresBytes.length > 0) {
        let isWiiScore = false
        if (scoresBytes[0].length === 0x1d6) isWiiScore = true
        for (const scoreBytes of scoresBytes) {
          const score = this._bytesToScore(scoreBytes, isWiiScore)
          scoresList.push(score)
        }
      }

      const profileName = await this._getXboxPS3BandName(reader, platform)

      await reader.close()

      return {
        platform,
        mostPlayedInstrument: scoresList.length > 0 ? this._getMostPlayedInstrument(scoresList) : 'band',
        profileName,
        scores: scoresList,
      }
    }

    const scoresBytes = await this._getScoresListBytesWii(reader, blockStart)
    const scoresList: RB3Scores[] = []
    if (scoresBytes.length > 0) {
      let isWiiScore = false
      if (scoresBytes[0].length === 0x1d6) isWiiScore = true
      for (const scoreBytes of scoresBytes) {
        const score = this._bytesToScore(scoreBytes, isWiiScore)
        scoresList.push(score)
      }
    }

    const profileName = await this._getProfileName(reader, wiiProfile)

    await reader.close()

    return {
      platform,
      mostPlayedInstrument: scoresList.length > 0 ? this._getMostPlayedInstrument(scoresList) : 'band',
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
    return content
  }
}
