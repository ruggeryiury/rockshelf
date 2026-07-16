import axios from 'axios'
import { useHandler } from '../core.exports'
import { RockshelfGithubAPI, type ResponseGetBasicOptions } from '../lib.exports'

export const checkCommitsAhead = useHandler(async (_, __, commitHash: string, options?: ResponseGetBasicOptions) => await RockshelfGithubAPI.checkCommitsAhead(commitHash, options))
