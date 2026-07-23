import { UserConfigAPI, useHandler } from '../core.exports'

/**
 * Deletes the user configuraton file and reload the window.
 */
export const deleteUserConfigAndRestart = useHandler(async (win, _, restartOnly: boolean = false): Promise<boolean> => {
  if (!restartOnly) {
    await UserConfigAPI.deleteFile()
    await UserConfigAPI.deletePackagesCacheFile()
  }
  win.reload()
  return true
})
