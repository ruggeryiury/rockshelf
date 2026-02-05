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

export {}
