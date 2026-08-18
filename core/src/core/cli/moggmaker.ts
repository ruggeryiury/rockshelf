import { temporaryFile } from 'tempy'
import { command, flag, number, option, restPositionals, string } from 'cmd-ts'
import { PerformanceTimerAPI } from '../api/PerformanceTimerAPI'
import { CLIAPI } from '../api/CLIAPI'
import { FilePath, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'
import { BinaryAPI, PythonAPI } from '../../lib/rbtools'

/**
 * A class that can create multitrack OGG files to use on Rock Band games.
 */
export class MOGGMaker {
  /**
   * An array with file paths of the individual audio files that will be the channels of the new MOGG file.
   */
  private audioTracks: FilePath[]
  /**
   * The quantity of channels.
   */
  private channelsCount: number
  /**
   * The duration of the audio (in milliseconds).
   */
  private audioDuration: number
  /**
   * The sample rate used on this MOGG file.
   */
  private audioSampleRate: number

  constructor() {
    this.audioTracks = []
    this.channelsCount = 0
    this.audioDuration = 0
    this.audioSampleRate = 0
  }

  /**
   * Gets the amount of channels of the the new MOGG file.
   * @returns {number}
   */
  get channels(): number {
    return this.channelsCount
  }

  get tracks(): FilePath[] {
    return this.audioTracks
  }

  /**
   * Appends an audio file to the MOGG file audio array and returns the numbers of channels added on this operation.
   * - - - -
   * @param {FilePathLikeTypes} audioFilePath A path to an audio file or an array with audio file paths to be added.
   * @returns {Promise<number>}
   */
  async addTracks(audioFilePath: FilePathLikeTypes | FilePathLikeTypes[]): Promise<number> {
    let channelsAdded = 0
    if (Array.isArray(audioFilePath)) {
      for (const audioFile of audioFilePath) {
        const audioPath = pathLikeToFilePath(audioFile)
        const { channels, duration, sampleRate } = await PythonAPI.audioFileStat(audioPath)

        if (!channels || !duration || !sampleRate) throw new Error(`Provided file "${audioPath.path}" is not a compatible audio file.`)

        if (this.audioDuration === 0) this.audioDuration = duration
        else if (this.audioDuration !== duration) throw new Error(`Provided file "${audioPath.path}" doesn't have the same duration from the first audio file added to this class\n\nClass audio duration: ${this.audioDuration.toString()}\nProvided file duration: ${duration.toString()}`)

        if (this.audioSampleRate === 0) this.audioSampleRate = sampleRate
        else if (this.audioSampleRate !== sampleRate) throw new Error(`Provided file "${audioPath.path}" doesn't have the same sample rate from the first audio file added to this class\n\nClass sample rate: ${this.audioSampleRate.toString()}\nProvided file sample rate: ${sampleRate.toString()}`)

        this.channelsCount += channels
        channelsAdded += channels
        this.audioTracks.push(audioPath)
      }

      return channelsAdded
    } else {
      const audioPath = pathLikeToFilePath(audioFilePath)
      const { channels, duration, sampleRate } = await PythonAPI.audioFileStat(audioFilePath)

      if (!channels || !duration || !sampleRate) throw new Error(`Provided file "${audioPath.path}" is not a compatible audio file.`)

      if (this.audioDuration === 0) this.audioDuration = duration
      else if (this.audioDuration !== duration) throw new Error(`Provided file "${audioPath.path}" doesn't have the same duration from the first audio file added to this class\n\nClass audio duration: ${this.audioDuration.toString()}\nProvided file duration: ${duration.toString()}`)

      if (this.audioSampleRate === 0) this.audioSampleRate = sampleRate
      else if (this.audioSampleRate !== sampleRate) throw new Error(`Provided file "${audioPath.path}" doesn't have the same sample rate from the first audio file added to this class\n\nClass sample rate: ${this.audioSampleRate.toString()}\nProvided file sample rate: ${sampleRate.toString()}`)

      this.channelsCount += channels
      channelsAdded += channels
      this.audioTracks.push(audioPath)
    }

    return channelsAdded
  }
}

export const moggmaker = command({
  name: 'moggmaker',
  description: 'Joins multiple audio files to create a MOGG file.',
  args: {
    files: restPositionals({
      displayName: 'audio_files',
      description: 'An array of audio files to be added as MOGG tracks.',
      type: string,
    }),
    output: option({ long: 'output', short: 'o', type: string, description: 'The destination path of the new MOGG file.' }),
    encrypted: flag({ long: 'encrypt', short: 'e', defaultValue: () => false, description: 'Encrypts the created MOGG file using 0x0B encryption.' }),
    quality: option({ long: 'quality', short: 'q', type: number, defaultValue: () => 3, description: 'The quality value of the OGG encoding.' }),
    verbose: flag({ long: 'verbose', short: 'v', defaultValue: () => false, description: 'Print additional information during execution.' }),
  },
  async handler({ files, verbose, encrypted, output, quality }) {
    const timer = new PerformanceTimerAPI()
    const filePaths = files.map((file) => pathLikeToFilePath(file))
    const outWAV = pathLikeToFilePath(temporaryFile({ extension: 'wav' }))
    const outOGG = pathLikeToFilePath(temporaryFile({ extension: 'ogg' }))
    const outMOGG = pathLikeToFilePath(output).changeFileExt('mogg')
    const moggmaker = new MOGGMaker()

    for (const file of filePaths) {
      if (file.exists) {
        const channelsAdded = await moggmaker.addTracks(file)

        if (verbose) console.log(`Added ${channelsAdded === 1 ? 'mono' : 'stereo'} audio file: { ${file.path} }`)
      }
    }

    if (moggmaker.channels === 6) throw new Error('Tried to create a MOGG file with six channels, which is known to cause glitches on the audio due to surround processing for OGG files.')

    if (quality > 10 || quality < 1) quality = 3

    if (verbose) console.log(`Writing ${moggmaker.channels}-channel${moggmaker.channels === 1 ? '' : 's'} WAV file\nOutput: { ${outWAV.path} }`)
    await PythonAPI.multitrackWAVCreator(moggmaker.tracks, outWAV)

    if (verbose) console.log(`Writing OGG file with quality ${quality.toString()}.\nOutput: { ${outOGG.path} }`)
    await BinaryAPI.oggEnc(outWAV, outOGG, { quality })

    if (verbose) console.log(`Inserting MOGG header.\nOutput: { ${outMOGG.path} }`)
    await BinaryAPI.makeMogg(outOGG, outMOGG, encrypted)

    if (verbose) console.log(`Deleting temporary files.`)
    if (outWAV.exists) await outWAV.delete()
    if (outOGG.exists) await outOGG.delete()

    console.log(`Operation Completed: ${timer.end()}`)
    return CLIAPI.exit()
  },
})
