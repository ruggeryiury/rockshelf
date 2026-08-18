import type { BrowserWindow } from 'electron'
import { createHashFromBuffer, DirPath, pathLikeToDirPath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'
import { RockshelfFileSystemAPI, sendBuzyLoad, sendMessageBox, type RB3SongPackagesDataObject } from '../../core.exports'
import { getUnpackedFilesPathFromRootExtraction, rpcs3GenSongPackageManifest } from '../rbtools/lib.exports'
import { isValidFolderName } from '../strnum/isValidFolderName'
import { useDefaultOptions } from 'use-default-options'
import { RB3File } from './RB3File'
import { createRSPackImage } from '../rspackimg/createRSPackImage'
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { userData } from '../../init'
import { EDATFile } from '../rbtools'

export interface RB3FileExtractionOptions {
  /**
   * An array with songnames that will be extracted. If `undefined` or an empty array is defined, all songs from the song package will be extracted.
   */
  songs?: string[]
  /**
   * The name of the song package.
   */
  packageName?: string
  /**
   * The name of the song package folder.
   */
  packageFolderName?: string
}

export const extractFilesFromRB3File = async (rb3FilePath: FilePathLikeTypes, destPath: DirPathLikeTypes, extractOnRoot: boolean = false, songs: string[] = []): Promise<DirPath> => {
  const rb3 = new RB3File(rb3FilePath)
  await rb3.checkFileIntegrity()
  const dest = pathLikeToDirPath(destPath)

  const stat = await rb3.stat()
  if (!extractOnRoot) {
    const songsFolder = dest.gotoDir(`songs`)
    if (!songsFolder.exists) await songsFolder.mkDir(true)
  }

  for (const entry of stat.header.songEntries) {
    const songname = entry.songname
    if (songs.length === 0 || (songs.length > 0 && songs.includes(songname))) {
      const songnameFolder = dest.gotoDir(`songs/${songname}`)
      const genFolder = songnameFolder.gotoDir('gen')
      const files = extractOnRoot ? getUnpackedFilesPathFromRootExtraction('pkg', dest, songname) : { mid: songnameFolder.gotoFile(`${songname}.mid.edat`), mogg: songnameFolder.gotoFile(`${songname}.mogg`), png: genFolder.gotoFile(`${songname}_keep.png_ps3`), milo: genFolder.gotoFile(`${songname}.milo_ps3`), pan: songnameFolder.gotoFile(`${songname}.pan`), usr: songnameFolder.gotoFile(`${songname}.usr`), vnn: songnameFolder.gotoFile(`${songname}.vnn`), voc: songnameFolder.gotoFile(`${songname}.voc`), xvocab: songnameFolder.gotoFile(`${songname}.xvocab`), weights: genFolder.gotoFile(`${songname}_weights.bin`) }

      if (!extractOnRoot) {
        if (!songnameFolder.exists) await songnameFolder.mkDir(true)
        if (!genFolder.exists) await genFolder.mkDir(true)
      }

      let offset = stat.header.songDataOffset + entry.offset

      if (entry.moggSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.moggSize - 1 }), files.mogg.createWriteStreamSync())
        offset += entry.moggSize
      }
      if (entry.midiSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.midiSize - 1 }), files.mid.createWriteStreamSync())
        offset += entry.midiSize
      }
      if (entry.artworkSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.artworkSize - 1 }), files.png.createWriteStreamSync())
        offset += entry.artworkSize
      }
      if (entry.miloSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.miloSize - 1 }), files.milo.createWriteStreamSync())
        offset += entry.miloSize
      }
      if (entry.panSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.panSize - 1 }), files.pan.createWriteStreamSync())
        offset += entry.panSize
      }
      if (entry.usrSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.usrSize - 1 }), files.usr.createWriteStreamSync())
        offset += entry.usrSize
      }
      if (entry.vnnSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.vnnSize - 1 }), files.vnn.createWriteStreamSync())
        offset += entry.vnnSize
      }
      if (entry.vocSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.vocSize - 1 }), files.voc.createWriteStreamSync())
        offset += entry.vocSize
      }
      if (entry.xvocabSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.xvocabSize - 1 }), files.xvocab.createWriteStreamSync())
        offset += entry.xvocabSize
      }
      if (entry.weightsSize > 0) {
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.weightsSize - 1 }), files.weights.createWriteStreamSync())
        offset += entry.weightsSize
      }
    }
  }

  return dest
}

/**
 * Extracts the contents of a Rock Band 3 Song Package file into a song package folder installed on the RB3's USRDIR folder.
 * - - - -
 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
 * @param {FilePathLikeTypes} rb3FilePath The path to the Rock Band 3 Song Package file to be extracted.
 * @param {RB3FileExtractionOptions | undefined} [options] `OPTIONAL` An object with values that tweaks the extraction process.
 * @returns {Promise<RPCS3SongPackagesDataExtra | false>}
 */
export const extractRB3FileToRPCS3 = async (win: BrowserWindow, rb3FilePath: FilePathLikeTypes, options?: RB3FileExtractionOptions): Promise<RB3SongPackagesDataObject | false> => {
  if (!userData.userConfig) throw new Error('User config data is not loaded.')
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

  const devhdd0 = pathLikeToDirPath(userData.userConfig.devhdd0Path)

  sendBuzyLoad(win, { code: 'init', title: 'installingRB3File', steps: ['validatingPackageFolderName', 'extractingPackageFiles', 'updatingInstalledPackagesData'], onCompleted: ['resetInstallRB3FileScreenState'] })

  const packageFolder = RockshelfFileSystemAPI.rb3UsrDir(devhdd0).gotoDir(packageFolderName)
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
  let total = 2 // DTA + Package Artwork Image

  for (const entry of header.songEntries) {
    if (entry.artworkSize === 0) total--
    if (entry.moggSize > 0) total++
    if (entry.midiSize > 0) total++
    if (entry.artworkSize > 0) total++
    if (entry.miloSize > 0) total++
    if (entry.panSize > 0) total++
    if (entry.usrSize > 0) total++
    if (entry.vnnSize > 0) total++
    if (entry.vocSize > 0) total++
    if (entry.xvocabSize > 0) total++
    if (entry.weightsSize > 0) total++
  }
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
  const packageArtworkData = await createRSPackImage(thumbnail, packageArtworkPath, { packageName, type: 'rockshelf', source: header.sourceType, encryptionStatus: header.encryptionStatus, creationDate: header.dateISOString, category: header.packageCategory })
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

      if (entry.moggSize > 0) {
        const mogg = songPath.gotoFile(`${songname}.mogg`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingMOGGTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: mogg.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.moggSize - 1 }), mogg.createWriteStreamSync())
        offset += entry.moggSize
        count++
      }

      if (entry.midiSize > 0) {
        const edat = songPath.gotoFile(`${songname}.mid.edat`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingMIDITextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: edat.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.midiSize - 1 }), edat.createWriteStreamSync())
        offset += entry.midiSize
        count++
      }

      if (entry.artworkSize > 0) {
        const artwork = songGenPath.gotoFile(`${songname}_keep.png_ps3`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingArtworkTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: artwork.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.artworkSize - 1 }), artwork.createWriteStreamSync())
        offset += entry.artworkSize
        count++
      }

      if (entry.miloSize > 0) {
        const milo = songGenPath.gotoFile(`${songname}.milo_ps3`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingMILOTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: milo.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.miloSize - 1 }), milo.createWriteStreamSync())
        count++
      }

      if (entry.panSize > 0) {
        const pan = songPath.gotoFile(`${songname}.pan`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingPANTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: pan.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.panSize - 1 }), pan.createWriteStreamSync())
        count++
      }

      if (entry.usrSize > 0) {
        const usr = songPath.gotoFile(`${songname}.usr`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingUSRTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: usr.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.usrSize - 1 }), usr.createWriteStreamSync())
        count++
      }

      if (entry.vnnSize > 0) {
        const vnn = songPath.gotoFile(`${songname}.vnn`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingVNNTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: vnn.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.vnnSize - 1 }), vnn.createWriteStreamSync())
        count++
      }

      if (entry.vocSize > 0) {
        const voc = songPath.gotoFile(`${songname}.voc`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingVOCTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: voc.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.vocSize - 1 }), voc.createWriteStreamSync())
        count++
      }

      if (entry.xvocabSize > 0) {
        const xvocab = songPath.gotoFile(`${songname}.xvocab`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingXVOCABTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: xvocab.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.xvocabSize - 1 }), xvocab.createWriteStreamSync())
        count++
      }

      if (entry.weightsSize > 0) {
        const weights = songGenPath.gotoFile(`${songname}_weights.bin`)
        sendBuzyLoad(win, { code: 'subtext', key: 'writingWEIGHTSTextWithCount', messageValues: { count: count.toString(), total: total.toString(), name: weights.fullname } })
        await pipeline(createReadStream(rb3.path.path, { start: offset, end: offset + entry.weightsSize - 1 }), weights.createWriteStreamSync())
        count++
      }
    }
  }

  sendBuzyLoad(win, { code: 'incrementStep' })

  const devklic = EDATFile.genDevKLicHash(packageFolder.name)
  const { manifest, packageSize } = await rpcs3GenSongPackageManifest(packageFolder)
  const contentsHash = createHashFromBuffer(Buffer.from(manifest))
  const packageData = packageArtworkData.header

  sendBuzyLoad(win, { code: 'callSuccess' })

  return {
    name: packageFolder.name,
    path: packageFolder.path,
    thumbnailSrc: `rb3packimg://${encodeURIComponent(packageFolder.name)}`,
    packageType: 'rb3',
    dtaFilePath: dtaPath.path,
    packageSize,
    songsCount: dta.songs.length,
    devklic,
    contentsHash,
    songs: dta.songs,
    packageData,
  }
}
