import { FilePath, pathLikeToFilePath, type FilePathLikeTypes } from 'node-lib'

export class TempFilesDisposerAPI {
  temps: FilePath[]
  constructor() {
    this.temps = []
  }

  addTempFile(file: FilePathLikeTypes): void {
    this.temps.push(pathLikeToFilePath(file))
  }

  cleanTempFilesSync(): void {
    for (const temp of this.temps) {
      if (temp.exists) {
        console.log(`Disposing temporary file: { ${temp.path} }`)
      }
    }
    this.temps = []
  }
}
