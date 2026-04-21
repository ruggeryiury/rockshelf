import { execAsync, FilePath, pathLikeToDirPath, pathLikeToFilePath, type DirPathLikeTypes, type FilePathLikeTypes } from 'node-lib'

export type OnyxCLIOperators = 'import' | 'build' | 'web-player' | 'reaper' | 'pro-keys-hanging' | 'stfs' | 'mogg' | 'encrypt-mogg-rb1' | 'u8' | 'milo' | 'encrypt-gh-fsb' | 'fsb' | 'pak' | 'pkg' | 'edat' | 'port-gh-ps3' | 'extract' | 'unwrap' | 'midi-text' | 'midi-merge' | 'bin-to-dta' | 'dta-to-bin' | 'fix-mogg'
export type STFSGameTypes = 'rb3' | 'rb2' | 'gh2'

/**
 * Use Onyx CLI features as an API.
 */
export class OnyxCLI {
  /**
   * The path to the Onyx CLI executable.
   */
  readonly path: FilePath

  /**
   * Use Onyx CLI features as an API.
   * - - - -
   * @param {FilePathLikeTypes} onyxCLIExePath The path to the Onyx CLI executable.
   */
  constructor(onyxCLIExePath: FilePathLikeTypes) {
    this.path = pathLikeToFilePath(onyxCLIExePath)
  }

  /**
   * Checks the integrity of the Onyx CLI extracted folder path.
   * - - - -
   * @returns {void}
   * @throws {Error} When the main Onyx CLI executable does not exists.
   */
  checkIntegrity(): void {
    if (!this.path.exists) throw new Error(`No Onyx CLI executable found on provided path "${this.path.path}".`)
    for (const file of ['avcodec-60.dll', 'avfilter-9.dll', 'avformat-60.dll', 'avutil-58.dll', 'libfftw3-3.dll', 'libFLAC.dll', 'libgcc_s_seh-1.dll', 'libmp3lame-0.dll', 'libmpg123-0.dll', 'libogg-0.dll', 'libopus-0.dll', 'librubberband-2.dll', 'libsamplerate-0.dll', 'libsndfile-1.dll', 'libstdc++-6.dll', 'libvorbis-0.dll', 'libvorbisenc-2.dll', 'libvorbisfile-3.dll', 'libwinpthread-1.dll', 'swresample-4.dll', 'swscale-7.dll', 'zlib1.dll']) {
      if (!this.path.gotoFile(file).exists) throw new Error(`Missing DLL file "${file}" on Onyx CLI folder.`)
    }
  }

  /**
   * The structure of the Onyx repack method for creating STFS files.
   */
  static readonly repackSTFSRB3Object = {
    'base-version': 0,
    licenses: [
      { bits: 1, flags: 0, id: -1 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
      { bits: 0, flags: 0, id: 0 },
    ],
    'media-id': 0,
    'package-description': ['Package Description', '', '', '', '', '', '', '', ''],
    'package-name': ['Package Name', '', '', '', '', '', '', '', ''],
    'sign-live': false,
    'title-id': 1161890068,
    'title-name': 'Rock Band 3',
    'transfer-flags': 192,
    version: 0,
  }

  /**
   * Displays the help command on Onyx CLI.
   * - - - -
   * @param {OnyxCLIOperators} command `OPTIONAL` Displays general helping if no argument is provided.
   * @returns {string} The help text.
   */
  async help(command?: OnyxCLIOperators): Promise<string> {
    this.checkIntegrity()
    const cmd = `"${this.path.path}"${command ? ` ${command}` : ''} --help`
    const { stderr, stdout } = await execAsync(cmd, { windowsHide: true })
    if (stderr) throw new Error(stderr)
    return stdout
  }

  /**
   * Compile a folder's contents into an Xbox 360 STFS file (CON file).
   * - - - -
   * @param {DirPathLikeTypes} srcFolder The path to the folder with contents to the CON file.
   * @param {FilePathLikeTypes} destFile The path to the new CON file.
   * @param {STFSGameTypes} game `OPTIONAL`. Change the game that the CON file will be created for. Default is `'rb3'`.
   * @returns {Promise<string>} The printable text from the child process.
   */
  async stfs(srcFolder: DirPathLikeTypes, destFile: FilePathLikeTypes, game: STFSGameTypes = 'rb3'): Promise<string> {
    const src = pathLikeToDirPath(srcFolder)
    const dest = pathLikeToFilePath(destFile).changeFileExt('')
    const cmd = `"${this.path.path}" stfs "${src.path}" --to ${dest.path} --game ${game}`
    const { stderr, stdout } = await execAsync(cmd, { windowsHide: true })
    if (stderr) throw new Error(stderr)
    return stdout
  }

  /**
   * Compile a folder's contents into a PS3 `.pkg` file.
   * - - - -
   * @param {DirPathLikeTypes} srcFolder The path to the folder with contents to the `.pkg` file.
   * @param {FilePathLikeTypes} destFile The path to the new `.pkg` file.
   * @param {string} contentID The content ID. Must be 36 characters long. Ex.: `UP0006-BLUS30050_00-RBSTILLALCCF005D`
   * @returns {Promise<string>} The printable text from the child process.
   */
  async pkg(srcFolder: DirPathLikeTypes, destFile: FilePathLikeTypes, contentID: string): Promise<string> {
    const src = pathLikeToDirPath(srcFolder)
    const dest = pathLikeToFilePath(destFile).changeFileExt('pkg')
    const cmd = `"${this.path.path}" pkg ${contentID} "${src.path}" --to ${dest.path}`
    const { stderr, stdout } = await execAsync(cmd, { windowsHide: true })
    if (stderr) throw new Error(stderr)
    return stdout
  }

  /**
   * Encrypt a file into a PS3 `.edat` file.
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the file to be encrypted.
   * @param {FilePathLikeTypes} destFile The path to the new `.edat` file.
   * @param {string} contentID The content ID. Must be 36 characters long. Ex.: `UP0002-BLUS30487_00-MYPACKAGELABEL`
   * @param {string} devKLic A 16-byte HEX string (32 chars). Ex.: `d7f3f90a1f012d844ca557e08ee42391`
   * @returns {Promise<string>} The printable text from the child process.
   */
  async edat(srcFile: FilePathLikeTypes, destFile: FilePathLikeTypes, contentID: string, devKLic: string): Promise<string> {
    const src = pathLikeToFilePath(srcFile)
    const dest = pathLikeToFilePath(destFile).changeFileExt('edat')
    const cmd = `"${this.path.path}" edat ${contentID} ${devKLic} "${src.path}" --to ${dest.path}`
    const { stderr, stdout } = await execAsync(cmd, { windowsHide: true })
    if (stderr) throw new Error(stderr)
    return stdout
  }

  /**
   * Extract various archive/container formats to a folder.
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the package file to be extracted.
   * @param {FilePathLikeTypes} destPath The path to the folder where the contents will be extracted.
   */
  async extract(srcFile: FilePathLikeTypes, destPath: DirPathLikeTypes) {
    const src = pathLikeToFilePath(srcFile)
    const dest = pathLikeToDirPath(destPath)
    const cmd = `"${this.path.path}" extract "${src.path}" --to ${dest.path}`
    const { stderr, stdout } = await execAsync(cmd, { windowsHide: true })
    if (stderr) throw new Error(stderr)
    return stdout
  }
}
