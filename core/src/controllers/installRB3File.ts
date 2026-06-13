import type { FilePathLikeTypes } from 'node-lib'
import { useHandler } from '../core.exports'
import { extractRB3FileToRPCS3, type RB3FileExtractionOptions } from '../lib.exports'

export const installRB3File = useHandler(async (win, __, rb3FilePath: FilePathLikeTypes, options?: RB3FileExtractionOptions) => await extractRB3FileToRPCS3(win, rb3FilePath, options))
