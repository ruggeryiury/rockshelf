import type { BinaryToTextEncoding } from 'node:crypto'
import axios from 'axios'
import { createHashFromBuffer, type FilePath, pathLikeToFilePath, type AllHashAlgorithms, type FilePathLikeTypes } from 'node-lib'
import { depackDTAContents, detectDTABufferEncoding, genNumericSongID, genTracksCountArray, isRB3CompatibleDTA, parseDTA, patchDTAEncodingFromDTAFileObject, sortDTA, stringifyDTA, type RB3CompatibleDTAFile, type SongDataCreationObject, type DTAStringifyOptions, type SongSortingTypes, type DTAFileUpdateObject, type DTAFileBatchUpdateObject, createDTA } from '../lib.exports'
import { RBTools } from './RBTools'
import { inspect } from 'node:util'
import { isValidURL } from '../utils.exports'

export interface DTAParserJSONRepresentation {
  /**
   * An array with songs with complete information to work properly on Rock Band 3.
   */
  songs: RB3CompatibleDTAFile[]
  /**
   * An array with updates that will be applied to its respective songs, if the song is found on `this.songs`.
   *
   * Updates are only stringified directly when there's no entries on `this.songs`.
   */
  updates: DTAFileUpdateObject[]
}

/**
 * A class with methods related to DTA file parsing.
 *
 * This class only works with DTA files of songs and metadata updates, and must not be used to parse any other type of DTA script.
 */
export class DTAParser {
  // #region Static Methods
  /**
   * Parses a DTA file buffer.
   * - - - -
   * @param {Buffer} buffer A `Buffer` object from DTA file contents to be parsed.
   * @returns {DTAParser}
   */
  static fromBuffer(buffer: Buffer): DTAParser {
    const enc = detectDTABufferEncoding(buffer)
    const contents = buffer.toString(enc)
    const depackedSongs = depackDTAContents(contents)
    const songs = depackedSongs.map((val) => parseDTA(val))
    const parser = new DTAParser(songs)
    parser.patchCores()
    parser.patchSongsEncodings()
    parser.patchIDs()
    return parser
  }

  /**
   * Parses a DTA file from a file path.
   * - - - -
   * @param {FilePathLikeTypes} dtaFilePath The path to the DTA file to be parsed.
   * @returns {Promise<DTAParser>}
   */
  static async fromFile(dtaFilePath: FilePathLikeTypes): Promise<DTAParser> {
    const dta = pathLikeToFilePath(dtaFilePath)
    const dtaBuffer = await dta.read()
    return DTAParser.fromBuffer(dtaBuffer)
  }

  /**
   * Parses a DTA file from an URL.
   * - - - -
   * @param {string} url The URL to the DTA file to be parsed.
   * @returns {Promise<DTAParser>}
   */
  static async fromURL(url: string): Promise<DTAParser> {
    if (!isValidURL(url)) throw new Error(`Provided DTA URL "${url}" is not a valid HTTP/HTTPS URL`)
    const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' })
    if (response.status !== 200) throw new Error(`GET method fetching DTA file data on URL "${url}" returned with status ${response.status.toString()}: ${response.statusText}`)
    const buf = response.data
    return DTAParser.fromBuffer(Buffer.from(buf))
  }

  /**
   * Returns a SHA256 hash from a DTA file `Buffer`.
   * - - - -
   * @param {Buffer} dtaFileBuffer A `Buffer` object from a DTA file.
   * @param {AllHashAlgorithms} [algorithm] The hash algorithm to use. Default is `'sha256'`.
   * @param {BinaryToTextEncoding} [outputEncoding] The output encoding for the hash. Default is `'hex'`.
   * @returns {string}
   */
  static calculateHashFromBuffer(dtaFileBuffer: Buffer, algorithm: AllHashAlgorithms = 'sha256', outputEncoding: BinaryToTextEncoding = 'hex'): string {
    const parser = DTAParser.fromBuffer(dtaFileBuffer)
    parser.sort('ID')
    const dtaBuffer = Buffer.from(stringifyDTA(parser))
    return createHashFromBuffer(dtaBuffer, algorithm, outputEncoding)
  }

  /**
   * Asynchronously reads and parses a DTA file and returns a SHA256 hash from it.
   * - - - -
   * @param {FilePathLikeTypes} dtaFilePath The path to a DTA file.
   * @param {AllHashAlgorithms} [algorithm] The hash algorithm to use. Default is `'sha256'`.
   * @param {BinaryToTextEncoding} [outputEncoding] The output encoding for the hash. Default is `'hex'`.
   * @returns {Promise<string>}
   */
  static async calculateHashFromFile(dtaFilePath: FilePathLikeTypes, algorithm: AllHashAlgorithms = 'sha256', outputEncoding: BinaryToTextEncoding = 'hex'): Promise<string> {
    const dtaFileBuffer = await pathLikeToFilePath(dtaFilePath).read()
    return DTAParser.calculateHashFromBuffer(dtaFileBuffer, algorithm, outputEncoding)
  }

  /**
   * Creates a `RB3CompatibleDTAFile` object from a parsed song data object.
   * - - - -
   * @param {SongDataCreationObject} songdata An object with values of the song's data.
   * @returns {RB3CompatibleDTAFile}
   */
  static create(songdata: SongDataCreationObject): RB3CompatibleDTAFile {
    return createDTA(songdata)
  }

  //#region Constructor

  /**
   * An array with songs with complete information to work properly on Rock Band 3.
   */
  songs: RB3CompatibleDTAFile[]
  /**
   * An array with updates that will be applied to its respective songs, if the song is found on `this.songs`.
   *
   * Updates are only stringified directly when there's no entries on `this.songs`.
   */
  updates: DTAFileUpdateObject[]

  /**
   * A class with methods related to DTA file parsing.
   *
   * This class only works with DTA files of songs and metadata updates, and must not be used to parse any other type of DTA script.
   * - - - -
   * @param {RB3CompatibleDTAFile | DTAFileUpdateObject | (RB3CompatibleDTAFile | DTAFileUpdateObject)[]} songs `OPTIONAL` A parsed song object or an array of parsed song objects.
   */
  constructor(songs?: RB3CompatibleDTAFile | DTAFileUpdateObject | (RB3CompatibleDTAFile | DTAFileUpdateObject)[]) {
    this.songs = []
    this.updates = []
    if (songs) {
      if (Array.isArray(songs)) {
        for (const song of songs) {
          if (isRB3CompatibleDTA(song)) this.songs.push(song)
          else this.updates.push(song)
        }
      } else {
        if (isRB3CompatibleDTA(songs)) this.songs.push(songs)
        else this.updates.push(songs)
      }
    }
  }

  // #region Private Methods

  private _cleanUpdates() {
    this.updates = []
  }

  // #region Instance Methods

  /**
   * Gets a song entry by it's entry ID. Returns `undefined` if the song is not found.
   * - - - -
   * @param {string} id The entry ID of the song.
   * @returns {RB3CompatibleDTAFile | undefined}
   */
  getSongByEntryID(id: string): RB3CompatibleDTAFile | undefined {
    return this.songs.find((song) => String(song.id as string | number) === String(id as string | number))
  }

  /**
   * Gets a song entry by it's song ID. Returns `undefined` if the song is not found.
   * - - - -
   * @param {string | number} songID The song ID of the song.
   * @returns {RB3CompatibleDTAFile | undefined}
   */
  getSongBySongID(songID: string | number): RB3CompatibleDTAFile | undefined {
    return this.songs.find((song) => String(song.song_id) === String(songID))
  }

  /**
   * Adds song entries to the `songs` array and returns the updated length of the `songs` array.
   * - - - -
   * @param {RB3CompatibleDTAFile | RB3CompatibleDTAFile[]} songs The song's data that you want to add. Can be a single `RB3CompatibleDTAFile` object, or an array of multiple `RB3CompatibleDTAFile` objects.
   * @returns {number}
   * @throws {Error} When a provided entry is not compatible with Rock Band 3.
   */
  addSongs(songs: RB3CompatibleDTAFile | RB3CompatibleDTAFile[]): number {
    if (Array.isArray(songs) && songs.length > 0) {
      for (const song of songs) {
        if (!isRB3CompatibleDTA(song)) throw new Error('Only RB3 compatible song metadata is allowed to insert as songs.')
        this.songs.push(song)
      }
    } else {
      if (!isRB3CompatibleDTA(songs)) throw new Error('Only RB3 compatible song metadata is allowed to insert as songs.')
      this.songs.push(songs)
    }
    return this.songs.length
  }

  /**
   * Removes song entries to the `songs` array and returns an array with the removed songs object.
   * - - - -
   * @param {string | string[]} value The song value that you want to add. Can be a single string, or an array of multiple strings.
   * @param {'id' | 'songname'} [type] `OPTIONAL` The type of the value you want to evaluate. Default is `'id'`.
   * @returns {RB3CompatibleDTAFile[]}
   */
  removeSongs(value: string | string[], type: 'id' | 'songname' = 'id'): RB3CompatibleDTAFile[] {
    const removedSongs: RB3CompatibleDTAFile[] = []
    if (Array.isArray(value) && value.length > 0) {
      for (const val of value) {
        const i = this.songs.findIndex((v) => {
          if (type === 'id') return v.id === val
          else return v.songname === val
        })
        if (i > -1) removedSongs.push(...this.songs.splice(i, 1))
      }
    } else if (typeof value === 'string' && value) {
      const i = this.songs.findIndex((v) => {
        if (type === 'id') return v.id === value
        else return v.songname === value
      })
      if (i > -1) removedSongs.push(...this.songs.splice(i, 1))
    }

    return removedSongs
  }

  /**
   * Adds update entries to the `updates` array and returns the updated length of the `updates` array.
   * - - - -
   * @param {DTAFileUpdateObject | DTAFileUpdateObject[]} updates The updates' data that you want to add.
   * @returns {number}
   */
  addUpdates(updates: DTAFileUpdateObject | DTAFileUpdateObject[]): number {
    if (Array.isArray(updates)) {
      for (const update of updates) {
        const i = this.updates.findIndex((val) => val.id === update.id)
        if (i === -1) this.updates.push(update)
        else this.updates[i] = { ...this.updates[i], ...update }
      }
    } else {
      const i = this.updates.findIndex((val) => val.id === updates.id)
      if (i === -1) this.updates.push(updates)
      else this.updates[i] = { ...this.updates[i], ...updates }
    }
    return this.updates.length
  }

  /**
   * Applies Rock Band 3 Deluxe updates on songs found in the `songs` array and returns an array with IDs of songs where the updated imformations were applied.
   * - - - -
   * @param {boolean} [deleteNonAppliedUpdates] `OPTIONAL` Cleans the `updates` array when finished. Default is `true`.
   * @param {boolean} [fetchUpdates] `OPTIONAL` If true, the function will fetch all updates from the Rock Band 3 Deluxe repository even if there's a local update file and save the new content. Default is `false`.
   * @returns {Promise<string[]>}
   */
  async applyDXUpdatesOnSongs(deleteNonAppliedUpdates: boolean = true, fetchUpdates: boolean = false): Promise<string[]> {
    const localUpdates = RBTools.dbFolder.gotoFile('updates.json')
    if (!localUpdates.exists) fetchUpdates = true
    if (fetchUpdates) {
      const dta = await DTAParser.fromURL('https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/harmonix_upgrades.dta')
      for (const link of ['https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/official_additional_metadata.dta', 'https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/unofficial_additional_metadata.dta', 'https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/metadata_updates.dta', 'https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/harms_and_updates.dta', 'https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/rbhp_upgrades.dta', 'https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/rb_plus_upgrades.dta', 'https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/vanilla.dta', 'https://raw.githubusercontent.com/hmxmilohax/rock-band-3-deluxe/refs/heads/develop/_ark/dx/song_updates/loading_phrases.dta']) {
        dta.addUpdates((await DTAParser.fromURL(link)).updates)
      }
      await localUpdates.write(JSON.stringify(dta.updates))
    }
    if (localUpdates.exists) {
      const json = await localUpdates.readJSON<DTAFileUpdateObject>()
      this.addUpdates(json)
    }

    return this.applyUpdatesToExistingSongs(deleteNonAppliedUpdates)
  }

  /**
   * Adds update values to all songs inside the `songs` array and returns an array with IDs of songs where the updated imformations were applied.
   * - - - -
   * @param {DTAFileBatchUpdateObject} update An object with updated values to be applied on all songs from the `songs` array.
   * @returns {string[]}
   */
  addUpdatesToAllSongs(update: DTAFileBatchUpdateObject): string[] {
    const allIDs = this.songs.map((song) => song.id)
    for (const id of allIDs) this.addUpdates({ id, ...update })
    return this.applyUpdatesToExistingSongs()
  }

  /**
   * Inserts the updates found in the `updates` array on songs inside the `songs` array directly, if they're found. This function returns an array with IDs of songs where the updated imformations were applied.
   * @param {boolean} [deleteNonAppliedUpdates] `OPTIONAL` Cleans the `updates` array when finished. Default is `true`.
   * @returns {string[]}
   */
  applyUpdatesToExistingSongs(deleteNonAppliedUpdates = true): string[] {
    if (this.updates.length === 0) return [] as string[]
    const appliedUpdSongsIDs: string[] = []
    const unusedUpdates: DTAFileUpdateObject[] = []
    const newSongs: RB3CompatibleDTAFile[] = []

    for (const upd of this.updates) {
      const songIndex = this.songs.findIndex((val) => val.id === upd.id)
      if (songIndex === -1 && isRB3CompatibleDTA(upd)) {
        const { newID, ...u } = upd as DTAFileUpdateObject
        this.songs.push({ ...u, id: newID ?? u.id } as RB3CompatibleDTAFile)
        appliedUpdSongsIDs.push(upd.id)
      } else if (songIndex === -1) unusedUpdates.push(upd)
      else appliedUpdSongsIDs.push(upd.id)
    }
    for (const song of this.songs) {
      const upd = this.updates.find((update) => song.id === update.id)
      if (upd && isRB3CompatibleDTA(upd)) {
        const { newID, ...u } = upd as DTAFileUpdateObject
        newSongs.push({ ...u, id: newID ?? u.id } as RB3CompatibleDTAFile)
      } else if (upd) {
        const { newID, ...u } = upd
        newSongs.push({ ...song, ...u, id: newID ?? u.id })
      } else newSongs.push(song)
    }

    // Patching some update errors while parsing
    for (let i = 0; i < newSongs.length; i++) {
      if ('pans' in newSongs[i] && newSongs[i].pans![newSongs[i].pans!.length - 1] === 2.5) {
        if ('tracks_count' in newSongs[i] && !newSongs[i].tracks_count[6]) newSongs[i].tracks_count.push(2)
      }
    }

    this.songs = newSongs
    if (deleteNonAppliedUpdates) this._cleanUpdates()
    else this.updates = unusedUpdates
    return appliedUpdSongsIDs
  }

  /**
   * Patches song encodings and returns an array with IDs of songs where the encoding patch were applied. This function iterates through all songs' entries inside the `songs` array and searches for non-ASCII characters on every string value of the song. With this, all DTA files used on this class must be imported using `utf-8` encoding, and all characters will be displayed correctly.
   * - - - -
   * @returns {string[]}
   */
  patchSongsEncodings(): string[] {
    const patchedSongsID: string[] = []
    const newSongs: RB3CompatibleDTAFile[] = []
    for (const song of this.songs) {
      const newEnc = patchDTAEncodingFromDTAFileObject(song)
      if (song.encoding === newEnc) newSongs.push(song)
      else {
        patchedSongsID.push(song.id)
        newSongs.push({ ...song, encoding: newEnc })
      }
    }

    this.songs = newSongs
    return patchedSongsID
  }

  /**
   * Patches songs with string songs IDs to a numeric one and returns an array with IDs of songs where the ID patch were applied.
   * - - - -
   * @returns {string[]}
   */
  patchIDs(): string[] {
    const patchedSongsID: string[] = []
    const newSongs: RB3CompatibleDTAFile[] = []
    for (const song of this.songs) {
      if (!isNaN(Number(song.song_id))) newSongs.push(song)
      else {
        patchedSongsID.push(song.id)
        newSongs.push({ ...song, song_id: Math.abs(genNumericSongID(song.id)), original_id: song.song_id.toString() })
      }
    }

    this.songs = newSongs
    return patchedSongsID
  }

  /**
   * Patches the `cores` array of each song on the `songs` array and returns an array with IDs of songs where the encoding patch were applied.
   * - - - -
   * @returns {string[]}
   */
  patchCores(): string[] {
    const patchedSongsID: string[] = []
    const newSongs: RB3CompatibleDTAFile[] = []
    for (const song of this.songs) {
      const tracks = genTracksCountArray(song.tracks_count)
      const coresArray = Array<number>(tracks.allTracksCount)
        .fill(-1)
        .map((_, coreI) => {
          if (tracks.guitar?.includes(coreI)) return 1
          return -1
        })

      patchedSongsID.push(song.id)
      newSongs.push({ ...song, cores: coresArray })
    }

    this.songs = newSongs
    return patchedSongsID
  }

  /**
   * Patches the `format` and `version` values, forcing all songs to use RBN2 velues, and returns an array with IDs of songs where the encoding patch were applied.
   *
   * _NOTE: This patch must not be applied when parsing any official song._
   * - - - -
   * @returns {string[]}
   */
  patchFmtVers(): string[] {
    const patchedSongsID: string[] = []
    const newSongs: RB3CompatibleDTAFile[] = []
    for (const song of this.songs) {
      if (song.format !== 10 || song.version !== 30) patchedSongsID.push(song.id)
      newSongs.push({ ...song, format: 10, version: 30 })
    }

    this.songs = newSongs
    return patchedSongsID
  }

  /**
   * Sorts the `songs` array based on a song data value.
   * - - - -
   * @param {SongSortingTypes} sortBy The sorting type.
   */
  sort(sortBy: SongSortingTypes): void {
    this.songs = sortDTA(this.songs, sortBy)
  }

  /**
   * Stringify songs and updates entries back to DTA format.
   * - - - -
   * @param {DTAStringifyOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the stringify process.
   * @returns {string}
   */
  stringify(options?: DTAStringifyOptions): string {
    return stringifyDTA(
      {
        songs: this.songs,
        updates: this.updates,
      },
      options
    )
  }

  /**
   * Calculates a SHA256 hash of the songs included on this class instance.
   * - - - -
   * @param {AllHashAlgorithms} [algorithm] The hash algorithm to use. Default is `'sha256'`.
   * @param {BinaryToTextEncoding} [outputEncoding] The output encoding for the hash. Default is `'hex'`.
   * @returns {string}
   */
  calculateHash(algorithm: AllHashAlgorithms = 'sha256', outputEncoding: BinaryToTextEncoding = 'hex'): string {
    const parser = new DTAParser([...this.songs, ...this.updates])
    parser.sort('ID')
    const dtaFileBuffer = Buffer.from(stringifyDTA(parser))
    return createHashFromBuffer(dtaFileBuffer, algorithm, outputEncoding)
  }

  /**
   * Stringify songs and updates entries back to DTA format and writes the stringified contents into a file.
   * - - - -
   * @param destPath The file path where you want to save the DTA contents.
   * @param {DTAStringifyOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the stringify process.
   * @returns {Promise<FilePath>}
   */
  async export(destPath: FilePathLikeTypes, options?: DTAStringifyOptions): Promise<FilePath> {
    const dest = pathLikeToFilePath(destPath)
    return await dest.write(this.stringify(options), 'utf8')
  }

  [inspect.custom]() {
    return `DTAParser { ${this.songs.length} Song${this.songs.length === 1 ? '' : 's'}, ${this.updates.length} Updates }`
  }

  /**
   * Returns a JSON representation of the `DTAParser` instance, including parsed songs and updates.
   * - - - -
   * @returns {DTAParserJSONRepresentation}
   */
  toJSON(): DTAParserJSONRepresentation {
    return {
      songs: this.songs,
      updates: this.updates,
    }
  }
}
