import { dialog } from 'electron'
import { useHandler } from '../electron-lib/useHandler'
import { pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'
import { sendMessage } from '../electron-lib/sendMessage'

/**
 * Checks if the provided `dev_hdd0` folder path is valid.
 * - - - -
 * @param {DirPathLikeTypes} devhdd0Path The `dev_hdd0` folder path you want to check.
 * @returns {boolean}
 */
export const isDevhdd0PathValid = (devhdd0Path: DirPathLikeTypes): boolean => {
  let proof = true
  const devhdd0 = pathLikeToDirPath(devhdd0Path)
  if (!devhdd0.exists) throw new Error(`Provided dev_hdd0 folder path "${devhdd0.path}" does not exist`)
  if (!devhdd0.gotoDir('game').exists) proof = false
  if (!devhdd0.gotoDir('home').exists) proof = false

  return proof
}

export const selectDevhdd0Folder = useHandler(async (win): Promise<string | false> => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    sendMessage(win, {
      type: 'info',
      module: 'rpcs3',
      method: 'selectDevhdd0Folder',
      code: 'actionCancelledByUser',
    })
    return false
  }
  const [devhdd0] = selection.filePaths.map((dir) => pathLikeToDirPath(dir))

  if (!isDevhdd0PathValid(devhdd0)) {
    sendMessage(win, {
      type: 'error',
      module: 'rpcs3',
      method: 'selectDevhdd0Folder',
      code: 'invalidFolder',
      messageValues: { path: devhdd0.path },
    })
    return false
  }
  return devhdd0.path
})
