/* eslint-disable @typescript-eslint/require-await */
import { BrowserWindow, ipcMain } from 'electron'
import { getBrowserWindowFromEvent } from '../electron/getBrowserWindowFromEvent'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import type { ReadStream, WriteStream } from 'fs'
import { DirPath, FilePath, getReadableBytesSize } from 'node-lib'
import { RockshelfFileSystemAPI } from '../fs/RockshelfFileSystemAPI'
import { STFSFile, type STFSFileJSONRepresentation } from '../../lib/rbtools'
import type { UserConfigObject } from '../../core.exports'
import { sanitizeFilename } from '../../lib.exports'

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
  for (const item of queue) {
    newQueue.push(item.toJSON())
  }
  win.webContents.send('sendRhythmverseQueue', newQueue)
  return true
}

export class SongDownloadQueueAPI {
  downloadLink: string
  id: string
  hash: string
  albumURL: string
  name: string
  artist: string
  status: 'ready' | 'downloading' | 'error' | 'success' | 'aborted'

  private _userOptions: UserConfigObject
  private _abort: AbortController
  private _file: STFSFile
  private _response?: AxiosResponse<ReadStream>
  private _error?: Error
  private _fileWriter?: WriteStream

  totalBytesRaw: number
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

  async startDownload() {
    if (this._error) throw this._error
    if (this.status === 'ready' && !this._response) {
      this.status = 'downloading'
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

  async cancel() {
    if (this._error) throw this._error
    if (this.status === 'downloading' && this._response !== undefined) {
      this._abort.abort()
      this.status = 'aborted'
      this._fileWriter?.close()
      if (this._file.path.exists) await this._file.path.delete()
    }
  }

  toJSON() {
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

  static async initRhythmverseDownloader() {
    ipcMain.handle('rhythmverseDownloadSong', async (event, options: RhythmverseDownloadSongOptions, userOptions: UserConfigObject) => {
      const win = getBrowserWindowFromEvent(event)
      const instance = new SongDownloadQueueAPI(options, userOptions)
      void instance.startDownload()
    })

    ipcMain.handle('rhythmverseCleanDownloadQueue', async (event) => {
      const win = getBrowserWindowFromEvent(event)
      queue = []
    })

    ipcMain.handle('rhythmverseAbortDownload', async (_, hash: string) => {
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

        void sendRhythmverseQueue(win, queue)
      }
    }, 500)
  }
}
