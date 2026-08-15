import { UserDataAPI, DataSyncAPI, TempFilesDisposerAPI } from './core.exports'

export const userData = UserDataAPI.init()
export const dataSync = DataSyncAPI.init(userData)
export const temps = new TempFilesDisposerAPI()

export const cliOutputFormatsWithNone = ['json', 'yaml', 'json-pretty', 'none'] as const
export type CLIOutputFormatsWithNone = (typeof cliOutputFormats)[number]
export const cliOutputFormats = ['json', 'yaml', 'json-pretty'] as const
export type CLIOutputFormats = (typeof cliOutputFormats)[number]
