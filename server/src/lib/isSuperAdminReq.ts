import { readEnv } from './readEnv'

export const isSuperAdminReq = (auth?: string): boolean => {
  const { adminKey } = readEnv()
  if (!auth || auth.toLowerCase() !== adminKey.toLowerCase()) return false
  return true
}
