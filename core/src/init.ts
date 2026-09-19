import { DataSyncAPI, TempFilesDisposerAPI, UserDataAPI } from './core.exports'

export const userData = UserDataAPI.init()
export const dataSync = DataSyncAPI.init(userData)
export const temps = new TempFilesDisposerAPI()

export const cliOutputFormats = ['json', 'yaml', 'json-pretty'] as const
export type CLIOutputFormats = (typeof cliOutputFormats)[number]
export const cliOutputFormatsWithNone = [...cliOutputFormats, 'none'] as const
export type CLIOutputFormatsWithNone = (typeof cliOutputFormatsWithNone)[number]
