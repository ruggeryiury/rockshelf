import { UserConfigAPI, RockshelfFileSystemAPI, sendDialog, sendMessageBox, useHandler } from '../core.exports'
import { isRPCS3Devhdd0PathValid } from '../lib/rbtools/lib.exports'
import { getReadableBytesSize, Hex } from 'node-lib'
import axios from 'axios'
import type { ReadStream } from 'node:fs'
import unzipper from 'unzipper'
import { RockshelfGithubAPI, type DeluxeInstalledData } from '../lib.exports'

export interface DeluxeInstallationOptions {
  latestVersionHash: string
  type: 'standard' | 'customCharacters'
}

export const downloadAndInstallDeluxe = useHandler(async (win, __, options: DeluxeInstallationOptions): Promise<false | DeluxeInstalledData> => {
  if (options.latestVersionHash.length !== 7) throw new Error('The provided commit hash is invalid.')
  const downloadLink = options.type === 'standard' ? 'https://nightly.link/hmxmilohax/rock-band-3-deluxe/workflows/build/develop/RB3DX-Rockshelf.zip' : 'https://nightly.link/hmxmilohax/rock-band-3-deluxe/workflows/build/develop/RB3DX-Rockshelf-CustomCharacters.zip'
  const userConfig = await UserConfigAPI.readFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }
  const devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
  const dxVersionFile = RockshelfFileSystemAPI.dxVersionFile(devhdd0)

  const deluxeZipFile = RockshelfFileSystemAPI.getDownloadedDXPatchFile(options.latestVersionHash)
  if (!deluxeZipFile.exists) {
    sendMessageBox(win, { type: 'loading', code: 'fetchingDataFromDeluxeServers' })

    let downloadedBytes = 0,
      totalBytes = 0

    const response = await axios.get<ReadStream>(downloadLink, { responseType: 'stream' })
    totalBytes = Number(response.headers['content-length'])

    const deluxeWriter = await deluxeZipFile.createWriteStream()

    const interval = setInterval(() => {
      sendMessageBox(win, { type: 'progressBar', code: 'downloadingDeluxeText', progress: { count: getReadableBytesSize(downloadedBytes), total: getReadableBytesSize(totalBytes), percentage: `${((downloadedBytes / totalBytes) * 100).toFixed().toString()}%` } })
    }, 1000)

    await new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        deluxeWriter.write(chunk)
        downloadedBytes += chunk.length
      })

      response.data.on('end', () => {
        clearInterval(interval)
        sendMessageBox(win, { type: 'progressBar', code: 'downloadingDeluxeText', progress: { count: getReadableBytesSize(totalBytes), total: getReadableBytesSize(totalBytes), percentage: `100%` } })
        resolve(true)
      })

      response.data.on('error', (err: Error) => reject(err))
    })

    deluxeWriter.close()
  }

  const zip = await unzipper.Open.file(deluxeZipFile.path)

  let extractedFiles = 0
  const totalFiles = zip.files.length
  sendMessageBox(win, { type: 'progressBar', code: 'unzippingDeluxePatchText', progress: { count: extractedFiles, total: totalFiles } })
  for (const entry of zip.files) {
    const dest = RockshelfFileSystemAPI.rb3UsrDir(devhdd0).gotoFile(`../${entry.path}`)
    const destRootFolder = dest.gotoDir('')
    if (!destRootFolder.exists) await destRootFolder.mkDir()
    await new Promise((resolve, reject) => {
      entry
        .stream()
        .pipe(dest.createWriteStreamSync())
        .on('close', () => resolve(true))
        .on('error', (err) => reject(err))
    })
    extractedFiles++
    sendMessageBox(win, { type: 'progressBar', code: 'unzippingDeluxePatchText', progress: { count: extractedFiles, total: totalFiles } })
  }

  await dxVersionFile.write(`(version\r\n   "r0000+${options.latestVersionHash}"\r\n)\r\n(commit\r\n   "${options.latestVersionHash}"\r\n)\r\n`, 'utf-8', true)

  sendMessageBox(win, { type: 'success', code: 'deluxeInstall' })

  await deluxeZipFile.delete()

  return await RockshelfGithubAPI.getInstalledDeluxeData()
})
