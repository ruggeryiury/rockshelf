import { type DirPathLikeTypes, type DirPath, pathLikeToDirPath, pathLikeToFilePath } from 'node-lib'
import { temporaryDirectory, temporaryFile } from 'tempy'
import { useDefaultOptions } from 'use-default-options'
import { type STFSFileJSONRepresentation, type PKGFileJSONRepresentation, DTAParser, STFSFile, MOGGFile, PythonAPI, TextureFile, EDATFile, BinaryAPI, type SelectedSongForExtractionObject, type PKGExtractionTempFolderObject, type STFSExtractionTempFolderObject, type RB3PackageLikeType, PKGFile, type SupportedRB3PackageFileType } from '../../core.exports'
import { getUnpackedFilesPathFromRootExtraction, isRPCS3Devhdd0PathValid, type DTAFileBatchUpdateObject, type DTAFileUpdateObject, type RB3CompatibleDTAFile } from '../../lib.exports'

// #region Types

export interface RPCS3ExtractionOptions {
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

export interface RPCS3PackageExtractionObject {
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
 * @param {RPCS3ExtractionOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the extraction and package creation process.
 * @returns {Promise<RPCS3PackageExtractionObject>}
 */
export const extractPackagesForRPCS3 = async (packages: RB3PackageLikeType[], destFolderPath: DirPathLikeTypes, packageFolderName: string, options?: RPCS3ExtractionOptions): Promise<RPCS3PackageExtractionObject> => {
  const { forceEncryption, overwritePackFolder, songs, updates, updateAllSongs } = useDefaultOptions<RPCS3ExtractionOptions>(
    {
      forceEncryption: 'disabled',
      overwritePackFolder: true,
      songs: [],
      updates: [],
      updateAllSongs: null,
    },
    options
  )

  if (typeof packageFolderName !== 'string') throw new Error('Provided package folder name is not a string.')

  if (packageFolderName.length === 0) throw new Error('Provided package folder name is blank.')

  if (packageFolderName.length > 42) throw new Error(`Provided package folder name "${packageFolderName}" is too big for RPCS3 file system.`)

  const hasSongSelection = songs.length > 0
  let allSelectedSongs: SelectedSongForExtractionObject[] = []

  if (hasSongSelection) allSelectedSongs = songs.map((song) => (typeof song === 'string' ? { type: 'songname', value: song } : song)) as SelectedSongForExtractionObject[]

  const dest = pathLikeToDirPath(destFolderPath)
  let isDevhdd0 = false
  try {
    isRPCS3Devhdd0PathValid(dest)
    isDevhdd0 = true
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    if (!dest.exists) await dest.mkDir(true)
  }

  const usrdir = isDevhdd0 ? dest.gotoDir('game/BLUS30463/USRDIR') : dest
  const newFolder = usrdir.gotoDir(packageFolderName)

  if (newFolder.exists && !overwritePackFolder) {
    if (!isDevhdd0 && dest.exists) await dest.deleteDir(true)
    throw new Error(`Provided package folder name "${packageFolderName}" already exists.`)
  }

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
        await oldMiloPath.move(newMiloPath, true)

        // PNG
        const oldPNGPath = song.files.png
        const newPNGPath = mainTempFolder.gotoFile(`${song.files.png.name}.png_ps3`)
        if (temp.type === 'pkg') await oldPNGPath.move(newPNGPath, true)
        else {
          // Xbox PNGs must be converted to PS3
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

          await PythonAPI.decryptMOGG(oldMOGGPath.path, decMOGGPath)
          await decMOGGPath.move(oldMOGGPath.path, true)
        } else if (forceEncryption === 'enabled' && moggEncVersion === 11) {
          // Do nothing, the MOGG file is encrypted
        } else if (forceEncryption === 'enabled' && moggEncVersion === 10) {
          // MOGG is decypted, but it must not
          const encMOGGPath = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

          await BinaryAPI.makeMoggEncrypt(oldMOGGPath.path, encMOGGPath)
          await encMOGGPath.move(oldMOGGPath.path, true)
        } else if (forceEncryption === 'enabled' && moggEncVersion > 11) {
          // MOGG is encrypted, but not for PS3 use
          const decMOGGPath = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))

          await PythonAPI.decryptMOGG(oldMOGGPath.path, decMOGGPath)
          await BinaryAPI.makeMoggEncrypt(decMOGGPath, oldMOGGPath.path)

          await decMOGGPath.delete()
        }
        const newMOGGPath = mainTempFolder.gotoFile(song.files.mogg.fullname)
        await oldMOGGPath.path.move(newMOGGPath, true)

        // MIDI
        const oldMIDIPath = song.files.mid
        const newMIDIPath = mainTempFolder.gotoFile(`${song.songname}.mid.edat`)

        // MIDI is decrypted, just move changing the extension to EDAT
        if (temp.type === 'stfs' && forceEncryption === 'disabled') await oldMIDIPath.move(newMIDIPath, true)
        else if (temp.type === 'stfs' && forceEncryption === 'enabled') {
          const newDevkLic = EDATFile.genDevKLicHash(packageFolderName)
          const newContentID = EDATFile.genContentID(packageFolderName.toUpperCase())
          await BinaryAPI.edatToolEncrypt(oldMIDIPath, newContentID, newDevkLic, newMIDIPath)
        }
        // MIDI might be encrypted for PKG files
        else if (temp.type === 'pkg') {
          const oldEDAT = new EDATFile(oldMIDIPath)
          const isEDATEncrypted = await oldEDAT.isEncrypted()

          if (isEDATEncrypted) {
            // Original MIDI must be decrypted anyway
            const tempDecEDAT = pathLikeToFilePath(temporaryFile({ extension: 'mid' }))
            const oldDevklic = EDATFile.genDevKLicHash(temp.stat.folderName)
            await BinaryAPI.edatToolDecrypt(oldMIDIPath, oldDevklic, tempDecEDAT)
            await tempDecEDAT.move(oldMIDIPath, true)
          }

          if (forceEncryption === 'enabled') {
            const newDevkLic = EDATFile.genDevKLicHash(packageFolderName)
            const newContentID = EDATFile.genContentID(packageFolderName.toUpperCase())
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

  try {
    await parser.export(newDTAPath)
  } catch (err) {
    for (const temp of tempFolders) {
      await temp.path.deleteDir(true)
    }
    await mainTempFolder.deleteDir(true)
    throw new Error(`No DTA file could be created. None of the provided internal songnames were found on the packages provided.`, { cause: err })
  }

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
          throw new Error(`Registered song on DTA with internal songname "${songname}" ${newSongname.length > 0 && `(with new internal songname "${newSongname}") `}has no audio files linked to the song.`)
        }

        const songGenFolder = newFolder.gotoDir(`songs/${newUsedSongname}/gen`)
        await songGenFolder.mkDir(true)
        const newMOGG = songGenFolder.gotoFile(`../${newUsedSongname}.mogg`)
        const newMIDI = songGenFolder.gotoFile(`../${newUsedSongname}.mid.edat`)
        const newPNG = songGenFolder.gotoFile(`${newUsedSongname}_keep.png_ps3`)
        const newMILO = songGenFolder.gotoFile(`${newUsedSongname}.milo_ps3`)

        await mainTempMOGG.move(newMOGG)
        await mainTempMIDI.move(newMIDI)
        await mainTempPNG.move(newPNG)
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
