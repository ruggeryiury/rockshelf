import type { ScoreDataInstrumentTypes, RB3Scores } from '../../core.exports'

export const getMostPlayedInstrument = (scoresList: RB3Scores[]): ScoreDataInstrumentTypes => {
  const results: ScoreDataInstrumentTypes[] = []
  if (scoresList.length === 0) return 'band'
  for (const score of scoresList) {
    if (score.bass.topScore > 0) results.push('bass')
    if (score.drums.topScore > 0) results.push('drums')
    if (score.guitar.topScore > 0) results.push('guitar')
    if (score.vocals.topScore > 0) results.push('vocals')
    if (score.keys.topScore > 0) results.push('keys')
    if (score.proBass.topScore > 0) results.push('proBass')
    if (score.proDrums.topScore > 0) results.push('proDrums')
    if (score.proGuitar.topScore > 0) results.push('proGuitar')
    if (score.proKeys.topScore > 0) results.push('proKeys')
    if (score.harmonies.topScore > 0) results.push('harmonies')
  }

  const mostFrequent = Array.from(new Set(results)).reduce((prev, curr) => (results.filter((el) => el === curr).length > results.filter((el) => el === prev).length ? curr : prev))

  return mostFrequent
}
