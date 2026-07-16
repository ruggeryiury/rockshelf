import type { BrowserWindow } from 'electron'
import { DirPath, type FilePathLikeTypes } from 'node-lib'
import { rpcs3GetSongPackagesStatsExtra, type RPCS3SongPackagesDataExtra } from '../rpcs3/rpcs3GetSongPackagesStatsExtra'
import { RockshelfFileSys, readUserConfigFile, sendBuzyLoad, sendDialog, sendMessageBox } from '../../core.exports'
import { isRPCS3Devhdd0PathValid } from '../rbtools/lib.exports'
import { isValidFolderName } from '../strnum/isValidFolderName'
import { useDefaultOptions } from 'use-default-options'
import { RB3File } from './RB3File'
import { createRSPackImage } from '../rspackimg/createRSPackImage'
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { utimes } from 'node:fs/promises'

export interface RB3FileExtractionOptions {
  songs?: string[]
  packageName?: string
  packageFolderName?: string
}

export const extractRB3FileToRPCS3 = async (win: BrowserWindow, rb3FilePath: FilePathLikeTypes, options?: RB3FileExtractionOptions): Promise<RPCS3SongPackagesDataExtra | false> => {
  const { songs, packageFolderName, packageName } = useDefaultOptions<RB3FileExtractionOptions>(
    {
      songs: [],
      packageName: '',
      packageFolderName: '',
    },
    options
  )
  const rb3 = new RB3File(rb3FilePath)

  try {
    await rb3.checkFileIntegrity()
  } catch (err) {
    sendMessageBox(win, { type: 'error', code: 'selectRB3FileInvalidFileSignature', messageValues: { path: rb3.path.path } })
    return false
  }

  const userConfig = await readUserConfigFile()
  if (!userConfig) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  let devhdd0: DirPath
  try {
    devhdd0 = isRPCS3Devhdd0PathValid(userConfig.devhdd0Path)
  } catch (err) {
    sendDialog(win, 'corruptedUserConfig')
    return false
  }

  sendBuzyLoad(win, { code: 'init', title: 'installingRB3File', steps: ['validatingPackageFolderName', 'extractingPackageFiles', 'updatingInstalledPackagesData'], onCompleted: ['resetInstallRB3FileScreenState'] })

  const packageFolder = RockshelfFileSys.rb3UsrDir(devhdd0).gotoDir(packageFolderName)
  const folderNameTestResults = isValidFolderName(packageFolderName)

  if (typeof folderNameTestResults === 'string') {
    sendBuzyLoad(win, {
      code: 'throwError',
      key: `errorCreateNewPackage${folderNameTestResults.charAt(0).toUpperCase()}${folderNameTestResults.slice(1)}`,
      messageValues: { packageFolderName },
    })
    return false
  }

  if (packageFolderName.length > 42) {
    sendBuzyLoad(win, {
      code: 'throwError',
      key: 'errorCreateNewPackageFolderNameTooBig',
      messageValues: { packageFolderName },
    })
    return false
  }

  if (packageFolder.exists) {
    await packageFolder.deleteDir(true)
    await packageFolder.mkDir(true)
  }

  sendBuzyLoad(win, { code: 'incrementStep' })

  const { header, dta, thumbnail, description } = await rb3.stat()
  let count = 1
  let total = 2 + dta.songs.length * 4

  for (const entry of header.songEntries) if (entry.artworkSize === 0) total--

  if (description && description.length > 0) total++

  const packageSongsPath = packageFolder.gotoDir('songs')
  if (!packageSongsPath.exists) await packageSongsPath.mkDir(true)

  const dtaPath = packageSongsPath.gotoFile('songs.dta')
  sendBuzyLoad(win, { code: 'subtext', key: 'writingPKGDTATextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: dtaPath.fullname } })
  dta.songs = dta.songs.filter((song) => songs.includes(song.songname))
  dta.sort('ID')
  await dta.export(dtaPath)
  count++

  const packageArtworkPath = packageFolder.gotoFile('folder.jpg')
  sendBuzyLoad(win, { code: 'subtext', key: 'writingPKGThumbnailTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: packageArtworkPath.fullname } })
  await createRSPackImage(thumbnail, packageArtworkPath, { packageName, type: 'rockshelf', source: header.sourceType, encryptionStatus: header.encryptionStatus, creationDate: header.dateISOString, category: header.packageCategory })
  count++

  if (description && description.length > 0) {
    const descPath = packageFolder.gotoFile('package.md')
    sendBuzyLoad(win, { code: 'subtext', key: 'writingPKGDescTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: descPath.fullname } })
    await descPath.write(description)
    count++
  }

  for (const entry of header.songEntries) {
    if (songs.includes(entry.songname)) {
      const songname = entry.songname
      let offset = header.songDataOffset + entry.offset

      const songGenPath = packageSongsPath.gotoDir(`${songname}/gen`)
      if (!songGenPath.exists) await songGenPath.mkDir(true)
      const songPath = songGenPath.gotoDir('../')

      const mogg = songPath.gotoFile(`${songname}.mogg`)
      sendBuzyLoad(win, { code: 'subtext', key: 'writingMOGGTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: mogg.fullname } })
      await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.moggSize - 1 }), mogg.createWriteStreamSync())
      offset += entry.moggSize
      count++

      const edat = songPath.gotoFile(`${songname}.mid.edat`)
      sendBuzyLoad(win, { code: 'subtext', key: 'writingMIDITextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: edat.fullname } })
      await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.midiSize - 1 }), edat.createWriteStreamSync())
      offset += entry.midiSize
      count++

      if (entry.artworkSize > 0) {
        const artwork = songGenPath.gotoFile(`${songname}_keep.png_ps3`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingArtworkTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: edat.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.artworkSize - 1 }), artwork.createWriteStreamSync())
        offset += entry.artworkSize
        count++
      }

      const milo = songGenPath.gotoFile(`${songname}.milo_ps3`)
      sendBuzyLoad(win, { code: 'subtext', key: 'writingMILOTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: edat.fullname } })
      await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.miloSize - 1 }), milo.createWriteStreamSync())
      count++
    }
  }

  sendBuzyLoad(win, { code: 'incrementStep' })

  const cache = RockshelfFileSys.packagesCacheFile()
  const packagesData = await rpcs3GetSongPackagesStatsExtra(devhdd0)
  await cache.write(JSON.stringify(packagesData))

  const now = new Date()
  await utimes(cache.path, now, now)
  if (packagesData.parsingErrors.length > 0) sendDialog(win, 'parsingErrorsOnPackagesDTA')

  sendBuzyLoad(win, { code: 'callSuccess' })

  return packagesData
}
