import { UserDataAPI, DataSyncAPI, TempFilesDisposerAPI } from './core.exports'
import chalk from 'chalk'

export const cliOutputFormats = ['json', 'yaml', 'json-pretty'] as const
export type CLIOutputFormats = (typeof cliOutputFormats)[number]
export const cliOutputFormatsWithNone = [...cliOutputFormats, 'none'] as const
export type CLIOutputFormatsWithNone = (typeof cliOutputFormatsWithNone)[number]

chalk.level = 3

export const userData = UserDataAPI.init()
export const dataSync = DataSyncAPI.init(userData)
export const temps = new TempFilesDisposerAPI()
