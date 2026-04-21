import { readUserConfigFile, sendDialog, useHandler } from '../core.exports'
import { isRPCS3Devhdd0PathValid, isRPCS3ExePathValid } from '../lib/rbtools/lib.exports'

export const testUserConfig = useHandler(async (win, _): Promise<boolean> => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }
  try {
    isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
    isRPCS3ExePathValid(userConfig.rpcs3ExePath)
  } catch (err) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }
  return true
})
