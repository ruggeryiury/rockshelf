import { type DirPathLikeTypes, type DirPath, pathLikeToDirPath, pathLikeToFilePath, randomByteFromRanges } from 'node-lib'
import { temporaryDirectory, temporaryFile } from 'tempy'
import { useDefaultOptions } from 'use-default-options'
import { sendBuzyLoad } from '../senders/buzyLoad'
import type { BrowserWindow } from 'electron'
import { type SelectedSongForExtractionObject, type STFSExtractionTempFolderObject, type PKGExtractionTempFolderObject, type RB3PackageLikeType, DTAParser, type SupportedRB3PackageFileType, STFSFile, PKGFile, type STFSFileJSONRepresentation, type PKGFileJSONRepresentation, TextureFile, MOGGFile, PythonAPI, BinaryAPI, EDATFile } from '../rbtools'
import { type DTAFileUpdateObject, type DTAFileBatchUpdateObject, type RB3CompatibleDTAFile, isRPCS3Devhdd0PathValid, getUnpackedFilesPathFromRootExtraction } from '../rbtools/lib.exports'
import { sendRendererConsole } from '../senders/rendererConsole'

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
  const { forceEncryption, songs, updates, updateAllSongs } = useDefaultOptions<RPCS3ExtractionOptionsExtra>(
    {
      forceEncryption: 'disabled',
      overwritePackFolder: true,
      songs: [],
      updates: [],
      updateAllSongs: null,
    },
    options
  )

  sendRendererConsole(win, { packages, destFolderPath, packageFolderName, options })

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
    const stat = await pack.stat()

    if (type === 'stfs' && stat.dta.songs.length === 0 && stat.dta.updates.length > 0) {
      await stat.dta.applyDXUpdatesOnSongs(true)
    }

    if (!hasSongSelection) {
      sendBuzyLoad(win, { code: 'subtext', key: 'extractingText', messageValues: { name: pack.path.fullname } })
      await pack.extract(tempFolderPath, true)

      parser.addSongs(stat.dta.songs)

      if (type === 'stfs') {
        tempFolders.push({
          path: tempFolderPath,
          type: 'stfs',
          songs: stat.dta.songs.map((song) => {
            let newSongname = ''
            const hasUpdates = updates.find((val) => val.id.toString() === song.id.toString())
            if (updates.length > 0 && hasUpdates) {
              newSongname = hasUpdates.songname
            }
            return { songname: song.songname, newSongname, files: getUnpackedFilesPathFromRootExtraction('stfs', tempFolderPath, song.songname) }
          }),
          stat: {
            path: pack.path.toJSON(),
            ...stat,
            dta: stat.dta.songs,
            upgrades: stat.upgrades?.updates ?? undefined,
          } as STFSFileJSONRepresentation,
        })
      } else {
        tempFolders.push({
          path: tempFolderPath,
          type: 'pkg',
          songs: stat.dta.songs.map((song) => {
            let newSongname = ''
            const hasUpdates = updates.find((val) => val.id.toString() === song.id.toString())
            if (updates.length > 0 && hasUpdates) {
              newSongname = hasUpdates.songname
            }
            return { songname: song.songname, newSongname, files: getUnpackedFilesPathFromRootExtraction('pkg', tempFolderPath, song.songname) }
          }),
          stat: {
            path: pack.path.toJSON(),
            ...stat,
            dta: stat.dta.songs,
            upgrades: stat.upgrades ? stat.upgrades.updates : undefined,
          } as PKGFileJSONRepresentation,
        })
      }
    } else {
      const allSelectedSongnames: string[] = []

      for (const song of stat.dta.songs) {
        for (const selSongOption of allSelectedSongs) {
          if ((selSongOption.type === 'songname' && selSongOption.value.toString() === song.songname.toString()) || (selSongOption.type === 'id' && selSongOption.value.toString() === song.id.toString()) || (selSongOption.type === 'songID' && selSongOption.value.toString() === song.song_id.toString())) allSelectedSongnames.push(song.songname)
        }
      }

      const filterdSelectedSongnames = stat.dta.songs.filter((song) => allSelectedSongnames.includes(song.songname))

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
          stat: {
            path: pack.path.toJSON(),
            ...stat,
            dta: stat.dta.songs,
            upgrades: stat.upgrades?.updates ?? undefined,
          } as STFSFileJSONRepresentation,
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
          stat: {
            path: pack.path.toJSON(),
            ...stat,
            dta: stat.dta.songs,
            upgrades: stat.upgrades ? stat.upgrades.updates : undefined,
          } as PKGFileJSONRepresentation,
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
        // RB2-specific files
        const oldPANPath = song.files.pan
        if (oldPANPath.exists) {
          const newPANPath = mainTempFolder.gotoFile(`${song.files.pan.name}.pan`)
          await oldPANPath.copy(newPANPath, true)
          await oldPANPath.delete()
        }

        const oldUSRPath = song.files.usr
        if (oldUSRPath.exists) {
          const newUSRPath = mainTempFolder.gotoFile(`${song.files.usr.name}.usr`)
          await oldUSRPath.copy(newUSRPath, true)
          await oldUSRPath.delete()
        }

        const oldVNNPath = song.files.vnn
        if (oldVNNPath.exists) {
          const newVNNPath = mainTempFolder.gotoFile(`${song.files.vnn.name}.vnn`)
          await oldVNNPath.copy(newVNNPath, true)
          await oldVNNPath.delete()
        }

        const oldVOCPath = song.files.voc
        if (oldVOCPath.exists) {
          const newVOCPath = mainTempFolder.gotoFile(`${song.files.voc.name}.voc`)
          await oldVOCPath.copy(newVOCPath, true)
          await oldVOCPath.delete()
        }

        const oldXVOCABPath = song.files.xvocab
        if (oldXVOCABPath.exists) {
          const newXVOCABPath = mainTempFolder.gotoFile(`${song.files.xvocab.name}.xvocab`)
          await oldXVOCABPath.copy(newXVOCABPath, true)
          await oldXVOCABPath.delete()
        }

        const oldWeightsPath = song.files.weights
        if (oldWeightsPath.exists) {
          const newWeightsPath = mainTempFolder.gotoFile(`${song.files.weights.name}.bin`)
          await oldWeightsPath.copy(newWeightsPath, true)
          await oldWeightsPath.delete()
        }

        // MILO
        const oldMiloPath = song.files.milo
        if (oldMiloPath.exists) {
          const newMiloPath = mainTempFolder.gotoFile(`${song.files.milo.name}.milo_ps3`)
          await oldMiloPath.copy(newMiloPath, true)
          await oldMiloPath.delete()
        }

        // PNG
        const oldPNGPath = song.files.png
        if (oldPNGPath.exists) {
          const newPNGPath = mainTempFolder.gotoFile(`${song.files.png.name}.png_ps3`)
          if (temp.type === 'pkg') {
            await oldPNGPath.copy(newPNGPath, true)
            await oldPNGPath.delete()
          } else {
            // Xbox PNGs must be converted to PS3
            sendBuzyLoad(win, { code: 'subtext', key: 'convertingXboxPNGText', messageValues: { name: oldPNGPath.fullname } })
            const tex = new TextureFile(oldPNGPath)
            await tex.convertToTexture(newPNGPath, 'png_ps3')
          }
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
          await decMOGGPath.copy(oldMOGGPath.path, true)
          await decMOGGPath.delete()
        } else if (forceEncryption === 'enabled' && moggEncVersion === 11) {
          // Do nothing, the MOGG file is encrypted
        } else if (forceEncryption === 'enabled' && moggEncVersion === 10) {
          // MOGG is decypted, but it must not
          const encMOGGPath = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

          sendBuzyLoad(win, { code: 'subtext', key: 'encryptingMOGGText', messageValues: { name: oldMOGGPath.path.fullname } })
          await BinaryAPI.makeMoggEncrypt(oldMOGGPath.path, encMOGGPath)
          await encMOGGPath.copy(oldMOGGPath.path, true)
          await encMOGGPath.delete()
        } else if (forceEncryption === 'enabled' && moggEncVersion > 11) {
          // MOGG is encrypted, but not for PS3 use
          const decMOGGPath = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

          sendBuzyLoad(win, { code: 'subtext', key: 'changingMOGGEncText', messageValues: { name: oldMOGGPath.path.fullname } })
          await PythonAPI.decryptMOGG(oldMOGGPath.path, decMOGGPath)
          await BinaryAPI.makeMoggEncrypt(decMOGGPath, oldMOGGPath.path)

          await decMOGGPath.delete()
        }
        const newMOGGPath = mainTempFolder.gotoFile(song.files.mogg.fullname)

        await oldMOGGPath.path.copy(newMOGGPath, true)
        await oldMOGGPath.path.delete()

        // MIDI
        const oldMIDIPath = song.files.mid
        const newMIDIPath = mainTempFolder.gotoFile(`${song.songname}.mid.edat`)

        // MIDI is decrypted, just move changing the extension to EDAT
        if (temp.type === 'stfs' && forceEncryption === 'disabled') {
          await oldMIDIPath.copy(newMIDIPath, true)
          await oldMIDIPath.delete()
        } else if (temp.type === 'stfs' && forceEncryption === 'enabled') {
          const newDevkLic = EDATFile.genDevKLicHash(packageFolderName)
          const newContentID = EDATFile.genContentID(`RBTOOLSEDAT${randomByteFromRanges(6, ['numbers']).toString()}`)
          sendBuzyLoad(win, { code: 'subtext', key: 'encryptingMIDIFileText', messageValues: { name: oldMIDIPath.fullname } })
          await BinaryAPI.makeNPDataEncrypt(oldMIDIPath, newContentID, newDevkLic, newMIDIPath)
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
            await BinaryAPI.makeNPDataDecrypt(oldMIDIPath, oldDevklic, tempDecEDAT)
            await tempDecEDAT.copy(oldMIDIPath, true)
            await tempDecEDAT.delete()
          }

          if (forceEncryption === 'enabled') {
            const newDevkLic = EDATFile.genDevKLicHash(packageFolderName)
            const newContentID = EDATFile.genContentID(`RBTOOLSEDAT${randomByteFromRanges(6, ['numbers']).toString()}`)
            sendBuzyLoad(win, { code: 'subtext', key: 'encryptingMIDIFileText', messageValues: { name: oldMIDIPath.fullname } })
            await BinaryAPI.makeNPDataEncrypt(oldMIDIPath, newContentID, newDevkLic, newMIDIPath)
          } else {
            await oldMIDIPath.copy(newMIDIPath)
            await oldMIDIPath.delete()
          }
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
  parser.patchInvalidValues()
  parser.patchCores()
  parser.patchSongsEncodings()
  parser.patchIDs()

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
      temp.songs
      if (temp.songs.length === 0) {
        continue
      }
      for (const { songname, newSongname } of temp.songs) {
        const newUsedSongname = newSongname.length > 0 ? newSongname : songname
        const mainTempMOGG = mainTempFolder.gotoFile(`${songname}.mogg`)
        const mainTempMIDI = mainTempFolder.gotoFile(`${songname}.mid.edat`)
        const mainTempPNG = mainTempFolder.gotoFile(`${songname}_keep.png_ps3`)
        const mainTempMILO = mainTempFolder.gotoFile(`${songname}.milo_ps3`)

        const mainTempPAN = mainTempFolder.gotoFile(`${songname}.pan`)
        const mainTempUSR = mainTempFolder.gotoFile(`${songname}.usr`)
        const mainTempVNN = mainTempFolder.gotoFile(`${songname}.vnn`)
        const mainTempVOC = mainTempFolder.gotoFile(`${songname}.voc`)
        const mainTempXVOCAB = mainTempFolder.gotoFile(`${songname}.xvocab`)
        const mainTempWeights = mainTempFolder.gotoFile(`${songname}_weights.bin`)

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
        if (!mainTempMIDI.exists) {
          await mainTempFolder.deleteDir()
          sendBuzyLoad(win, {
            code: 'throwError',
            key: 'errorCreateNewPackageSongDataWithNoChart',
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

        const newPAN = songGenFolder.gotoFile(`../${newUsedSongname}.pan`)
        const newUSR = songGenFolder.gotoFile(`../${newUsedSongname}.usr`)
        const newVNN = songGenFolder.gotoFile(`../${newUsedSongname}.vnn`)
        const newVOC = songGenFolder.gotoFile(`../${newUsedSongname}.voc`)
        const newXVOCAB = songGenFolder.gotoFile(`../${newUsedSongname}.xvocab`)
        const newWeights = songGenFolder.gotoFile(`${newUsedSongname}_weights.bin`)

        if (mainTempMOGG.exists) {
          await mainTempMOGG.copy(newMOGG, true)
          await mainTempMOGG.delete()

          const moggStat = await newMOGG.stat()
          packSize += moggStat.size
        }

        if (mainTempMIDI.exists) {
          await mainTempMIDI.copy(newMIDI, true)
          await mainTempMIDI.delete()

          const midiStat = await newMIDI.stat()
          packSize += midiStat.size
        }

        if (mainTempPNG.exists) {
          await mainTempPNG.copy(newPNG, true)
          await mainTempPNG.delete()

          const pngStat = await newPNG.stat()
          packSize += pngStat.size
        }

        if (mainTempMILO.exists) {
          await mainTempMILO.copy(newMILO, true)
          await mainTempMILO.delete()

          const miloStat = await newMILO.stat()
          packSize += miloStat.size
        }

        if (mainTempPAN.exists) {
          await mainTempPAN.copy(newPAN, true)
          await mainTempPAN.delete()

          const panStat = await newPAN.stat()
          packSize += panStat.size
        }

        if (mainTempUSR.exists) {
          await mainTempUSR.copy(newUSR, true)
          await mainTempUSR.delete()

          const usrStat = await newUSR.stat()
          packSize += usrStat.size
        }

        if (mainTempVNN.exists) {
          await mainTempVNN.copy(newVNN, true)
          await mainTempVNN.delete()

          const vnnStat = await newVNN.stat()
          packSize += vnnStat.size
        }

        if (mainTempVOC.exists) {
          await mainTempVOC.copy(newVOC, true)
          await mainTempVOC.delete()

          const vocStat = await newVOC.stat()
          packSize += vocStat.size
        }

        if (mainTempXVOCAB.exists) {
          await mainTempXVOCAB.copy(newXVOCAB, true)
          await mainTempXVOCAB.delete()

          const xvocabStat = await newXVOCAB.stat()
          packSize += xvocabStat.size
        }

        if (mainTempWeights.exists) {
          await mainTempWeights.copy(newWeights, true)
          await mainTempWeights.delete()

          const weightsStat = await newWeights.stat()
          packSize += weightsStat.size
        }
      }
    }
  } catch (err) {
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
  }
}
