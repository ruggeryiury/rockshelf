import { BinaryReader, DirPath, FilePath, pathLikeToDirPath, pathLikeToFilePath, StreamWriter, type DirPathLikeTypes, type FilePathJSONRepresentation, type FilePathLikeTypes } from 'node-lib'
import { BinaryAPI, DTAParser } from '../core.exports'
import { isRPCS3Devhdd0PathValid, parsePKGFileOrBuffer, processPKGItemEntries, type PartialDTAFile, type RB3CompatibleDTAFile } from '../lib.exports'

export interface PKGFileSongPackageStatObject {
  /**
   * The Content ID of the PKG file.
   */
  contentID: string
  /**
   * The Title ID of the PKG file.
   */
  titleID: string
  /**
   * The Code ID of the PKG file.
   */
  pkgCodeID: string
  /**
   * The folder name where the PKG contents will be installed.
   */
  folderName: string
  /**
   * An array with all files included on the PKG file.
   */
  files: string[]
  /**
   * The contents of the PKG DTA file.
   */
  dta: DTAParser
  /**
   * The contents of the PKG upgrades DTA file.
   */
  upgrades: DTAParser | undefined
  /**
   * A boolean value that tells if the package has two or more songs.
   */
  isSongPackage: boolean
  /**
   * A boolean value that tells if the package has PRO Guitar/Bass upgrades.
   */
  hasUpgrades: boolean
  /**
   * The size of the PKG file.
   */
  fileSize: number
  /**
   * The header contents SHA256 hash of the PKG file.
   */
  contentsHash: string
}

export interface PKGFileJSONRepresentation extends Omit<PKGFileSongPackageStatObject, 'dta' | 'upgrades'> {
  /**
   * A JSON representation with stats of the file path.
   */
  path: FilePathJSONRepresentation
  /**
   * The contents of the package's DTA file.
   */
  dta: RB3CompatibleDTAFile[]
  /**
   * The contents of the package's upgrades DTA file.
   */
  upgrades?: PartialDTAFile[]
}

/**
 * `PKGFile` is a class that represents a PS3 PKG file.
 */
export class PKGFile {
  // #region Constructor

  /** The path to the PKG file. */
  path: FilePath

  /**
   * `PKGFile` is a class that represents a PS3 PKG file.
   * - - - -
   * @param {FilePathLikeTypes} pkgFilePath The path to the PKG file.
   */
  constructor(pkgFilePath: FilePathLikeTypes) {
    this.path = pathLikeToFilePath(pkgFilePath)
  }

  // #region Methods

  /**
   * Checks the integrity of the PS3 PKG by reading the file signature (magic).
   * - - - -
   * @returns {Promise<string>}
   * @throws {Error} When it identifies file signature of any unknown file format.
   */
  async checkFileIntegrity(): Promise<string> {
    if (!this.path.exists) throw new Error(`Provided PS3 PKG file "${this.path.path}" does not exists`)
    const magic = await BinaryReader.fromBuffer(await this.path.readOffset(0, 4)).readUInt32BE()

    // PKG
    if (magic === 0x7f504b47) return 'PKG'
    throw new Error(`Provided PS3 PKG file "${this.path.path}" is not a valid PS3 PKG.`)
  }

  /**
   * Returns an object with stats of the PS3 PKG file. This method only works for song packages PKG files, otherwise will return an error.
   * - - - -
   * @returns {Promise<PKGFileSongPackageStatObject>}
   */
  async stat(): Promise<PKGFileSongPackageStatObject> {
    await this.checkFileIntegrity()
    const data = await parsePKGFileOrBuffer(this.path)
    let isSongPackage = false
    let hasUpgrades = false
    const dtaEntry = (await processPKGItemEntries(data.header, data.entries, this.path, /songs\.(dta|DTA)$/))[0] as Buffer | undefined
    const upgradesEntry = (await processPKGItemEntries(data.header, data.entries, this.path, /upgrades\.(dta|DTA)$/))[0] as Buffer | undefined
    let dta = new DTAParser()
    if (dtaEntry) dta = DTAParser.fromBuffer(dtaEntry)
    if (dta.songs.length > 1) isSongPackage = true
    let upgrades: DTAParser | undefined
    if (upgradesEntry) {
      hasUpgrades = true
      upgrades = DTAParser.fromBuffer(upgradesEntry)
    }
    return {
      contentID: data.header.contentID,
      titleID: data.header.cidTitle1,
      pkgCodeID: data.header.cidTitle2,
      folderName: data.entries.dlcFolderName,
      files: data.entries.items.map((item) => item.name),
      dta,
      upgrades,
      isSongPackage,
      hasUpgrades,
      fileSize: data.fileSize,
      contentsHash: data.entries.sha256,
    }
  }

  /**
   * Returns a JSON representation of this `PKGFile` class.
   *
   * This method is very similar to `.stat()`, but also returns information about the PS3 PKG file path.
   * - - - -
   * @returns {Promise<PKGFileJSONRepresentation>}
   */
  async toJSON(): Promise<PKGFileJSONRepresentation> {
    const pkgStat = await this.stat()
    return {
      path: this.path.toJSON(),
      ...pkgStat,
      dta: pkgStat.dta.songs,
      upgrades: pkgStat.upgrades ? pkgStat.upgrades.updates : undefined,
    }
  }

  /**
   * Extracts the PKG file contents and returns the folder path where all contents were extracted.
   * - - - -
   * @param {DirPathLikeTypes} destPath The folder path where you want the files to be extracted to.
   * @param {boolean} [extractOnRoot] `OPTIONAL` Extract all files on the root rather than recreate the entire PKG file system recursively. Default is `false`.
   * @param {string[]} [songs] `OPTIONAL` An array of string of internal songnames to be extracted. If not provided, all songs will be extracted normally.
   * @returns {Promise<DirPath>}
   */
  async extract(destPath: DirPathLikeTypes, extractOnRoot: boolean = false, songs: string[] = []): Promise<DirPath> {
    await this.checkFileIntegrity()
    const dest = pathLikeToDirPath(destPath)
    if (!dest.exists) await dest.mkDir()
    else {
      await dest.deleteDir(true)
      await dest.mkDir()
    }

    const stat = await this.toJSON()

    const parser = new DTAParser(stat.dta)
    const files: string[] = []
    if (songs.length > 0) {
      parser.songs = parser.songs.filter((s) => songs.includes(s.songname))
      if (parser.songs.length === 0) throw new Error('None of the provided internal songnames were found on the provided PKG file.')

      files.push(`USRDIR/${stat.folderName}/songs/songs.dta`)
      for (const song of parser.songs) {
        files.push(`USRDIR/${stat.folderName}/songs/${song.songname}`)
      }
    }
    await BinaryAPI.ps3pPKGRipper(this.path, dest, songs.length > 0 ? files : undefined)

    if (extractOnRoot) {
      const paths = await dest.readDir(true)
      const allFiles = paths.filter((p) => p instanceof FilePath)
      const allDirs = paths.filter((p) => p instanceof DirPath)

      for (const file of allFiles) {
        const rootFile = dest.gotoFile(file.fullname)
        if (!rootFile.exists) await file.move(rootFile)
      }

      for (const dir of allDirs) {
        if (dir.exists) await dir.deleteDir(true)
      }
    }

    const newDTAPath = extractOnRoot ? dest.gotoFile('songs.dta') : dest.gotoFile(`USRDIR/${stat.folderName}/songs/songs.dta`)
    await parser.export(newDTAPath)
    return dest
  }

  /**
   * Installs the PKG file on the provided RPCS3's `dev_hdd0` folder and returns a `DirPath` object of the provided `devhdd0Path` argument.
   * - - - -
   * @param devhdd0Path The path to the `dev_hdd0` folder of your RPCS3 installation.
   * @returns {Promise<DirPath>}
   */
  async installOnRPCS3(devhdd0Path: DirPathLikeTypes): Promise<DirPath> {
    const devhdd0 = isRPCS3Devhdd0PathValid(devhdd0Path)
    const stat = await this.toJSON()
    if (stat.contentsHash.toLowerCase() === 'e386b8ab41e844ff087400533920cccca99c4fe3d455756bab35223592b0e683') {
      // Is Rock Band 1 Song Package, install RAP file as well
      const user0ExdataFolder = devhdd0.gotoDir('home/00000001/exdata')
      if (!user0ExdataFolder.exists) await user0ExdataFolder.mkDir(true)
      const rapFilePath = user0ExdataFolder.gotoFile('UP0006-BLUS30050_00-RB1EXPORTCCF0099.rap')
      const writer = await StreamWriter.toFile(rapFilePath)
      writer.writeHex('0xCDC040B4F45B247FC71ADA455F423850')
      await writer.close()
    }
    return await BinaryAPI.ps3pPKGRipper(this.path, devhdd0.gotoDir(`game/${stat.titleID}`))
  }
}
