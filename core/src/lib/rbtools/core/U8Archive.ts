import { BinaryReader, DirPath, pathLikeToDirPath, pathLikeToFilePath, type DirPathLikeTypes, FilePath, type FilePathLikeTypes } from 'node-lib'
import { parseU8ArchiveHeader } from '../lib.exports'

/**
 * `U8Archive` is a class that represents a Wii APP file.
 */
export class U8Archive {
  // #region Constructor
  /**
   * The path to the Wii APP file.
   */
  path: FilePath

  /**
   * `U8Archive` is a class that represents a Wii APP file.
   * - - - -
   * @param {FilePathLikeTypes} appFilePath The path of the U8 file.
   */
  constructor(appFilePath: FilePathLikeTypes) {
    this.path = pathLikeToFilePath(appFilePath)
    if (this.path.ext !== '.app') throw new Error(`Provided file "${this.path.path} is not a valid U8 archive file"`)
  }

  // #region Methods

  /**
   * Checks the integrity of the U8 file.
   *
   * This function checks existence of the file and the file signature.
   * - - - -
   * @returns {Promise<boolean>}
   * @throws {Error} When it identifies file signature of any unknown file format.
   */
  async checkFileIntegrity(): Promise<boolean> {
    if (!this.path.exists) throw new Error(`Provided Wii APP file path "${this.path.path}" does not exists`)
    const magic = (await this.path.readOffset(0, 4)).readUint32BE()
    if (magic === 0x55aa382d) return true
    throw new Error(`Provided Wii APP file "${this.path.path}" is not a valid Wii APP file`)
  }

  /**
   * Extracts the U8 archive into a folder.
   * - - - -
   * @param {DirPathLikeTypes} destPath The destination folder where the contents will be extracted.
   * @throws {Error} When it identifies file signature of any unknown file format.
   */
  async extract(destPath: DirPathLikeTypes): Promise<void> {
    await this.checkFileIntegrity()
    const dest = pathLikeToDirPath(destPath)
    const header = await parseU8ArchiveHeader(this.path)
    const reader = await BinaryReader.fromFile(this.path)
    const entries: { path: FilePath | DirPath; nodeType: 'file' | 'dir'; data?: Buffer }[] = [
      {
        path: dest,
        nodeType: 'dir',
      },
    ]
    let lastDir = dest
    for (let i = 0; i < header.entries.length; i++) {
      if (i === 0) continue
      const entry = header.entries[i]
      if (entry.nodeType === 'dir') {
        const parentFolderIndex = entry.fileDataOffset
        entries.push({
          path: DirPath.of(entries[parentFolderIndex].path.path, entry.name),
          nodeType: 'dir',
        })
        lastDir = entries[entries.length - 1].path as DirPath
      } else {
        reader.seek(entry.fileDataOffset)
        const data = await reader.read(entry.fileDataSize)
        entries.push({
          path: FilePath.of(lastDir.path, entry.name),
          nodeType: 'file',
          data,
        })
      }
    }
    await reader.close()

    for (const entry of entries) {
      if (entry.nodeType === 'dir') {
        if (!entry.path.exists) await (entry.path as DirPath).mkDir()
      } else {
        if (entry.data) {
          await (entry.path as FilePath).write(entry.data)
        }
      }
    }
  }
}
