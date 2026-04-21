import { readUserConfigFile, sendDialog, useHandler } from '../core.exports'
import { type ParsedRB3SaveData, type InstrumentScoreData, RB3SaveData } from '../lib/rbtools'

/**
 * Retrieves information about your scoring based on the user's most played instrument and difficulty.
 */
export const rpcs3GetInstrumentScores = useHandler(async (win, __, saveData: ParsedRB3SaveData): Promise<false | InstrumentScoreData> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const { mostPlayedDifficulty, mostPlayedInstrument } = userConfig
  return RB3SaveData.getInstrumentScoreData(saveData, mostPlayedInstrument, mostPlayedDifficulty)
})
