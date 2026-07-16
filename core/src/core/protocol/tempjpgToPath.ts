import type { FilePath } from 'node-lib'
import { RockshelfFileSys } from '../../core.exports'

/**
 * Resolves the path from the `tempjpg://` protocol.
 * - - - -
 * @param {string} url The url you want to resolve.
 * @returns {FilePath}
 */
export const tempjpgToPath = (url: string): FilePath => {
  const root = RockshelfFileSys.appTempDir()
  const name = url.slice('tempjpg://'.length)
  const filePath = root.gotoFile(`${name}.jpg`)
  return filePath
}
