import { spawn } from 'node:child_process'
import { execAsync, pathLikeToFilePath, pathLikeToString, type DirPathLikeTypes, type FilePathLikeTypes, type DirPath, pathLikeToDirPath, type FilePath } from 'node-lib'
import { useDefaultOptions } from 'use-default-options'
import { ImageFile, MOGGFile, RBTools, type ImageConvertingOptions, type ImageFormatTypes } from '../core.exports'
import { genAudioFileStructure, type RB3CompatibleDTAFile, type TPLHeaderParserObject } from '../lib.exports'
import { platform } from 'node:os'
import { is } from '@electron-toolkit/utils'

// #region Types

export interface ImageFileStatPythonObject {
  /**
   * The extension of the image file.
   */
  ext: string
  /**
   * A description to the image file format.
   */
  extDesc: string
  /**
   * The MIME type of the image file.
   */
  mimeType: string
  /**
   * The width of the image file.
   */
  width: number
  /**
   * The height of the image file.
   */
  height: number
  /**
   * An array with the image file dimensions (width and height).
   */
  dimensions: number[]
  /**
   * The color mode of the image file.
   */
  imageMode: string
}

export interface AudioFileStatPythonObject {
  bitRate: number
  channels: number
  codec: string
  codecDesc: string
  durationSeconds: number
  duration: number
  ext: string
  extDesc: string
  sampleRate: number
  size: number
}

export interface MOGGFileStatPythonObject {
  bitRate: number
  channels: number
  codec: string
  codecDesc: string
  duration: number
  durationSec: number
  ext: string
  extDesc: string
  sampleRate: number
  size: number
  mogg: { size: number; version: number; isEncrypted: boolean; worksInPS3: boolean }
}

export interface MIDIFileStatPythonObject {
  charset: string
  midiType: number
  ticksPerBeat: number
  tracksCount: number
  tracksName: string[]
}

export interface STFSFileStatRawObject {
  /**
   * The name of the package.
   */
  name: string
  /**
   * The description of the package.
   */
  desc: string
  /**
   * An array with all files included on the CON file.
   */
  files: string[]
  /**
   * The contents of the package's DTA file.
   */
  dta?: string
  /**
   * The contents of the package's upgrades DTA file.
   */
  upgrades?: string
  /**
   * The size of the STFS file.
   */
  fileSize: number
  /**
   * The thumbnail that appears on the Xbox dashboard encoded in Data URL string.
   */
  thumbnail: string
  /**
   * The title thumbnail encoded in Data URL string.
   */
  titleThumbnail: string
  /**
   * The header contents SHA1 hash of the STFS file.
   */
  contentsHash: string
}

export type PreviewAudioFormatTypes = 'wav' | 'flac' | 'ogg' | 'mp3'

/**
 * API calls as static methods for Python scripts of RBTools.
 */
export class PythonAPI {
  /**
   * Returns the correct python executable name across many OS'.
   * - - - -
   * @returns {'py' | 'python3'}
   */
  static getPythonExecName = (): 'py' | 'python3' => (platform() === 'win32' ? 'py' : 'python3')
  // #region Image/Texture

  /**
   * Returns an object with stats of an image file.
   * - - - -
   * @param {FilePathLikeTypes} imgFilePath The path to the image file.
   * @returns {Promise<ImageFileStatPythonObject>}
   */
  static async imageFileStat(imgFilePath: FilePathLikeTypes): Promise<ImageFileStatPythonObject> {
    const pythonScript = 'img_file_stat.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${pathLikeToString(imgFilePath)}" -p`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    const returnValue = JSON.parse(stdout) as ImageFileStatPythonObject
    return returnValue
  }

  /**
   * Converts an image file to another image file format.
   *
   * By passing an argument to `options` parameter, you can tweak the dimensions of the new converted file.
   * - - - -
   * @param {FilePathLikeTypes} srcFilePath The source image file to be converted.
   * @param {FilePathLikeTypes} destFilePath The destination path of the new converted image. The new image extension is automatically placed based on the `toFormat` argument.
   * @param {ImageFormatTypes} toFormat The format of the new converted image.
   * @param {ImageConvertingOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the image processing and converting.
   * @returns {ImageFile}
   */
  static async imageConverter(srcFilePath: FilePathLikeTypes, destFilePath: FilePathLikeTypes, toFormat: ImageFormatTypes, options?: ImageConvertingOptions): Promise<ImageFile> {
    const opts = useDefaultOptions(
      {
        width: 256,
        height: 256,
        interpolation: 'lanczos',
        quality: 100,
      },
      options
    )
    const dest = pathLikeToFilePath(destFilePath).changeFileExt(toFormat)
    const pythonScript = 'image_converter.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${pathLikeToString(srcFilePath)}" "${pathLikeToString(dest)}" --width ${opts.width.toString()} --height ${opts.height.toString()} --interpolation ${opts.interpolation.toUpperCase()} --quality ${opts.quality.toString()}`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    return new ImageFile(destFilePath)
  }

  /**
   * Processes an image buffer.
   * - - - -
   * @param {Buffer | FilePathLikeTypes} imgPathOrBuffer The path or buffer of an image file.
   * @param {ImageFormatTypes} toFormat The format of the new converted image.
   * @param {ImageConvertingOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the image processing and converting.
   * @returns {Promise<Buffer>}
   */
  static async imageBufferProcessor(imgPathOrBuffer: Buffer | FilePathLikeTypes, toFormat: ImageFormatTypes, options?: ImageConvertingOptions): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const opts = useDefaultOptions(
        {
          width: 256,
          height: 256,
          interpolation: 'lanczos',
          quality: 100,
        },
        options
      )

      const pythonScript = 'image_buffer_processor.py'
      const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
      const process = spawn('python', [pythonScript], { windowsHide: true, cwd })
      const imgBase64 = Buffer.isBuffer(imgPathOrBuffer) ? imgPathOrBuffer.toString('base64') : pathLikeToFilePath(imgPathOrBuffer).readSync().toString('base64')

      let stdout = ''
      let stderr = ''

      process.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })
      process.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      process.on('close', (code) => {
        if (code === 0) {
          resolve(Buffer.from(stdout, 'base64'))
        } else if (code === null) {
          reject(new Error(`${PythonAPI.getPythonExecName()} script exited with unknown code: ${stderr}`))
        } else {
          reject(new Error(`${PythonAPI.getPythonExecName()} script exited with code ${code.toString()}: ${stderr}`))
        }
      })

      process.stdin.write(JSON.stringify({ imgBase64, format: toFormat.toUpperCase(), width: opts.width, height: opts.height, interpolation: opts.interpolation.toUpperCase(), quality: opts.quality, printResults: true }))
      process.stdin.end() // Close stdin to signal that the input is complete
    })
  }

  /**
   * Returns an object with stats of an image file buffer.
   * - - - -
   * @param {Buffer} imgBuffer The buffer to an image file.
   * @returns {Promise<ImageFileStatPythonObject>}
   */
  static async imageBufferStat(imgBuffer: Buffer): Promise<ImageFileStatPythonObject> {
    return new Promise((resolve, reject) => {
      const pythonScript = 'img_buffer_stat.py'
      const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
      const process = spawn('python', [pythonScript], { cwd, windowsHide: true })
      const imgBase64 = imgBuffer.toString('base64')

      let stdout = ''
      let stderr = ''

      process.stderr.on('data', (data: Buffer) => {
        stderr += data.toString()
      })
      process.stdout.on('data', (data: Buffer) => {
        stdout += data.toString()
      })

      process.on('close', (code) => {
        if (code === 0) {
          resolve(JSON.parse(stdout) as ImageFileStatPythonObject)
        } else if (code === null) {
          reject(new Error(`${PythonAPI.getPythonExecName()} script exited with unknown code: ${stderr}`))
        } else {
          reject(new Error(`${PythonAPI.getPythonExecName()} script exited with code ${code.toString()}: ${stderr}`))
        }
      })

      process.stdin.write(JSON.stringify({ imgBase64, printResults: true }))
      process.stdin.end() // Close stdin to signal that the input is complete
    })
  }

  /**
   * Converts a PNG_WII file Buffer to a WEBP Base64-encoded string.
   * - - - -
   * @param {FilePathLikeTypes} texWiiPath The path to the `.png_wii` file.
   * @param {TPLHeaderParserObject} texHeader The header of the PNG_WII file.
   * @returns {Promise<string>}
   */
  static async texWiiToBase64Buffer(texWiiPath: FilePathLikeTypes, texHeader: TPLHeaderParserObject): Promise<string> {
    const tex = pathLikeToFilePath(texWiiPath)
    const base64Header = texHeader.data.toString('base64')
    const pythonScript = 'texwii_to_base64_buffer.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${tex.path}" -tpl "${base64Header}" -p`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    const [dataURL] = stdout.split('\r\n')
    return dataURL
  }

  // #region Audio/MOGG

  /**
   * Returns an object with stats of an audio file.
   * - - - -
   * @param {FilePathLikeTypes} audioFilePath The path to the audio file.
   * @returns {Promise<AudioFileStatPythonObject>}
   */
  static async audioFileStat(audioFilePath: FilePathLikeTypes): Promise<AudioFileStatPythonObject> {
    const pythonScript = 'audio_file_stat.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${pathLikeToString(audioFilePath)}" -p`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    const returnValue = JSON.parse(stdout) as AudioFileStatPythonObject
    return returnValue
  }

  /**
   * Creates Harmonix's MOGG file from a bunch of audio files and returns an instantiated `MOGGFile` class pointing to the new MOGG file.
   * - - - -
   * @param {FilePathLikeTypes[]} tracks An array with audio file paths to be inserted into the MOGG file.
   * @param {FilePathLikeTypes} destPath The destination path of the new MOGG file.
   * @param {boolean} [encrypt] `OPTIONAL` Encrypts the MOGG file using `0B` encryption. The encryption works on all systems. Default is `false`.
   * @returns {Promise<MOGGFile>}
   */
  static async moggCreator(tracks: FilePathLikeTypes[], destPath: FilePathLikeTypes, encrypt: boolean = false): Promise<MOGGFile> {
    const pythonScript = 'mogg_creator.py'

    let audioFilesInput = ''
    for (const track of tracks) {
      audioFilesInput += `"${pathLikeToString(track)}" `
    }
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" ${audioFilesInput}${encrypt ? '-e' : ''}-d "${pathLikeToString(destPath)}"`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    return new MOGGFile(destPath)
  }

  /**
   * Returns an object with stats of a MOGG file.
   * - - - -
   * @param {FilePathLikeTypes} moggFilePath The path to the MOGG file.
   * @returns {Promise<MOGGFileStatPythonObject>}
   */
  static async moggFileStat(moggFilePath: FilePathLikeTypes): Promise<MOGGFileStatPythonObject> {
    const pythonScript = 'mogg_file_stat.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${pathLikeToString(moggFilePath)}" -p`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    // if (isDev()) console.log(`RBTools Python script: ${pythonScript}\n----------------------------------\n`, stdout.trim(), '\n\nEND OF PROGRAM\n----------------------------------')
    if (stderr) throw new Error(stderr)
    const returnValue = JSON.parse(
      stdout
        .split('\n')
        .filter((line) => line.startsWith('{'))
        .map((line) => line.trim())
        .join('')
    ) as MOGGFileStatPythonObject
    return returnValue
  }

  /**
   * Decrypts a MOGG file and returns an instantiated `MOGGFile` class pointing to the new decrypted MOGG file.
   * - - - -
   * @param {FilePathLikeTypes} encMoggPath The path of the encrypted MOGG file.
   * @param {FilePathLikeTypes} decMoggPath The path to the decrypted MOGG file.
   * @returns {Promise<MOGGFile>}
   */
  static async decryptMOGG(encMoggPath: FilePathLikeTypes, decMoggPath: FilePathLikeTypes): Promise<MOGGFile> {
    const enc = pathLikeToFilePath(encMoggPath)
    const dec = pathLikeToFilePath(decMoggPath)
    const pythonScript = 'decrypt_mogg.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${enc.path}" "${dec.path}"`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    return new MOGGFile(dec)
  }

  /**
   * Extracts all tracks from a MOGG file following the audio track structure defined by a Rock Band 3 songdata.
   *
   * Providing a directory path and the parsed song data from the song where the MOGG file belongs, the function will extract
   * the instruments stems from it, saving all files in the provided destination folder path
   * - - - -
   * @param {FilePathLikeTypes} moggPath The MOGG file path where the tracks will be extracted.
   * @param {RB3CompatibleDTAFile} songdata The parsed song data of the song where the MOGG belongs.
   * @param {DirPathLikeTypes} destFolderPath The destination folder path where the tracks audio files will be created.
   * @returns {Promise<DirPath>}
   */
  static async moggTrackExtractor(moggPath: FilePathLikeTypes, songdata: RB3CompatibleDTAFile, destFolderPath: DirPathLikeTypes): Promise<DirPath> {
    const mogg = pathLikeToFilePath(moggPath)
    const dest = pathLikeToDirPath(destFolderPath)
    const tracksStr = JSON.stringify(genAudioFileStructure(songdata))
    const tracks = Buffer.from(tracksStr).toString('base64')
    const pythonScript = 'mogg_track_extractor.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${mogg.path}" -t "${tracks}" -o "${dest.path}"`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    return dest
  }

  /**
   * Creates a preview audio from a MOGG file following the audio track structure defined by a Rock Band 3 songdata.
   * - - - -
   * @param {FilePathLikeTypes} moggPath The MOGG file path where the preview will be extracted.
   * @param {RB3CompatibleDTAFile} songdata The parsed song data of the song where the MOGG belongs.
   * @param {FilePathLikeTypes} destPath The destination path where the preview audio will be created.
   * @param {PreviewAudioFormatTypes} [format] `OPTIONAL` The audio format of the preview. Default is `'wav'`.
   * @param {boolean} [mixCrowd] `OPTIONAL` If true, the crowd track will be mixed into the preview audio.
   * @returns {Promise<FilePath>}
   */
  static async moggPreviewCreator(moggPath: FilePathLikeTypes, songdata: RB3CompatibleDTAFile, destPath: FilePathLikeTypes, format: PreviewAudioFormatTypes = 'wav', mixCrowd: boolean = false): Promise<FilePath> {
    const mogg = pathLikeToFilePath(moggPath)
    const dest = pathLikeToFilePath(destPath).changeFileExt(`.${format}`)

    const tracks = Buffer.from(JSON.stringify(genAudioFileStructure(songdata))).toString('base64')

    const pythonScript = 'mogg_preview_creator.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${mogg.path}" -t "${tracks}" -ps ${songdata.preview[0].toString()} -o "${dest.path}" -f "${format}"${mixCrowd ? ' -c' : ''}`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    return dest
  }

  // #region MIDI

  /**
   * Returns an object with stats of a MIDI file.
   * - - - -
   * @param {FilePathLikeTypes} midiFilePath The path to the MOGG file.
   * @returns {Promise<MIDIFileStatPythonObject>}
   */
  static async midiFileStat(midiFilePath: FilePathLikeTypes): Promise<MIDIFileStatPythonObject> {
    const pythonScript = 'midi_file_stat.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${pathLikeToString(midiFilePath)}" -p`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    const returnValue = JSON.parse(stdout) as MIDIFileStatPythonObject
    return returnValue
  }

  // #region STFS

  /**
   * Returns an object with stats of a STFS file.
   * - - - -
   * @param {FilePathLikeTypes} stfsFilePath The path of the CON file.
   * @returns {Promise<STFSFileStatRawObject>}
   */
  static async stfsFileStat(stfsFilePath: FilePathLikeTypes): Promise<STFSFileStatRawObject> {
    const stfs = pathLikeToFilePath(stfsFilePath)
    const pythonScript = 'stfs_file_stat.py'
    const command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${stfs.path}" -p`
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    const returnValue = JSON.parse(stdout) as STFSFileStatRawObject
    return returnValue
  }

  /**
   * Extracts the CON file contents and returns the folder path where all contents were extracted.
   * - - - -
   * @param {FilePathLikeTypes} stfsFilePath The path of the CON file.
   * @param {DirPathLikeTypes} destPath The folder path where you want the files to be extracted to.
   * @param {boolean} [extractOnRoot] `OPTIONAL` Extract all files on the root rather than recreate the entire STFS file system recursively. Default is `false`.
   * @returns {Promise<DirPath>}
   */
  static async stfsExtract(stfsFilePath: FilePathLikeTypes, destPath: DirPathLikeTypes, extractOnRoot: boolean = false): Promise<DirPath> {
    const stfs = pathLikeToFilePath(stfsFilePath)
    const dest = pathLikeToDirPath(destPath)
    const pythonScript = 'stfs_extract.py'
    let command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${stfs.path}" "${dest.path}"`
    if (extractOnRoot) command += ' --extract-on-root'
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    return dest
  }

  /**
   * Extracts the CON file contents and returns the folder path where all contents were extracted.
   * - - - -
   * @param {FilePathLikeTypes} stfsFilePath The path of the CON file.
   * @param {DirPathLikeTypes} destPath The folder path where you want the files to be extracted to.
   * @param {boolean} [extractOnRoot] `OPTIONAL` Extract all files on the root rather than recreate the entire STFS file system recursively. Default is `false`.
   * @param {string[]} [songs] `OPTIONAL` An array of song names to be extracted. If not provided, all songs will be extracted normally.
   * @returns {Promise<DirPath>}
   */
  static async stfsExtractSelectedSongs(stfsFilePath: FilePathLikeTypes, destPath: DirPathLikeTypes, extractOnRoot: boolean = false, songs: string[] = []): Promise<DirPath> {
    const stfs = pathLikeToFilePath(stfsFilePath)
    const dest = pathLikeToDirPath(destPath)
    const pythonScript = songs.length === 0 ? 'stfs_extract.py' : 'stfs_extract_selected_songs.py'
    let command = `${PythonAPI.getPythonExecName()} "${pythonScript}" "${stfs.path}" "${dest.path}"`
    if (extractOnRoot) command += ' --extract-on-root'
    if (songs.length > 0) {
      command += ` --songs ${songs.map((s) => `"${s}"`).join(' ')}`
    }
    // console.log('Running command:', command)
    const cwd = is.dev ? RBTools.pyFolder.path : RBTools.pyFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr)
    return dest
  }
}
