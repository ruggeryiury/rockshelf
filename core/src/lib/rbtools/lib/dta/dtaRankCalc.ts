import type { RB3CompatibleDTAFile, InstrRankingNames, InstrRankingNumbers } from '../../lib.exports'

const ranksMap = {
  drum: [124, 151, 178, 242, 345, 448],
  bass: [135, 181, 228, 293, 364, 436],
  guitar: [139, 176, 221, 267, 333, 409],
  vocals: [132, 175, 218, 279, 353, 427],
  keys: [153, 211, 269, 327, 385, 443],
  real_keys: [153, 211, 269, 327, 385, 443],
  real_bass: [150, 208, 267, 325, 384, 442],
  real_guitar: [150, 208, 267, 325, 384, 442],
  band: [165, 215, 243, 267, 292, 345],
} as const

export type DTAInstrumentTypes = keyof typeof ranksMap

/**
 * Calculates the ranking from a desired instrument part
 * to a more understandeable, commonly-used ranking number system.
 *
 * The results can be from `-1` (meaning "No Part") to `6` (meaning "Impossible").
 * - - - -
 * @param {DTAInstrumentTypes} type The instrument part you want to be calculated.
 * @param {number | undefined} rank `OPTIONAL` The rank number from the `.dta` file.
 * @returns {InstrRankingNumbers} The calculated instrument rank.
 */
export const rankCalculator = (type: DTAInstrumentTypes, rank?: number): InstrRankingNumbers => {
  let parseRankReturn: InstrRankingNumbers = -1

  if (rank === undefined || rank === 0) {
    return parseRankReturn
  }

  parseRankReturn++

  for (const value of ranksMap[type]) {
    if (rank >= value) parseRankReturn++
  }

  return parseRankReturn as InstrRankingNumbers
}

/**
 * Returns a `.dta` file-compatible ranking system number based on the given options.
 * - - - -
 * @param {DTAInstrumentTypes} type The instrument part you want to be processed to.
 * @param {InstrRankingNumbers | InstrRankingNames} rank A string that indicates the ranking you want for the instrument part.
 * @returns {number} A `.dta` file-compatible ranking system number.
 */
export const rankValuesToDTARankSystem = (type: DTAInstrumentTypes, rank: InstrRankingNumbers | InstrRankingNames): number => {
  if (rank === 'No Part' || rank === -1) return 0
  else if (rank === 'Warmup' || rank === 0) return 1
  else if (rank === 'Apprentice' || rank === 1) return ranksMap[type][0]
  else if (rank === 'Solid' || rank === 2) return ranksMap[type][1]
  else if (rank === 'Moderate' || rank === 3) return ranksMap[type][2]
  else if (rank === 'Challenging' || rank === 4) return ranksMap[type][3]
  else if (rank === 'Nightmare' || rank === 5) return ranksMap[type][4]
  else {
    // if (rank === 'Impossible' || rank === 6)
    return ranksMap[type][5]
  }
}

/**
 * Calculates a generic band ranking number based on the sum of the
 * ranking of all playable instruments divided by the quantity of playable instruments.
 * - - - -
 * @param {number} count The sum of the ranking of all playable instruments.
 * @param {number} quantity The quantity of playable instruments.
 * @returns {number} A generic band ranking number.
 */
export const bandAverageRankCalculator = (count: number, quantity: number): number => Number((count / quantity).toFixed())

export type DTARankObject = Partial<Record<DTAInstrumentTypes, InstrRankingNames | InstrRankingNumbers>>
export type DTARankObjectReturn = Pick<RB3CompatibleDTAFile, 'rank_band' | 'rank_bass' | 'rank_drum' | 'rank_guitar' | 'rank_keys' | 'rank_real_bass' | 'rank_real_guitar' | 'rank_real_keys' | 'rank_vocals'>

/**
 * Generates an object with values of any instrument rank formatted to a `DTAFile` ranking value.
 * - - - -
 * @param {DTARankObject} ranks An object with verbosed values of any instrument ranks.
 * @returns {DTARankObjectReturn} An object with values of any instrument rank formatted to a `DTAFile` ranking value.
 */
export const genInstrumentRankingObject = (ranks: DTARankObject): DTARankObjectReturn => {
  let allInstrCount = 0
  let playableInstrCount = 0
  let rank_band: number | undefined = undefined,
    rank_bass: number | undefined = undefined,
    rank_drum: number | undefined = undefined,
    rank_guitar: number | undefined = undefined,
    rank_keys: number | undefined = undefined,
    rank_real_bass: number | undefined = undefined,
    rank_real_guitar: number | undefined = undefined,
    rank_real_keys: number | undefined = undefined,
    rank_vocals: number | undefined = undefined

  for (const instr of Object.keys(ranks) as (keyof DTARankObject)[]) {
    if (instr === 'band') continue
    else if (instr === 'bass' || instr === 'drum' || instr === 'guitar' || instr === 'keys' || instr === 'vocals') {
      allInstrCount++
      playableInstrCount++
    } else allInstrCount++
  }

  if (allInstrCount === 0 || playableInstrCount === 0) throw new Error('Song must have at least one instrument to calculate rank.')

  const { band, bass, drum, guitar, keys, real_bass, real_guitar, real_keys, vocals } = ranks

  if (bass !== undefined) rank_bass = rankValuesToDTARankSystem('bass', bass)
  if (drum !== undefined) rank_drum = rankValuesToDTARankSystem('drum', drum)
  if (guitar !== undefined) rank_guitar = rankValuesToDTARankSystem('guitar', guitar)
  if (keys !== undefined) rank_keys = rankValuesToDTARankSystem('keys', keys)
  if (real_bass !== undefined) rank_real_bass = rankValuesToDTARankSystem('real_bass', real_bass)
  if (real_guitar !== undefined) rank_real_guitar = rankValuesToDTARankSystem('real_guitar', real_guitar)
  if (real_keys !== undefined) rank_real_keys = rankValuesToDTARankSystem('real_keys', real_keys)
  if (vocals !== undefined) rank_vocals = rankValuesToDTARankSystem('vocals', vocals)

  rank_band = band !== undefined ? rankValuesToDTARankSystem('band', band) : bandAverageRankCalculator((rank_bass ?? 0) + (rank_drum ?? 0) + (rank_guitar ?? 0) + (rank_keys ?? 0) + (rank_vocals ?? 0), playableInstrCount)

  return {
    rank_band,
    rank_bass,
    rank_drum,
    rank_guitar,
    rank_keys,
    rank_real_bass,
    rank_real_guitar,
    rank_real_keys,
    rank_vocals,
  }
}
