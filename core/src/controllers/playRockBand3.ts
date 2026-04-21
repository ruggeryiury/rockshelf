import { getRPCS3UserConfigFile, readUserConfigFile, sendDialog, useHandler } from '../core.exports'
import { pathLikeToDirPath, type DirPath, type FilePath } from 'node-lib'
import { exec } from 'node:child_process'
import { type RockBand3Data, isRPCS3Devhdd0PathValid, isRPCS3ExePathValid, rpcs3GetRB3Stats } from '../lib/rbtools/lib.exports'

export const playRockBand3 = useHandler(async (win, _) => {
  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  let devhdd0Path: DirPath, rpcs3ExePath: FilePath, stats: RockBand3Data, rpcs3UserConfigFile: FilePath, gameInstallationPath: DirPath

  try {
    devhdd0Path = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
    rpcs3ExePath = isRPCS3ExePathValid(userConfig.rpcs3ExePath)
    rpcs3UserConfigFile = getRPCS3UserConfigFile(rpcs3ExePath)
    stats = await rpcs3GetRB3Stats(devhdd0Path, rpcs3ExePath)

    if (!stats.path) {
      sendDialog(win, 'corruptedGameInstallation')
      return false
    }

    gameInstallationPath = pathLikeToDirPath(stats.path)
  } catch (err) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const command = `${rpcs3ExePath.name} ${userConfig.rpcs3NoGUI ? '--no-gui' : ''} --config "${rpcs3UserConfigFile.path}" "${gameInstallationPath.gotoFile('PS3_GAME/USRDIR/EBOOT.BIN').path}"`

  const runRPCS3 = await new Promise<boolean>((resolve, reject) => {
    const x = exec(command, { cwd: rpcs3ExePath.root, windowsHide: true })
    x.on('error', (err) => reject(err))

    setTimeout(() => {
      resolve(x.kill())
    }, 4000)
  })

  return runRPCS3
})
