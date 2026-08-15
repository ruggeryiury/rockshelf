import { createWriteStream, createReadStream } from 'node:fs'
import { type FilePathLikeTypes, type DirPathLikeTypes, pathLikeToDirPath, StreamWriter, BinaryWriter, createHashFromBuffer, pathLikeToFilePath } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import { DTAParser, EDATFile, MOGGFile } from '../rbtools'
import { isJPEGRockshelfPackImage, parseRSPackImageFile, rsPackImage } from '../rspackimg/parseRSPackImage'
import { getKeyFromMapValue, dateISOFormatToObject } from '../rbtools/utils.exports'
import { rpcs3GenSongPackageManifest } from '../rbtools/lib.exports'
import { calculateSongFilesSizeFromSongname, type SongFilesSizeObject } from './utils'
import type { BrowserWindow } from 'electron'
import { temporaryFile } from 'tempy'
import { sendBuzyLoad } from '../senders/buzyLoad'

export const RB3_HEADER_SIZE = 0x60
export const RB3_HEADER_PADDING = 0x16
export const RB3_SONG_ENTRY_SIZE = 0x60
export const RB3_SONG_ENTRY_PADDING = 0x0c
export const RB3_SONGNAME_MAX_LENGTH = 0x2a

export interface CreateRB3FileOptions {
  /**
   * The name of the creator of the song package.
   */
  creatorName?: string
  /**
   * Default is `true`.
   */
  useBuzyLoad?: boolean
  /**
   * Overwrites the package folder name used on the package.
   */
  overwritePackageFolderName?: string
}

/**
 * Creates a Rock Band 3 Song Package file from a song package installed on the RB3's USRDIR folder.
 * - - - -
 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
 * @param {DirPathLikeTypes} packageDirPath The path to the song package on the RB3's USRDIR folder.
 * @param {FilePathLikeTypes} destPath The destination path of the RB3 file.
 * @param {CreateRB3FileOptions | undefined} [options] `OPTIONAL` An object with values that tweaks the file creation process.
 * @returns {Promise<void>}
 */
export const createRB3FileFromRPCS3PackageFolder = async (win: BrowserWindow, packageDirPath: DirPathLikeTypes, destPath: FilePathLikeTypes, options?: CreateRB3FileOptions): Promise<void> => {
  const { creatorName, useBuzyLoad, overwritePackageFolderName } = useDefaultOptions({ creatorName: '', useBuzyLoad: true, overwritePackageFolderName: '' }, options)
  const packagePath = pathLikeToDirPath(packageDirPath)

  if (useBuzyLoad) sendBuzyLoad(win, { code: 'init', title: 'exportingPackage', steps: ['validatingPackageData', 'writingSongFilesIntoPackageFile'], onCompleted: ['resetExportPackageModalState'] })

  const { manifest, packageSize } = await rpcs3GenSongPackageManifest(packagePath)
  const contentsHash = Buffer.from(createHashFromBuffer(Buffer.from(manifest)), 'hex')

  const dtaPath = packagePath.gotoFile('songs/songs.dta')
  if (!dtaPath.exists) {
    if (useBuzyLoad)
      sendBuzyLoad(win, {
        code: 'throwError',
        key: `errorExportPackageDTAFileNotFound`,
      })
    return
  }

  const thumbnailPath = packagePath.gotoFile('folder.jpg')
  if (!thumbnailPath.exists) {
    if (useBuzyLoad)
      sendBuzyLoad(win, {
        code: 'throwError',
        key: `errorExportPackagePackageThumbnailNotFound`,
      })
    return
  }
  const isValid = await isJPEGRockshelfPackImage(thumbnailPath)
  if (!isValid) {
    if (useBuzyLoad)
      sendBuzyLoad(win, {
        code: 'throwError',
        key: `errorExportPackageInvalidRockshelfImageFile`,
      })
    return
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
  const packageFolderName = Buffer.from(overwritePackageFolderName || packagePath.name)
  const dtaContent = Buffer.from(parser.stringify())
  const packageCreatorName = creatorName.length > 0 ? Buffer.from(creatorName) : Buffer.alloc(0)

  const io = await StreamWriter.toFile(destPath, true)
  try {
    const header = new BinaryWriter()

    header.writeASCII('RB3') // Magic
    header.writeUInt8(1) // File Version
    header.writeUInt16LE(parser.songs.length) // Songs Count
    header.writeUInt24LE(dtaContent.length) // DTA File Length
    header.writeUInt24LE(descFileLength) // Description Length
    header.writeUInt24LE(thumbnailStats.size - isValid.footerSizeLength) // Thumbnail Length
    header.writeUInt8(1) // Package Files Format, always 0x01 (PS3).

    // TO-DO: Implement package creator thumbnail embedding.
    header.writeUInt16LE(0)

    header.writeUInt8(packageName.length) // Package Name Length
    header.writeUInt8(packageFolderName.length) // Package Folder Name Length
    header.writeUInt8(packageCreatorName.length) // Package Creator Name Length
    header.writeUInt8(getKeyFromMapValue(rsPackImage.type, parsedThumbnail.type) ?? 0) // Package Installation Type
    header.writeUInt8(getKeyFromMapValue(rsPackImage.source, parsedThumbnail.source) ?? 0) // Package Source Type
    header.writeUInt8(getKeyFromMapValue(rsPackImage.encryptionStatus, parsedThumbnail.encryptionStatus) ?? 0) // Package Encryption Status
    header.writeUInt8(getKeyFromMapValue(rsPackImage.packageCategory, parsedThumbnail.category) ?? 0) // Package Category
    header.writeUInt8(date.hour) // Creation Hour
    header.writeUInt8(date.min) // Creation Minute
    header.writeUInt8(date.sec) // Creation Second
    header.writeUInt16LE(date.year) // Creation Year
    header.writeUInt8(date.month) // Creation Month
    header.writeUInt8(date.day) // Creation Day

    const songsIO: BinaryWriter[] = []
    let songOffsetCounter = 0
    const songsObj: SongFilesSizeObject[] = []

    for (const song of parser.songs) {
      const sizeObj = await calculateSongFilesSizeFromSongname(packagePath, song.songname)
      songsObj.push(sizeObj)

      const songIO = new BinaryWriter()
      songIO.writeASCII(song.songname, RB3_SONGNAME_MAX_LENGTH)
      songIO.writeUInt64LE(BigInt(songOffsetCounter))
      songIO.writeUInt32LE(sizeObj.mogg)
      songIO.writeUInt32LE(sizeObj.midi)
      songIO.writeUInt32LE(sizeObj.artwork)
      songIO.writeUInt32LE(sizeObj.milo)
      songIO.writeUInt24LE(sizeObj.pan)
      songIO.writeUInt24LE(sizeObj.usr)
      songIO.writeUInt24LE(sizeObj.vnn)
      songIO.writeUInt24LE(sizeObj.voc)
      songIO.writeUInt24LE(sizeObj.xvocab)
      songIO.writeUInt24LE(sizeObj.weights)
      songIO.writePadding(RB3_SONG_ENTRY_PADDING) // Song entry padding
      songOffsetCounter += sizeObj.totalSize
      songsIO.push(songIO)
    }

    let descFileBuffer: Buffer = Buffer.alloc(0)
    if (descFilePath.exists) descFileBuffer = await descFilePath.read()
    const thumbnailFileBuffer = await thumbnailPath.readOffset(0, thumbnailStats.size - isValid.footerSizeLength)

    const songDataOffset = RB3_HEADER_SIZE + RB3_SONG_ENTRY_SIZE * parser.songs.length + packageName.length + packageFolderName.length + packageCreatorName.length + dtaContent.length + descFileBuffer.length + thumbnailFileBuffer.length

    header.writeUInt32LE(songDataOffset) // Song Data Offset
    header.writeUInt48LE(packageSize) // Package Size
    header.writePadding(RB3_HEADER_PADDING)
    header.write(contentsHash)
    io.write(header.toBuffer())

    for (const sio of songsIO) {
      io.write(sio.toBuffer())
      sio.clearContents()
    }

    io.write(packageName)
    io.write(packageFolderName)
    if (packageCreatorName.length > 0) io.write(packageCreatorName)
    io.write(dtaContent)
    if (descFilePath.exists) io.write(descFileBuffer)
    io.write(thumbnailFileBuffer)

    if (io.length !== songDataOffset) {
      await io.close()
      if (io.filePath.exists) await io.filePath.delete()
      if (useBuzyLoad)
        sendBuzyLoad(win, {
          code: 'throwError',
          key: `errorExportPackageSongDataOffsetError`,
        })
      return
    }

    await io.close()

    if (useBuzyLoad) sendBuzyLoad(win, { code: 'incrementStep' })
    let fileProcessedCount = 0
    const allFilesToBeProcessed = songsObj.reduce((prev, curr) => prev + curr.totalFiles, 0)

    const stream = createWriteStream(io.filePath.path, { flags: 'a' })

    for (const song of songsObj) {
      const mogg = new MOGGFile(song.moggFilePath)
      if (mogg.path.exists) {
        if (await mogg.isEncrypted()) {
          if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'decryptingMOGGTextWithCount', messageValues: { name: mogg.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
          const tempMOGG = await mogg.decrypt(temporaryFile({ extension: 'midi' }))

          if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingMOGGTextWithCount', messageValues: { name: mogg.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
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
          if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingMOGGTextWithCount', messageValues: { name: mogg.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
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
      }

      const midi = new EDATFile(song.midiFilePath)
      if (midi.path.exists) {
        if (await midi.isEncrypted()) {
          if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'decryptingMIDITextWithCount', messageValues: { name: midi.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
          const tempMidi = await midi.decrypt({ devKLicHash: EDATFile.genDevKLicHash(packagePath.name), destPath: temporaryFile({ extension: 'midi' }) })

          if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingMIDITextWithCount', messageValues: { name: midi.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
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
          if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingMIDITextWithCount', messageValues: { name: midi.path.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
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
      }

      const artwork = pathLikeToFilePath(song.artworkFilePath)
      if (artwork.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingArtworkTextWithCount', messageValues: { name: artwork.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
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
      }

      const milo = pathLikeToFilePath(song.miloFilePath)
      if (milo.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingMILOTextWithCount', messageValues: { name: milo.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
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

      const pan = pathLikeToFilePath(song.panFilePath)
      if (pan.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingPANTextWithCount', messageValues: { name: pan.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
        await new Promise<boolean>((res, rej) => {
          const readStream = createReadStream(pan.path)

          readStream.on('data', (chunk: Buffer) => stream.write(chunk))
          readStream.on('end', () => {
            readStream.close()
            res(true)
          })
          readStream.on('error', rej)
        })
        fileProcessedCount++
      }

      const usr = pathLikeToFilePath(song.usrFilePath)
      if (usr.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingUSRTextWithCount', messageValues: { name: usr.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
        await new Promise<boolean>((res, rej) => {
          const readStream = createReadStream(usr.path)

          readStream.on('data', (chunk: Buffer) => stream.write(chunk))
          readStream.on('end', () => {
            readStream.close()
            res(true)
          })
          readStream.on('error', rej)
        })
        fileProcessedCount++
      }

      const vnn = pathLikeToFilePath(song.vnnFilePath)
      if (vnn.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingVNNTextWithCount', messageValues: { name: vnn.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
        await new Promise<boolean>((res, rej) => {
          const readStream = createReadStream(vnn.path)

          readStream.on('data', (chunk: Buffer) => stream.write(chunk))
          readStream.on('end', () => {
            readStream.close()
            res(true)
          })
          readStream.on('error', rej)
        })
        fileProcessedCount++
      }

      const voc = pathLikeToFilePath(song.vocFilePath)
      if (voc.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingVOCTextWithCount', messageValues: { name: voc.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
        await new Promise<boolean>((res, rej) => {
          const readStream = createReadStream(voc.path)

          readStream.on('data', (chunk: Buffer) => stream.write(chunk))
          readStream.on('end', () => {
            readStream.close()
            res(true)
          })
          readStream.on('error', rej)
        })
        fileProcessedCount++
      }

      const xvocab = pathLikeToFilePath(song.xvocabFilePath)
      if (xvocab.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingXVOCABTextWithCount', messageValues: { name: xvocab.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
        await new Promise<boolean>((res, rej) => {
          const readStream = createReadStream(xvocab.path)

          readStream.on('data', (chunk: Buffer) => stream.write(chunk))
          readStream.on('end', () => {
            readStream.close()
            res(true)
          })
          readStream.on('error', rej)
        })
        fileProcessedCount++
      }

      const weights = pathLikeToFilePath(song.weightsFilePath)
      if (weights.exists) {
        if (useBuzyLoad) sendBuzyLoad(win, { code: 'subtext', key: 'writingWEIGHTSTextWithCount', messageValues: { name: weights.fullname, count: fileProcessedCount.toString(), total: allFilesToBeProcessed.toString() } })
        await new Promise<boolean>((res, rej) => {
          const readStream = createReadStream(weights.path)

          readStream.on('data', (chunk: Buffer) => stream.write(chunk))
          readStream.on('end', () => {
            readStream.close()
            res(true)
          })
          readStream.on('error', rej)
        })
        fileProcessedCount++
      }
    }

    stream.end()

    if (useBuzyLoad) sendBuzyLoad(win, { code: 'callSuccess' })
  } catch (err) {
    await io.close()
    await io.filePath.delete()
    throw err
  }
}
