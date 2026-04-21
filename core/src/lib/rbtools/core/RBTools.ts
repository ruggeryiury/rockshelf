import type { DirPath } from 'node-lib'
import { thisFilePath } from '../lib.exports'

export class RBTools {
  /**
   * Gets the root directory path of the _RBTools_ module.
   *
   * Defaults to built `dist` folder unless a `RBTOOLS_USESOURCE` variable environment is set to a different path.
   * - - - -
   * @returns {DirPath}
   */
  static get moduleRoot(): DirPath {
    return thisFilePath(import.meta.url).gotoDir('../')
  }

  /**
   * Gets the root of the `bin` folder, where all non-JavaScripts files are found.
   * - - - -
   * @returns {DirPath}
   */
  static get binFolder(): DirPath {
    return this.moduleRoot.gotoDir('bin')
  }

  /**
   * Gets the root of the `header` folder, where all DDS headers from PNG_XBOX and PNG_PS3 are kept.
   * - - - -
   * @returns {DirPath}
   */
  static get dbFolder(): DirPath {
    return this.moduleRoot.gotoDir('bin/db')
  }

  /**
   * Gets the root of the `header` folder, where all DDS headers from PNG_XBOX and PNG_PS3 are kept.
   * - - - -
   * @returns {DirPath}
   */
  static get headersFolder(): DirPath {
    return this.moduleRoot.gotoDir('bin/headers')
  }

  /**
   * Gets the root of the `python` folder, where all Python scripts are found.
   * - - - -
   * @returns {DirPath}
   */
  static get pyFolder(): DirPath {
    return this.moduleRoot.gotoDir('bin/python')
  }

  /**
   * Gets the root of the `res` folder, where all non-JavaScript files are found.
   * - - - -
   * @returns {DirPath}
   */
  static get resFolder(): DirPath {
    return this.moduleRoot.gotoDir('bin/res')
  }
}
