import { FilePath, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'

/**
 * An API that gathers temporary files to be deleted.
 */
export class TempFilesDisposerAPI {
  /** An array with paths to files stored on the user's temporary folder. */
  temps: FilePath[]
  constructor() {
    this.temps = []
  }

  /**
   * Adds a temporary file to the disposal API.
   * - - - -
   * @param {FilePathLikeTypes} file The path to the temporary file.
   * @returns {void}
   */
  addTempFile(file: FilePathLikeTypes): void {
    this.temps.push(pathLikeToFilePath(file))
  }

  /**
   *
   * @returns {void}
   */
  cleanTempFilesSync(): void {
    for (const temp of this.temps) {
      if (temp.exists) {
        console.log(`Disposing temporary file: { ${temp.path} }`)
        temp.deleteSync()
      }
    }
    this.temps = []
  }
}
