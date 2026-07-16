import axios from 'axios'
import { readUserConfigFile, RockshelfFileSys } from '../../core.exports'
import { isRPCS3Devhdd0PathValid } from '../rbtools/lib.exports'
import { Hex, type FilePathJSONRepresentation } from 'node-lib'

export interface ResponseGetBasicOptions {
  timeout?: number
}

export interface DeluxeInstalledData {
  status: 'vanilla' | 'installedNoVer' | 'installed'
  isUpdated: boolean
  installed:
    | {
        short: string
        sha: string
        authorName: string
        avatar: string
        commitMessage: string
        commitURL: string
        commitDate: string
        behindBy: number
      }
    | false
  latest:
    | {
        short: string
        sha: string
        authorName: string
        avatar: string
        commitMessage: string
        commitURL: string
        commitDate: string
        aheadBy: number
      }
    | undefined
  downloadedDXPatchFile: FilePathJSONRepresentation
}

export interface GitHubCommitVerification {
  verified: boolean
  reason: string
  signature: string | null
  payload: string | null
}

export interface GitHubCommitFile {
  sha: string
  filename: string
  status: 'added' | 'modified' | 'removed' | 'renamed'
  additions: number
  deletions: number
  changes: number
  blob_url: string
  raw_url: string
  contents_url: string
  patch?: string
}

export interface GitHubCommitStats {
  total: number
  additions: number
  deletions: number
}

export interface GitHubCommitParent {
  sha: string
  url: string
  html_url: string
}

export interface GitHubCommitTree {
  sha: string
  url: string
}

export interface GitHubUser {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string | null
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: 'User' | 'Bot'
  site_admin: boolean
}

export interface GitHubCommitAuthor {
  name: string
  email: string
  date: string // ISO 8601
}

export interface GitHubCommitData {
  author: GitHubCommitAuthor
  committer: GitHubCommitAuthor

  message: string
  tree: GitHubCommitTree

  url: string
  comment_count: number

  verification?: GitHubCommitVerification
}

export interface GitHubCommitResponse {
  sha: string
  node_id: string
  url: string
  html_url: string
  comments_url: string

  commit: GitHubCommitData

  author: GitHubUser | null
  committer: GitHubUser | null

  parents: GitHubCommitParent[]

  files?: GitHubCommitFile[]
  stats?: GitHubCommitStats
}

export interface GitHubCommitCompare {
  url: string
  html_url: string
  parmalink_url: string
  diff_url: string
  patch_url: string
  base_commit: GitHubCommitResponse
  merge_base_commit: GitHubCommitResponse
  status: 'behind' | 'identical'
  ahead_by: number
  behind_by: number
  total_commits: number
}

// #region Class

export class RockshelfGithubAPI {
  static async getRepositoryCommitStatus(options?: ResponseGetBasicOptions): Promise<GitHubCommitResponse> {
    const opts: Required<ResponseGetBasicOptions> = { timeout: 6000, ...options }
    const res = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/develop`, { responseType: 'json', timeout: opts.timeout })
    return res.data
  }
  static async getCommitDataFromCommitHash(commitHash: string, options?: ResponseGetBasicOptions): Promise<GitHubCommitResponse> {
    const opts: Required<ResponseGetBasicOptions> = { timeout: 6000, ...options }
    const res = await axios.get<GitHubCommitResponse>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/commits/${commitHash}`, { responseType: 'json', timeout: opts.timeout })
    return res.data
  }
  static async checkCommitsAhead(commitHash: string, options?: ResponseGetBasicOptions): Promise<GitHubCommitCompare> {
    const opts: Required<ResponseGetBasicOptions> = { timeout: 6000, ...options }

    const res = await axios.get<GitHubCommitCompare>(`https://api.github.com/repos/hmxmilohax/rock-band-3-deluxe/compare/develop...${commitHash}`, { responseType: 'json', timeout: opts.timeout })
    return res.data
  }

  static async getInstalledDeluxeData(): Promise<DeluxeInstalledData | false> {
    const userConfig = await readUserConfigFile()
    if (!userConfig) return false
    const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
    const dxHDR = RockshelfFileSys.dxHDRFile(devhdd0)
    const dxARK = RockshelfFileSys.dxARKFile(devhdd0)
    const dxVersionFile = RockshelfFileSys.dxVersionFile(devhdd0)

    if (!dxHDR.exists || !dxARK.exists) {
      const status = await this.getRepositoryCommitStatus()

      return {
        status: 'vanilla',
        isUpdated: false,
        installed: false,
        latest: {
          short: status.sha.slice(0, 7),
          sha: status.sha,
          authorName: status.author?.login || '',
          avatar: status.author?.avatar_url || '',
          commitMessage: status.commit.message,
          commitURL: status.commit.url,
          commitDate: status.commit.author.date,
          aheadBy: 0,
        },
        downloadedDXPatchFile: dxVersionFile.toJSON(),
      }
    }

    if (!dxVersionFile.exists)
      return {
        status: 'installedNoVer',
        isUpdated: false,
        installed: false,
        latest: undefined,
        downloadedDXPatchFile: dxVersionFile.toJSON(),
      }

    const dxVersion = (await dxVersionFile.readLines({ encoding: 'utf-8' })).map((val) => val.replace(/"/g, '').trimStart().trimEnd())[4]
    const isValidSHA = Hex.isHexString(dxVersion) && dxVersion.length === 7
    if (!isValidSHA) return false

    const commitsAhead = await RockshelfGithubAPI.checkCommitsAhead(dxVersion)
    const latestDXVersion = commitsAhead.base_commit.sha.slice(0, 7)

    const commitData = await RockshelfGithubAPI.getCommitDataFromCommitHash(dxVersion)
    const downloadedDXPatchFile = RockshelfFileSys.getDownloadedDXPatchFile(latestDXVersion)

    const isUpdated = commitsAhead.behind_by === 0

    return {
      status: 'installed',
      isUpdated,
      installed: {
        short: dxVersion,
        sha: commitData.sha,
        authorName: commitData.author?.login || '',
        avatar: commitData.author?.avatar_url || '',
        commitMessage: commitData.commit.message,
        commitURL: commitData.commit.url,
        commitDate: commitData.commit.author.date,
        behindBy: commitsAhead.behind_by,
      },

      latest: isUpdated
        ? undefined
        : {
            short: commitsAhead.base_commit.sha.slice(0, 7),
            sha: commitsAhead.base_commit.sha,
            authorName: commitsAhead.base_commit.author?.login || '',
            avatar: commitsAhead.base_commit.author?.avatar_url || '',
            commitMessage: commitsAhead.base_commit.commit.message,
            commitURL: commitsAhead.base_commit.commit.url,
            commitDate: commitsAhead.base_commit.commit.author.date,
            aheadBy: commitsAhead.behind_by,
          },
      downloadedDXPatchFile: downloadedDXPatchFile.toJSON(),
    }
  }
}
