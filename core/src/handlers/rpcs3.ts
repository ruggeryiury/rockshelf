import { pathLikeToDirPath, pathLikeToFilePath, type DirPath, type FilePath } from 'node-lib'
import { RockshelfFileSystemAPI, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { dataSync, userData } from '../data'
import type { RockBand3Data } from '../lib/rbtools/lib.exports'
import { exec } from 'child_process'

export const playRB3 = useHandler(async (win): Promise<boolean> => {
  if (!userData.userConfig) throw new Error('User config data is not loaded.')

  let devhdd0Path: DirPath, rpcs3ExePath: FilePath, stats: RockBand3Data, rpcs3UserConfigFile: FilePath, gameInstallationPath: DirPath

  try {
    devhdd0Path = pathLikeToDirPath(userData.userConfig.devhdd0Path)
    rpcs3ExePath = pathLikeToFilePath(userData.userConfig.rpcs3ExePath)
    rpcs3UserConfigFile = RockshelfFileSystemAPI.rpcs3UserConfigFile(rpcs3ExePath)
    stats = await dataSync.getRockBand3Data()

    if (!stats.path) {
      sendDialog(win, 'corruptedGameInstallation')
      return false
    }

    gameInstallationPath = pathLikeToDirPath(stats.path)
  } catch (err) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  const command = `${rpcs3ExePath.name} ${userData.userConfig.rpcs3NoGUI ? '--no-gui' : ''} --config "${rpcs3UserConfigFile.path}" "${gameInstallationPath.gotoFile('PS3_GAME/USRDIR/EBOOT.BIN').path}"`

  const runRPCS3 = await new Promise<boolean>((resolve, reject) => {
    const x = exec(command, { cwd: rpcs3ExePath.root, windowsHide: true })
    x.on('error', (err) => reject(err))

    setTimeout(() => {
      resolve(x.kill())
    }, 4000)
  })

  return runRPCS3
})

export const installHighMemoryPatch = useHandler(async (win, _): Promise<boolean> => {
  if (!userData.userConfig) throw new Error('User config data is not loaded.')

  const usrdir = pathLikeToDirPath(userData.userConfig.devhdd0Path).gotoDir('game/BLUS30463/USRDIR')
  if (!usrdir.exists) await usrdir.mkDir(true)
  const highMemoryDTAFile = usrdir.gotoFile('dx_high_memory.dta')
  await highMemoryDTAFile.write('(dx_high_memory 190000000)\n(dx_song_count 16000)\n')
  sendMessageBox(win, { type: 'success', code: 'installHighMemoryPatch' })
  return true
})
