import { type DirPathLikeTypes, type DirPath, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { temporaryDirectory, temporaryFile } from 'tempy'
import { useDefaultOptions } from 'use-default-options'
import { sendBuzyLoad } from '../senders/buzyLoad'
import type { BrowserWindow } from 'electron'
import { type SelectedSongForExtractionObject, type STFSExtractionTempFolderObject, type PKGExtractionTempFolderObject, type RB3PackageLikeType, DTAParser, type SupportedRB3PackageFileType, STFSFile, PKGFile, type STFSFileJSONRepresentation, type PKGFileJSONRepresentation, TextureFile, MOGGFile, PythonAPI, BinaryAPI, EDATFile } from '../rbtools'
import { type DTAFileUpdateObject, type DTAFileBatchUpdateObject, type RB3CompatibleDTAFile, isRPCS3Devhdd0PathValid, getUnpackedFilesPathFromRootExtraction } from '../rbtools/lib.exports'

// #region Types

export interface RPCS3ExtractionOptionsExtra {
  /**
   * Whether you want to overwrite the package found with the same folder name. Default is `true`.
   */
  overwritePackFolder?: boolean
  /**
   * Force encryption/decryption of all possible encrypted files. Default is `"disabled"`.
   */
  forceEncryption?: 'enabled' | 'disabled'
  /**
   * An array with the internal songnames of the songs you want to extract from the packages. If left empty, all songs from the packages will be extracted and installed.
   *
   * If the value is a string, it will be considered as the internal songname of the song. If the value is an object, you can select the song by its internal songname, its entry ID, or its song ID. Example: `{ type: 'id', value: 'songentryid' }` or `{ type: 'songID', value: 5678 }`
   */
  songs?: (string | SelectedSongForExtractionObject)[]
  /**
   * An array with objects which will updates a specific parsed song object based on its provided entry ID.
   */
  updates?: DTAFileUpdateObject[]
  /**
   * An object which will update all parsed song objects.
   */
  updateAllSongs?: DTAFileBatchUpdateObject | null
}

export interface RPCS3PackageExtractionObjectExtra {
  /**
   * The path where the pack was installed.
   */
  path: DirPath
  /**
   * The path to temporary folder created to ultimately gather all package files to move to the actual package folder inside the `dev_hdd0` folder.
   */
  mainTempFolder: DirPath
  /**
   * An array with all temporary folder created when each package were extracted.
   */
  tempFolders: (STFSExtractionTempFolderObject | PKGExtractionTempFolderObject)[]
  /**
   * The size of the created package.
   */
  packSize: number
  /**
   * The amount of songs installed.
   */
  songsInstalled: number
  /**
   * The installed song parsed objects that was installed.
   */
  songs: RB3CompatibleDTAFile[]
  /**
   * An array with all song entry ID installed.
   */
  installedSongIDs: string[]
  /**
   * An array with all internal songnames installed.
   */
  installedSongSongnames: string[]
}

// #region Function

/**
 * Extracts all provided song packages and merged them to create a new package compatible with RPCS3.
 *
 * The `options` parameter is an object where you can tweak the extraction and package creation process, selecting the package folder name, and forcing encryption/decryption of all files for vanilla Rock Band 3 support.
 * - - - -
 * @param {RB3PackageLikeType[]} packages An array with paths to STFS or PKG files to be installed. You can select individual song or multiple songs package.
 * @param {DirPathLikeTypes} destFolderPath The destination folder you want to place the extracted package. You can use any folder, but placing a valid `dev_hdd0` folder, this function will install the new package on Rock Band 3's USRDIR folder on RPCS3.
 * @param {string} packageFolderName The name of the new package folder.
 * @param {RPCS3ExtractionOptionsExtra} [options] `OPTIONAL` An object with properties that modifies the default behavior of the extraction and package creation process.
 * @returns {Promise<RPCS3PackageExtractionObjectExtra | false>}
 */
export const extractPackagesForRPCS3Extra = async (win: BrowserWindow, packages: RB3PackageLikeType[], destFolderPath: DirPathLikeTypes, packageFolderName: string, options?: RPCS3ExtractionOptionsExtra): Promise<RPCS3PackageExtractionObjectExtra | false> => {
  const { forceEncryption, overwritePackFolder, songs, updates, updateAllSongs } = useDefaultOptions<RPCS3ExtractionOptionsExtra>(
    {
      forceEncryption: 'disabled',
      overwritePackFolder: true,
      songs: [],
      updates: [],
      updateAllSongs: null,
    },
    options
  )

  const hasSongSelection = songs.length > 0
  let allSelectedSongs: SelectedSongForExtractionObject[] = []

  if (hasSongSelection) allSelectedSongs = songs.map((song) => (typeof song === 'string' ? { type: 'songname', value: song } : song)) as SelectedSongForExtractionObject[]

  const dest = pathLikeToDirPath(destFolderPath)
  let isDevhdd0 = false
  try {
    isRPCS3Devhdd0PathValid(dest)
    isDevhdd0 = true
  } catch (err) {
    if (!dest.exists) await dest.mkDir(true)
  }

  const usrdir = isDevhdd0 ? dest.gotoDir('game/BLUS30463/USRDIR') : dest
  const newFolder = usrdir.gotoDir(packageFolderName)

  // if (newFolder.exists && !overwritePackFolder) {
  //   if (!isDevhdd0 && dest.exists) await dest.deleteDir(true)
  //   throw new Error(`Provided package folder name "${packageFolderName}" already exists.`)
  // }

  const parser = new DTAParser()

  const allPackages: SupportedRB3PackageFileType[] = packages.map((pack) => {
    if (pack instanceof STFSFile || pack instanceof PKGFile) return pack
    else {
      const filePath = pathLikeToFilePath(pack)
      if (filePath.ext === '.pkg') return new PKGFile(filePath)
      else return new STFSFile(filePath)
    }
  })

  const tempFolders: (STFSExtractionTempFolderObject | PKGExtractionTempFolderObject)[] = []
  for (const pack of allPackages) {
    const tempFolderPath = pathLikeToDirPath(temporaryDirectory())
    const type = pack instanceof STFSFile ? 'stfs' : 'pkg'
    const stat = await pack.toJSON()

    if (!hasSongSelection) {
      sendBuzyLoad(win, { code: 'subtext', key: 'extractingText', messageValues: { name: pack.path.fullname } })
      await pack.extract(tempFolderPath, true)
      parser.addSongs(stat.dta)

      if (type === 'stfs') {
        tempFolders.push({
          path: tempFolderPath,
          type: 'stfs',
          songs: stat.dta.map((song) => {
            let newSongname = ''
            const hasUpdates = updates.find((val) => val.id.toString() === song.id.toString())
            if (updates.length > 0 && hasUpdates) {
              newSongname = hasUpdates.songname
            }
            return { songname: song.songname, newSongname, files: getUnpackedFilesPathFromRootExtraction('stfs', tempFolderPath, song.songname) }
          }),
          stat: stat as STFSFileJSONRepresentation,
        })
      } else {
        tempFolders.push({
          path: tempFolderPath,
          type: 'pkg',
          songs: stat.dta.map((song) => {
            let newSongname = ''
            const hasUpdates = updates.find((val) => val.id.toString() === song.id.toString())
            if (updates.length > 0 && hasUpdates) {
              newSongname = hasUpdates.songname
            }
            return { songname: song.songname, newSongname, files: getUnpackedFilesPathFromRootExtraction('pkg', tempFolderPath, song.songname) }
          }),
          stat: stat as PKGFileJSONRepresentation,
        })
      }
    } else {
      const allSelectedSongnames: string[] = []

      for (const song of stat.dta) {
        for (const selSongOption of allSelectedSongs) {
          if ((selSongOption.type === 'songname' && selSongOption.value.toString() === song.songname.toString()) || (selSongOption.type === 'id' && selSongOption.value.toString() === song.id.toString()) || (selSongOption.type === 'songID' && selSongOption.value.toString() === song.song_id.toString())) allSelectedSongnames.push(song.songname)
        }
      }

      const filterdSelectedSongnames = stat.dta.filter((song) => allSelectedSongnames.includes(song.songname))

      if (filterdSelectedSongnames.length === 0) {
        await tempFolderPath.deleteDir(true)
        continue
      }

      sendBuzyLoad(win, { code: 'subtext', key: 'extractingText', messageValues: { name: pack.path.fullname } })
      await pack.extract(tempFolderPath, true, allSelectedSongnames)
      parser.addSongs(filterdSelectedSongnames)

      if (type === 'stfs') {
        tempFolders.push({
          path: tempFolderPath,
          type: 'stfs',
          songs: filterdSelectedSongnames.map((song) => {
            let newSongname = ''
            const hasUpdates = updates.find((val) => val.id.toString() === song.id.toString())
            if (updates.length > 0 && hasUpdates) {
              newSongname = hasUpdates.songname
            }
            return { songname: song.songname, newSongname, files: getUnpackedFilesPathFromRootExtraction('stfs', tempFolderPath, song.songname) }
          }),
          stat: stat as STFSFileJSONRepresentation,
        })
      } else {
        tempFolders.push({
          path: tempFolderPath,
          type: 'pkg',
          songs: filterdSelectedSongnames.map((song) => {
            let newSongname = ''
            const hasUpdates = updates.find((val) => val.id.toString() === song.id.toString())
            if (updates.length > 0 && hasUpdates) {
              newSongname = hasUpdates.songname
            }
            return { songname: song.songname, newSongname, files: getUnpackedFilesPathFromRootExtraction('pkg', tempFolderPath, song.songname) }
          }),
          stat: stat as PKGFileJSONRepresentation,
        })
      }
    }
  }
  const mainTempFolder = pathLikeToDirPath(temporaryDirectory())
  sendBuzyLoad(win, { code: 'incrementStep' })

  try {
    // Move to a main temp will all files together and encrypt/decrypt all files
    for (const temp of tempFolders) {
      if (temp.songs.length === 0) {
        await temp.path.deleteDir(true)
        continue
      }
      for (const song of temp.songs) {
        // MILO
        const oldMiloPath = song.files.milo
        const newMiloPath = mainTempFolder.gotoFile(`${song.files.milo.name}.milo_ps3`)
        sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: newMiloPath.fullname } })
        await oldMiloPath.move(newMiloPath, true)

        // PNG
        const oldPNGPath = song.files.png
        const newPNGPath = mainTempFolder.gotoFile(`${song.files.png.name}.png_ps3`)
        if (temp.type === 'pkg') {
          sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: oldPNGPath.fullname } })
          await oldPNGPath.move(newPNGPath, true)
        } else {
          // Xbox PNGs must be converted to PS3
          sendBuzyLoad(win, { code: 'subtext', key: 'convertingXboxPNGText', messageValues: { name: oldPNGPath.fullname } })
          const tempPNG = pathLikeToFilePath(temporaryFile({ extension: 'png' }))
          const tex = new TextureFile(oldPNGPath)
          const newImg = await tex.convertToImage(tempPNG, 'png')

          await newImg.convertToTexture(newPNGPath, 'png_ps3')
          await tempPNG.delete()
        }

        // MOGG
        const oldMOGGPath = new MOGGFile(song.files.mogg)
        const moggEncVersion = await oldMOGGPath.checkFileIntegrity()
        if (forceEncryption === 'disabled' && moggEncVersion === 10) {
          // Do nothing, the MOGG file is decrypted
        } else if (forceEncryption === 'disabled' && moggEncVersion > 10) {
          // MOGG is encrypted, but it must not
          const decMOGGPath = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

          sendBuzyLoad(win, { code: 'subtext', key: 'decryptingMOGGText', messageValues: { name: oldMOGGPath.path.fullname } })
          await PythonAPI.decryptMOGG(oldMOGGPath.path, decMOGGPath)
          await decMOGGPath.move(oldMOGGPath.path, true)
        } else if (forceEncryption === 'enabled' && moggEncVersion === 11) {
          // Do nothing, the MOGG file is encrypted
        } else if (forceEncryption === 'enabled' && moggEncVersion === 10) {
          // MOGG is decypted, but it must not
          const encMOGGPath = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

          sendBuzyLoad(win, { code: 'subtext', key: 'encryptingMOGGText', messageValues: { name: oldMOGGPath.path.fullname } })
          await BinaryAPI.makeMoggEncrypt(oldMOGGPath.path, encMOGGPath)
          await encMOGGPath.move(oldMOGGPath.path, true)
        } else if (forceEncryption === 'enabled' && moggEncVersion > 11) {
          // MOGG is encrypted, but not for PS3 use
          const decMOGGPath = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

          sendBuzyLoad(win, { code: 'subtext', key: 'changingMOGGEncText', messageValues: { name: oldMOGGPath.path.fullname } })
          await PythonAPI.decryptMOGG(oldMOGGPath.path, decMOGGPath)
          await BinaryAPI.makeMoggEncrypt(decMOGGPath, oldMOGGPath.path)

          await decMOGGPath.delete()
        }
        const newMOGGPath = mainTempFolder.gotoFile(song.files.mogg.fullname)

        sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: oldMOGGPath.path.fullname } })
        await oldMOGGPath.path.move(newMOGGPath, true)

        // MIDI
        const oldMIDIPath = song.files.mid
        const newMIDIPath = mainTempFolder.gotoFile(`${song.songname}.mid.edat`)

        // MIDI is decrypted, just move changing the extension to EDAT
        if (temp.type === 'stfs' && forceEncryption === 'disabled') {
          sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: oldMIDIPath.fullname } })
          await oldMIDIPath.move(newMIDIPath, true)
        } else if (temp.type === 'stfs' && forceEncryption === 'enabled') {
          const newDevkLic = EDATFile.genDevKLicHash(packageFolderName)
          const newContentID = EDATFile.genContentID(packageFolderName.toUpperCase())
          sendBuzyLoad(win, { code: 'subtext', key: 'encryptingMIDIFileText', messageValues: { name: oldMIDIPath.fullname } })
          await BinaryAPI.edatToolEncrypt(oldMIDIPath, newContentID, newDevkLic, newMIDIPath)
        }
        // MIDI might be encrypted for PKG files
        else if (temp.type === 'pkg') {
          const oldEDAT = new EDATFile(oldMIDIPath)
          const isEDATEncrypted = await oldEDAT.isEncrypted()

          if (isEDATEncrypted) {
            // Original MIDI must be decrypted anyway
            sendBuzyLoad(win, { code: 'subtext', key: 'decryptingMIDIFileText', messageValues: { name: oldMIDIPath.fullname } })
            const tempDecEDAT = pathLikeToFilePath(temporaryFile({ extension: 'mid' }))
            const oldDevklic = EDATFile.genDevKLicHash(temp.stat.folderName)
            await BinaryAPI.edatToolDecrypt(oldMIDIPath, oldDevklic, tempDecEDAT)
            await tempDecEDAT.move(oldMIDIPath, true)
          }

          if (forceEncryption === 'enabled') {
            const newDevkLic = EDATFile.genDevKLicHash(packageFolderName)
            const newContentID = EDATFile.genContentID(packageFolderName.toUpperCase())
            sendBuzyLoad(win, { code: 'subtext', key: 'encryptingMIDIFileText', messageValues: { name: oldMIDIPath.fullname } })
            await BinaryAPI.edatToolEncrypt(oldMIDIPath, newContentID, newDevkLic, newMIDIPath)
          } else await oldMIDIPath.move(newMIDIPath)
        }
      }

      await temp.path.deleteDir()
    }
  } catch (err) {
    for (const temp of tempFolders) {
      await temp.path.deleteDir(true)
    }
    await mainTempFolder.deleteDir(true)
    throw err
  }

  if (newFolder.exists) await newFolder.deleteDir(true)

  const newDTAPath = newFolder.gotoFile('songs/songs.dta')
  await newFolder.gotoDir('songs').mkDir(true)

  if (updates.length > 0) parser.addUpdates(updates)
  if (updateAllSongs !== null) parser.addUpdatesToAllSongs(updateAllSongs)
  if (updates.length > 0 || updateAllSongs !== null) parser.applyUpdatesToExistingSongs(true)

  parser.sort('ID')
  parser.patchSongsEncodings()
  parser.patchCores()

  sendBuzyLoad(win, { code: 'incrementStep' })

  try {
    await parser.export(newDTAPath)
  } catch (err) {
    for (const temp of tempFolders) {
      await temp.path.deleteDir(true)
    }
    await mainTempFolder.deleteDir(true)
    sendBuzyLoad(win, { code: 'throwError', key: 'errorCreateNewPackageEmptyDTA' })
    return false
  }

  sendBuzyLoad(win, { code: 'incrementStep' })
  const dtaStat = await newDTAPath.stat()

  let packSize: number = dtaStat.size

  try {
    for (const temp of tempFolders) {
      if (temp.songs.length === 0) {
        continue
      }
      for (const { songname, newSongname } of temp.songs) {
        const newUsedSongname = newSongname.length > 0 ? newSongname : songname
        const mainTempMOGG = mainTempFolder.gotoFile(`${songname}.mogg`)
        const mainTempMIDI = mainTempFolder.gotoFile(`${songname}.mid.edat`)
        const mainTempPNG = mainTempFolder.gotoFile(`${songname}_keep.png_ps3`)
        const mainTempMILO = mainTempFolder.gotoFile(`${songname}.milo_ps3`)

        // CHECK: Maybe check all song files?
        if (!mainTempMOGG.exists) {
          await mainTempFolder.deleteDir()
          sendBuzyLoad(win, {
            code: 'throwError',
            key: 'errorCreateNewPackageSongDataWithNoAudio',
            messageValues: {
              songname,
              newSongname,
            },
          })
          return false
        }

        const songGenFolder = newFolder.gotoDir(`songs/${newUsedSongname}/gen`)
        await songGenFolder.mkDir(true)
        const newMOGG = songGenFolder.gotoFile(`../${newUsedSongname}.mogg`)
        const newMIDI = songGenFolder.gotoFile(`../${newUsedSongname}.mid.edat`)
        const newPNG = songGenFolder.gotoFile(`${newUsedSongname}_keep.png_ps3`)
        const newMILO = songGenFolder.gotoFile(`${newUsedSongname}.milo_ps3`)

        sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: mainTempMOGG.fullname } })
        await mainTempMOGG.move(newMOGG)
        sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: mainTempMIDI.fullname } })
        await mainTempMIDI.move(newMIDI)
        sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: mainTempPNG.fullname } })
        await mainTempPNG.move(newPNG)
        sendBuzyLoad(win, { code: 'subtext', key: 'movingFileText', messageValues: { name: mainTempMILO.fullname } })
        await mainTempMILO.move(newMILO)

        const moggStat = await newMOGG.stat()
        packSize += moggStat.size
        const midiStat = await newMIDI.stat()
        packSize += midiStat.size
        const pngStat = await newPNG.stat()
        packSize += pngStat.size
        const miloStat = await newMILO.stat()
        packSize += miloStat.size
      }
    }
  } catch (err) {
    console.log('mainTempFolder', mainTempFolder.path)
    await mainTempFolder.deleteDir(true)
    throw err
  }
  // Delete anything residual from temp folder
  await mainTempFolder.deleteDir()
  return {
    path: newFolder,
    mainTempFolder,
    tempFolders,
    packSize,
    songsInstalled: parser.songs.length,
    songs: parser.songs,
    installedSongIDs: parser.songs.map((song) => song.id),
    installedSongSongnames: parser.songs.map((song) => song.songname),
  }
}
