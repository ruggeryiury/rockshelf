import { useHandlerWithUserConfig } from '../electron-lib/useHandler'
import { RB3SaveData, type InstrumentScoreData, type ParsedRB3SaveData } from 'rbtools'

export const getInstrumentScoresData = useHandlerWithUserConfig(async (_, __, { mostPlayedInstrument, mostPlayedDifficulty }, saveData: ParsedRB3SaveData): Promise<InstrumentScoreData> => {
  return RB3SaveData.getInstrumentScoreData(saveData, mostPlayedInstrument, mostPlayedDifficulty)
})
