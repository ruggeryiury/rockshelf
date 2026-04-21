import type { FilePath } from 'node-lib'
import { getRockshelfTempDir } from '../../core.exports'

/**
 * Resolves the path from the `tempjpg://` protocol.
 * - - - -
 * @param {string} url The url you want to resolve.
 * @returns {FilePath}
 */
export const tempjpgToPath = (url: string): FilePath => {
  const root = getRockshelfTempDir()
  const name = url.slice('tempjpg://'.length)
  const filePath = root.gotoFile(`${name}.jpg`)
  return filePath
}
