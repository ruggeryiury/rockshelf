import { createWriteStream, createReadStream } from 'node:fs'
import { type FilePathLikeTypes, type DirPathLikeTypes, pathLikeToDirPath, StreamWriter, BinaryWriter, createHashFromBuffer, pathLikeToFilePath } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import { DTAParser, EDATFile, MOGGFile } from '../rbtools'
import { dateISOFormatToObject } from '../utils/date'
import { isJPEGRockshelfPackImage, parseRSPackImageFile, rsPackImage } from '../rspackimg/parseRSPackImage'
import { getKeyFromMapValue } from '../rbtools/utils.exports'
import { rpcs3GenSongPackageManifest } from '../rbtools/lib.exports'
import { calculateSongFilesSizeFromSongname, type SongFilesSizeObject } from './calculateSongFilesSizeFromSongname'
import type { BrowserWindow } from 'electron'
import { temporaryFile } from 'tempy'
import { sendBuzyLoad } from '../senders/buzyLoad'

export interface CreateRB3FileOptions {
  author?: string
}

export const createRB3FileFromRPCS3PackageFolder = async (win: BrowserWindow, packageDirPath: DirPathLikeTypes, destPath: FilePathLikeTypes, options?: CreateRB3FileOptions): Promise<boolean> => {
  const { author } = useDefaultOptions({ author: '' }, options)
  const packagePath = pathLikeToDirPath(packageDirPath)

  sendBuzyLoad(win, { code: 'init', title: 'exportingPackage', steps: ['validatingPackageData', 'writingSongFilesIntoPackageFile'], onCompleted: ['resetExportPackageModalState'] })

  const { manifest, packageSize } = await rpcs3GenSongPackageManifest(packagePath)
  const contentsHash = Buffer.from(createHashFromBuffer(Buffer.from(manifest)), 'hex')

  const dtaPath = packagePath.gotoFile('songs/songs.dta')
  if (!dtaPath.exists) {
    sendBuzyLoad(win, {
      code: 'throwError',
      key: `errorExportPackageDTAFileNotFound`,
    })
    return false
  }

  const thumbnailPath = packagePath.gotoFile('folder.jpg')
  if (!thumbnailPath.exists) {
    sendBuzyLoad(win, {
      code: 'throwError',
      key: `errorExportPackagePackageThumbnailNotFound`,
    })
    return false
  }
  const isValid = await isJPEGRockshelfPackImage(thumbnailPath)
  if (!isValid) {
    sendBuzyLoad(win, {
      code: 'throwError',
      key: `errorExportPackageInvalidRockshelfImageFile`,
    })
    return false
  }
  const thumbnailStats = await thumbnailPath.stat()
  const parsedThumbnail = await parseRSPackImageFile(thumbnailPath)

  const descFilePath = packagePath.gotoFile('package.md')
  let descFileLength = 0
  if (descFilePath.exists) {
    const descFileStats = await descFilePath.stat()
    descFileLength = descFileStats.size
  }

  const parser = await DTAParser.fromFile(dtaPath)
  parser.sort('Shortname')
  parser.patchInvalidValues()
  parser.patchCores()
  parser.patchSongsEncodings()
  parser.patchIDs()

  const dateNow = new Date()
  const date = dateISOFormatToObject(dateNow.toISOString())

  const packageName = Buffer.from(parsedThumbnail.packageName)
  const packageFolderName = Buffer.from(packagePath.name)
  const dtaContent = Buffer.from(parser.stringify())

  const io = await StreamWriter.toFile(destPath, true)
  const header = new BinaryWriter()

  header.writeASCII('RB3')
  header.writeUInt8(1)
  header.writeUInt16LE(parser.songs.length)
  header.writeUInt8(packageName.length)
  header.writeUInt8(packageFolderName.length)
  header.writeUInt8(getKeyFromMapValue(rsPackImage.type, parsedThumbnail.type) ?? 0)
  header.writeUInt8(getKeyFromMapValue(rsPackImage.source, parsedThumbnail.source) ?? 0)
  header.writeUInt8(getKeyFromMapValue(rsPackImage.encryptionStatus, parsedThumbnail.encryptionStatus) ?? 0)
  header.writeUInt8(author.length)
  header.writeUInt32LE(dtaContent.length)
  header.writeUInt32LE(descFileLength)
  header.writeUInt32LE(thumbnailStats.size - isValid.footerSizeLength)
  header.writeUInt16LE(0)
  header.writeUInt16LE(date.year)
  header.writeUInt8(date.month)
  header.writeUInt8(date.day)
  header.writeUInt8(date.hour)
  header.writeUInt8(date.min)
  header.writeUInt8(date.sec)
  header.writeUInt64LE(BigInt(packageSize))

  const songsIO: BinaryWriter[] = []

  let songDataStartOffset = 0

  const songsObj: SongFilesSizeObject[] = []

  for (const song of parser.songs) {
    const sizeObj = await calculateSongFilesSizeFromSongname(packagePath, song.songname)
    songsObj.push(sizeObj)

    const songIO = new BinaryWriter()
    songIO.writeASCII(song.songname, 0x2a)
    songIO.writeUInt64LE(BigInt(songDataStartOffset))
    songIO.writeUInt32LE(sizeObj.mogg)
    songIO.writeUInt32LE(sizeObj.midi)
    songIO.writeUInt32LE(sizeObj.artwork)
    songIO.writeUInt32LE(sizeObj.milo)
    songIO.writePadding(0x0e)
    songDataStartOffset += sizeObj.totalSize

    songsIO.push(songIO)
  }

  let descFileBuffer: Buffer = Buffer.alloc(0)
  if (descFilePath.exists) {
    descFileBuffer = await descFilePath.read()
  }
  const thumbnailFileBuffer = (await thumbnailPath.read()).subarray(0, thumbnailStats.size - isValid.footerSizeLength)

  const songDataOffset = 0x50 + 0x50 * parser.songs.length + packageName.length + packageFolderName.length + author.length + dtaContent.length + descFileBuffer.length + thumbnailFileBuffer.length

  header.writeUInt32LE(songDataOffset)
  header.writeUInt8(1)
  header.writePadding(2)
  header.write(contentsHash)

  io.write(header.toBuffer())

  for (const sio of songsIO) {
    io.write(sio.toBuffer())
    sio.clearContents()
  }

  io.write(packageName)
  io.write(packageFolderName)
  if (author) io.writeUTF8(author)
  io.write(dtaContent)
  if (descFilePath.exists) io.write(descFileBuffer)
  io.write(thumbnailFileBuffer)

  if (io.length !== songDataOffset) {
    await io.close()
    if (io.filePath.exists) await io.filePath.delete()
    sendBuzyLoad(win, {
      code: 'throwError',
      key: `errorExportPackageSongDataOffsetError`,
    })
    return false
  }

  await io.close()

  sendBuzyLoad(win, { code: 'incrementStep' })
  let fileProcessedCount = 0
  const allFilesToBeProcessed = songsObj.length * 4

  const stream = createWriteStream(io.filePath.path, { flags: 'a' })

  for (const song of songsObj) {
    const mogg = new MOGGFile(song.moggFilePath)

    if (await mogg.isEncrypted()) {
      sendBuzyLoad(win, { code: 'subtext', key: 'decryptingMOGGTextWithCount', messageValues: { name: mogg.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
      const tempMOGG = await mogg.decrypt(temporaryFile({ extension: 'midi' }))

      sendBuzyLoad(win, { code: 'subtext', key: 'writingMOGGTextWithCount', messageValues: { name: mogg.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
      await new Promise<boolean>((res, rej) => {
        const readStream = createReadStream(tempMOGG.path.path)

        readStream.on('data', (chunk: Buffer) => stream.write(chunk))
        readStream.on('end', () => {
          readStream.close()
          res(true)
        })
        readStream.on('error', rej)
      })

      if (tempMOGG.path.exists) await tempMOGG.path.delete()
    } else {
      sendBuzyLoad(win, { code: 'subtext', key: 'writingMOGGTextWithCount', messageValues: { name: mogg.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
      await new Promise<boolean>((res, rej) => {
        const readStream = createReadStream(mogg.path.path)

        readStream.on('data', (chunk: Buffer) => stream.write(chunk))
        readStream.on('end', () => {
          readStream.close()
          res(true)
        })
        readStream.on('error', rej)
      })
    }
    fileProcessedCount++

    const midi = new EDATFile(song.midiFilePath)
    if (await midi.isEncrypted()) {
      sendBuzyLoad(win, { code: 'subtext', key: 'decryptingMIDITextWithCount', messageValues: { name: midi.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
      const tempMidi = await midi.decrypt({ devKLicHash: EDATFile.genDevKLicHash(packagePath.name), destPath: temporaryFile({ extension: 'midi' }) })

      sendBuzyLoad(win, { code: 'subtext', key: 'writingMIDITextWithCount', messageValues: { name: midi.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
      await new Promise<boolean>((res, rej) => {
        const readStream = createReadStream(tempMidi.path.path)

        readStream.on('data', (chunk: Buffer) => stream.write(chunk))
        readStream.on('end', () => {
          readStream.close()
          res(true)
        })
        readStream.on('error', rej)
      })

      if (tempMidi.path.exists) await tempMidi.path.delete()
    } else {
      sendBuzyLoad(win, { code: 'subtext', key: 'writingMIDITextWithCount', messageValues: { name: midi.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
      await new Promise<boolean>((res, rej) => {
        const readStream = createReadStream(midi.path.path)

        readStream.on('data', (chunk: Buffer) => stream.write(chunk))
        readStream.on('end', () => {
          readStream.close()
          res(true)
        })
        readStream.on('error', rej)
      })
    }
    fileProcessedCount++

    const artwork = pathLikeToFilePath(song.artworkFilePath)
    sendBuzyLoad(win, { code: 'subtext', key: 'writingArtworkTextWithCount', messageValues: { name: artwork.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
    await new Promise<boolean>((res, rej) => {
      const readStream = createReadStream(artwork.path)

      readStream.on('data', (chunk: Buffer) => stream.write(chunk))
      readStream.on('end', () => {
        readStream.close()
        res(true)
      })
      readStream.on('error', rej)
    })
    fileProcessedCount++

    const milo = pathLikeToFilePath(song.miloFilePath)
    sendBuzyLoad(win, { code: 'subtext', key: 'writingMILOTextWithCount', messageValues: { name: milo.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
    await new Promise<boolean>((res, rej) => {
      const readStream = createReadStream(milo.path)

      readStream.on('data', (chunk: Buffer) => stream.write(chunk))
      readStream.on('end', () => {
        readStream.close()
        res(true)
      })
      readStream.on('error', rej)
    })
    fileProcessedCount++
  }

  stream.end()

  sendBuzyLoad(win, { code: 'callSuccess' })

  return true
}
