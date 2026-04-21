import { execAsync, type FilePath, pathLikeToFilePath, pathLikeToString, resolve, type FilePathLikeTypes, type DirPathLikeTypes, pathLikeToDirPath, DirPath } from 'node-lib'
import { EDATFile, ImageFile, MIDIFile, MOGGFile, RBTools } from '../core.exports'
import { buildOSCommand } from '../lib.exports'
import { is } from '@electron-toolkit/utils'

/**
 * A class with APIs to use RBTools executables.
 */
export class BinaryAPI {
  /**
   * Inserts the HMX MOGG header on a multitrack OGG file. You can also encrypt the MOGG file with `0x1B` encryption, that works on both Xbox 360 and PS3 systems.
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the multitrack OGG file, without HMX header, to be converted to MOGG file.
   * @param {FilePathLikeTypes} destPath The destination path of the new MOGG file.
   * @param {boolean} [encrypt] `OPTIONAL` Encrypts the MOGG file if `true`. Default is `false`.
   * @returns {MOGGFile} A `MOGGFile` instance pointing to the new MOGG file path.
   */
  static async makeMogg(srcFile: FilePathLikeTypes, destPath: FilePathLikeTypes, encrypt: boolean = false): Promise<MOGGFile> {
    const exeName = RBTools.binFolder.gotoFile('makemogg.exe').name
    const command = buildOSCommand(`${exeName} "${pathLikeToString(srcFile)}" -${encrypt ? 'e' : ''}m "${pathLikeToString(destPath)}"`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr.trim())
    return new MOGGFile(destPath)
  }

  /**
   * Encrypts a decrypted MOGG file.
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the MOGG file to be encrypted.
   * @param {FilePathLikeTypes} destPath The destination path of the new, encrypted MOGG file.
   * @returns {MOGGFile} A `MOGGFile` instance pointing to the new MOGG file path.
   */
  static async makeMoggEncrypt(srcFile: FilePathLikeTypes, destPath: FilePathLikeTypes): Promise<MOGGFile> {
    const exeName = RBTools.binFolder.gotoFile('makemogg.exe').name
    const command = buildOSCommand(`${exeName} "${pathLikeToString(srcFile)}" -e "${pathLikeToString(destPath)}"`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr.trim())
    return new MOGGFile(destPath)
  }

  /**
   * Encrypts MIDI files using custom 16-bytes `devKLic` key hash and returns an instance of `EDATFile` pointing to the new encrypted EDAT file.
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the MIDI file to be encrypted.
   * @param {string} contentID The Content ID to the encrypted EDAT file. You can generate formatted Content IDs using static `EDATFile.genContentID()`.
   * @param {string} devKLic A 16-bytes key used to encrypt the EDAT file. You can generated DevKLic for Rock Band games using the static `EDATFile.genDevKLic()`.
   * @param {FilePathLikeTypes} [destPath] `OPTIONAL` The destination path of the encrypted EDAT file. If no argument is provided, the new EDAT file will be placed on the same directory of the source MIDI file.
   * @returns {Promise<EDATFile>}
   */
  static async edatToolEncrypt(srcFile: FilePathLikeTypes, contentID: string, devKLic: string, destPath?: FilePathLikeTypes): Promise<EDATFile> {
    const exeName = RBTools.binFolder.gotoFile('edattool.exe').name
    const midi = pathLikeToFilePath(srcFile)
    let dest: FilePath
    if (destPath) dest = pathLikeToFilePath(`${pathLikeToString(destPath)}${pathLikeToString(destPath).toLowerCase().endsWith('.edat') ? '' : '.edat'}`)
    else dest = pathLikeToFilePath(`${midi.root}/${midi.fullname}${midi.fullname.toLowerCase().endsWith('.edat') ? '' : '.edat'}`)
    const command = buildOSCommand(`${exeName} encrypt -custom:${devKLic} ${contentID.slice(0, 36).replaceAll('\x00', '')} 03 02 00 "${midi.path}" "${dest.path}"`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr.trim())
    if (!stdout.split('\r\n').slice(-2)[0].startsWith('COMPLETE:')) throw new Error(stdout.split('\r\n').slice(-2)[0].slice(7))

    return new EDATFile(dest)
  }

  /**
   * Decrypts EDAT files using a `devKLic` key hash and returns an instance of `MIDIFile` pointing to the decrypted MIDI file.
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the EDAT file to be decrypted.
   * @param {string} devKLicHash A 16-bytes hash used to decrypt the EDAT file.
   *
   * A DevKLic key hash is made by concating the folder name where the `.mid.edat` is installed, so the EDAT file content is only decrypted correctly using the original name of the folder.
   *
   * You can generate DevKLic hashes for Rock Band games on PS3 using the static `EDATFile.genDevKLic()` method.
   * @param {FilePathLikeTypes} [destPath] `OPTIONAL` The destination path of the decrypted MIDI file. If no argument is provided, the new MIDI file will be placed on the same directory of the source EDAT file.
   * @returns {Promise<MIDIFile>}
   */
  static async edatToolDecrypt(srcFile: FilePathLikeTypes, devKLicHash: string, destPath?: FilePathLikeTypes): Promise<MIDIFile> {
    const exeName = RBTools.binFolder.gotoFile('edattool.exe').name
    const edat = pathLikeToFilePath(srcFile)
    let dest: FilePath
    if (destPath) dest = pathLikeToFilePath(destPath).changeFileExt('mid')
    else dest = pathLikeToFilePath(resolve(edat.root, edat.name))
    const command = buildOSCommand(`${exeName} decrypt -custom:${devKLicHash} "${edat.path}" "${dest.path}"`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr, stdout } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr.trim())
    if (!stdout.split('\r\n').slice(-2)[0].startsWith('COMPLETE:')) throw new Error(stdout.split('\r\n').slice(-2)[0].slice(7))

    return new MIDIFile(dest)
  }
  /**
   * Executes the Wiimms Image Tool encoder, that converts PNG files into Wii's TPL (Texture Palette Library) image format.
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the PNG image file to be converted.
   * @param {FilePathLikeTypes} destPath The path to the new converted TPL image file.
   * @returns {Promise<FilePath>}
   */
  static async wimgtEnc(srcFile: FilePathLikeTypes, destPath: FilePathLikeTypes): Promise<FilePath> {
    const exeName = RBTools.binFolder.gotoFile('wimgt.exe').name
    const src = pathLikeToFilePath(srcFile)
    const dest = pathLikeToFilePath(destPath)
    const command = buildOSCommand(`${exeName} -d "${dest.path}" ENC -x TPL.CMPR "${src.path}"`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) {
      if (stderr.includes("find_fast_cwd: WARNING: Couldn't compute FAST_CWD pointer")) return pathLikeToFilePath(dest)
      else throw new Error(stderr.trim())
    }
    return pathLikeToFilePath(dest)
  }

  /**
   * Executes the Wiimms Image Tool decoder, that converts Wii's TPL (Texture Palette Library) image format into PNG image format.
   * - - - -
   * @param {FilePathLikeTypes} srcTPLFile The path to the TPL file to be converted.
   * @param {FilePathLikeTypes} destImgFile The path to the new converted PNG file.
   * @returns {Promise<ImageFile>}
   */
  static async wimgtDec(srcFile: FilePathLikeTypes, destPath: FilePathLikeTypes): Promise<ImageFile> {
    const exeName = RBTools.binFolder.gotoFile('wimgt.exe').name
    const tpl = pathLikeToFilePath(srcFile)
    const dest = pathLikeToFilePath(destPath)
    const command = buildOSCommand(`${exeName} -d "${dest.path}" DEC -x TPL.CMPR "${tpl.path}"`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) {
      if (stderr.includes("find_fast_cwd: WARNING: Couldn't compute FAST_CWD pointer")) return new ImageFile(dest)
      else throw new Error(stderr.trim())
    }
    return new ImageFile(dest)
  }

  /**
   * Executes the NVIDIA Texture Tools.
   *
   * _NVIDIA Texture Tools converts TGA image files to DDS image files._
   * - - - -
   * @param {FilePathLikeTypes} srcFile The path to the TGA image file to be converted.
   * @param {FilePathLikeTypes} destPath The path to the new DDS image file.
   * @returns {Promise<FilePath>}
   */
  static async nvCompress(srcFile: FilePathLikeTypes, destPath: FilePathLikeTypes): Promise<FilePath> {
    const exeName = RBTools.binFolder.gotoFile('nvcompress.exe').name
    const src = pathLikeToFilePath(srcFile)
    const dest = pathLikeToFilePath(destPath)

    const command = buildOSCommand(`${exeName} -nocuda -bc3 "${src.path}" "${dest.path}"`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr.trim())
    return dest
  }

  /**
   * Execute the PS3P_PKG_Ripper executable. Returns the `destFolder` argument.
   *
   * _PS3P_PKG_Ripper extracts PKG files._
   * - - - -
   * @param {FilePathLikeTypes} pkgFilePath The path to the PKG file to be extracted.
   * @param {DirPathLikeTypes} destPath The folder you want to extract the PKG file contents.
   * @param {string[]} [files] `OPTIONAL` An array with files to be extracted.
   * @returns {Promise<DirPath>}
   */
  static async ps3pPKGRipper(pkgFilePath: FilePathLikeTypes, destPath: DirPathLikeTypes, files?: string[]): Promise<DirPath> {
    const exeName = RBTools.binFolder.gotoFile('PS3P_PKG_Ripper.exe').name
    const pkgFile = pathLikeToFilePath(pkgFilePath)
    const dest = pathLikeToDirPath(destPath)

    const command = buildOSCommand(`${exeName} -o "${dest.path}" "${pkgFile.path}"${files ? files.reduce((prev, curr) => `${prev} -i "${curr}"`, '') : ''}`)
    const cwd = is.dev ? RBTools.binFolder.path : RBTools.binFolder.path.replace(/(\.asar)([\\/])/, '.asar.unpacked$2')
    const { stderr } = await execAsync(command, { windowsHide: true, cwd })
    if (stderr) throw new Error(stderr.trim())
    return dest
  }
}
