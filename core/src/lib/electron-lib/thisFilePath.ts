import { FilePath } from 'node-lib'
import { fileURLToPath } from 'node:url'

/**
 * Returns the path of the script in execution.
 * - - - -
 * @param {string} url The path of this script in execution.
 * @returns {FilePath}
 */
export const thisFilePath = (url: string): FilePath => FilePath.of(decodeURIComponent(fileURLToPath(url)))
