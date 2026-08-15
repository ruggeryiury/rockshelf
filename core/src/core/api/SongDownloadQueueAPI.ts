/* eslint-disable @typescript-eslint/require-await */
import { BrowserWindow, ipcMain } from 'electron'
import { getBrowserWindowFromEvent } from '../electron/getBrowserWindowFromEvent'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import type { ReadStream, WriteStream } from 'fs'
import { DirPath, FilePath, getReadableBytesSize } from 'node-lib'
import { RockshelfFileSystemAPI } from '../api/RockshelfFileSystemAPI'
import { STFSFile, type STFSFileJSONRepresentation } from '../../lib/rbtools'
import type { UserConfigObject } from '../../core.exports'
import { sanitizeFilename } from '../../lib.exports'
import { userData } from '../../data'

export interface RhythmverseDownloadSongOptions {
  downloadLink: string
  id: string
  hash: string
  albumURL: string
  name: string
  artist: string
}

export interface RhythmverseSongDownloadJSONRepresentation {
  id: string
  downloadLink: string
  hash: string
  totalBytesRaw: number
  downloadedBytesRaw: number
  filePath: FilePath
  totalBytes: string
  downloadedBytes: string
  percentage: string
  albumURL: string
  name: string
  artist: string
}

let queue: SongDownloadQueueAPI[] = []

export const sendRhythmverseQueue = (win: BrowserWindow, queue: SongDownloadQueueAPI[]): true => {
  const newQueue: RhythmverseSongDownloadJSONRepresentation[] = []
  for (const item of queue) newQueue.push(item.toJSON())
  win.webContents.send('sendRhythmverseQueue', newQueue)
  return true
}

/**
 * The `SongDownloadQueueAPI` is a class that represents an active download of a song file from RhythmVerse. It joins information about the download, such as song name, artist, and technical values
 * like the server response, abort controllers, file writing stream object, and error from the server response.
 */
export class SongDownloadQueueAPI {
  /**
   * The URL of the song file.
   */
  downloadLink: string
  id: string
  hash: string
  /**
   * The URL to the song's artwork.
   */
  albumURL: string
  /**
   * The name of the song.
   */
  name: string
  /**
   * The artist/band of the song.
   */
  artist: string
  /**
   * The status of the download process.
   */
  status: 'ready' | 'downloading' | 'error' | 'success' | 'aborted'

  /**
   * A copy of the user configuration from Rockshelf's `APPDATA` folder.
   */
  private _userOptions: UserConfigObject
  /**
   * An `AbortController` object used to abort the download.
   */
  private _abort: AbortController
  /**
   * The `STFSFile` object that points to the path which the song will be/were downloaded.
   */
  private _file: STFSFile
  /**
   * The `AxiosResponse` object of the download request.
   */
  private _response?: AxiosResponse<ReadStream>
  /**
   * A value that populates when the download request returns an Error.
   */
  private _error?: Error
  /**
   * The `WriteStream` object to the new song file.
   */
  private _fileWriter?: WriteStream

  /**
   * The number of bytes of the downloaded file. This value is populated if the download request is valid.
   */
  totalBytesRaw: number
  /**
   * The amount of bytes that were downloaded.
   */
  downloadedBytesRaw: number

  constructor(options: RhythmverseDownloadSongOptions, userOptions: UserConfigObject) {
    this.downloadLink = options.downloadLink
    this.id = options.id
    this.hash = options.hash
    this.albumURL = options.albumURL
    this.name = options.name
    this.artist = options.artist

    this._userOptions = userOptions
    this.status = 'ready'
    this._abort = new AbortController()
    this.downloadedBytesRaw = 0
    this.totalBytesRaw = 0
    this._file = new STFSFile(DirPath.of(userOptions.downloadedContentDirPath).gotoFile(`${userOptions.downloadedContentFileName === 'hash' ? options.hash : sanitizeFilename(`${options.name} - ${options.artist}`)}`))
  }

  async tryCreateDestinationFolder(): Promise<void> {
    const dest = DirPath.of(this._userOptions.downloadedContentDirPath)
    if (!dest.exists) await dest.mkDir(true)
  }

  /**
   * Asynchronously starts the download of the song file.
   */
  async startDownload(): Promise<void> {
    if (this._error) throw this._error
    if (this.status === 'ready' && !this._response) {
      this.status = 'downloading'
      await this.tryCreateDestinationFolder()
      if (this._file.path.exists) await this._file.path.delete()
      this._fileWriter = await this._file.path.createWriteStream()
      this._response = await axios.get<ReadStream>(this.downloadLink, { responseType: 'stream', signal: this._abort.signal })
      this.totalBytesRaw = Number(this._response.headers['content-length'])
      queue.push(this)

      this._response.data.on('error', (err) => {
        this.status = 'error'
        this._error = err
      })

      this._response.data.on('data', (chunk) => {
        this.downloadedBytesRaw += chunk.length
        this._fileWriter?.write(chunk)
      })

      this._response.data.on('end', () => {
        this._fileWriter?.close()
        this.status = 'success'
      })
    }
  }

  /**
   * Cancels the download of the song file.
   */
  async cancel(): Promise<void> {
    if (this._error) throw this._error
    if (this.status === 'downloading' && this._response !== undefined) {
      this._abort.abort()
      this.status = 'aborted'
      this._fileWriter?.close()
      if (this._file.path.exists) await this._file.path.delete()
    }
  }

  /**
   * Returns a serialized representation of this class.
   * - - - -
   * @returns {RhythmverseSongDownloadJSONRepresentation}
   */
  toJSON(): RhythmverseSongDownloadJSONRepresentation {
    return {
      id: this.id,
      downloadLink: this.downloadLink,
      hash: this.hash,
      albumURL: this.albumURL,
      name: this.name,
      artist: this.artist,
      totalBytesRaw: this.totalBytesRaw,
      downloadedBytesRaw: this.downloadedBytesRaw,
      filePath: this._file.path,
      totalBytes: getReadableBytesSize(this.totalBytesRaw),
      downloadedBytes: getReadableBytesSize(this.downloadedBytesRaw),
      percentage: `${((this.downloadedBytesRaw / this.totalBytesRaw) * 100).toFixed().toString()}%`,
    }
  }

  static async getDownloadedContentData(): Promise<STFSFileJSONRepresentation[]> {
    const content: STFSFileJSONRepresentation[] = []
    const contentFolder = RockshelfFileSystemAPI.appDownloadableContentDir()

    for (const entry of await contentFolder.readDir()) {
      if (entry instanceof FilePath && entry.ext !== '.zip') {
        const stfs = new STFSFile(entry)
        await stfs.checkFileIntegrity()
        content.push(await stfs.toJSON())
      }
    }

    return content
  }

  [Symbol.dispose]() {
    this._error = new Error('Class item were disposed.')
    this._response = undefined

    if (!this._fileWriter?.closed) this._fileWriter?.close()
    this._fileWriter = undefined
  }

  /**
   * Initiates all handlers used on the RhythmVerse content downloader.
   */
  static init(): void {
    ipcMain.handle('songDownloadQueue.downloadSong', async (_, options: RhythmverseDownloadSongOptions) => {
      const userConfig = await userData.readUserConfig(_)
      if (userConfig === 'corrupted' || userConfig === 'firstTime') throw new Error('User config data is not loaded into memory.')
      const instance = new SongDownloadQueueAPI(options, userConfig)
      void instance.startDownload()
    })

    ipcMain.handle('songDownloadQueue.cleanDownloadQueue', async (_) => {
      queue = []
    })

    ipcMain.handle('songDownloadQueue.cancelDownload', async (_, hash: string) => {
      const item = queue.findIndex((val) => val.hash === hash)
      if (item !== -1) {
        await queue[item].cancel()
        queue.splice(item, 1)
      }
    })

    setInterval(() => {
      if (queue.length > 0) {
        const win = BrowserWindow.getAllWindows()[0]
        let j = 0
        for (let i = 0; i < queue.length; i++) {
          const item = queue[i]
          if (item.status === 'success') {
            queue.splice(i - j, 1)
            j++
          }
        }

        sendRhythmverseQueue(win, queue)
      }
    }, 500)
  }
}
