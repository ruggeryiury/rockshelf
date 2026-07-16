import axios from 'axios'
import { useHandler } from '../core.exports'
import { RockshelfGithubAPI, type GitHubCommitResponse, type ResponseGetBasicOptions } from '../lib.exports'

export const getCommitDataFromCommitHash = useHandler(async (_, __, commitHash: string, options?: ResponseGetBasicOptions): Promise<GitHubCommitResponse> => await RockshelfGithubAPI.getCommitDataFromCommitHash(commitHash, options))
