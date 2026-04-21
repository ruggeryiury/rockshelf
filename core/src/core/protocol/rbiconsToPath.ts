import type { FilePath } from 'node-lib'
import { getRockshelfModuleRootDir } from '../../core.exports'

/**
 * Resolves the path from the `rbtools://` protocol.
 * - - - -
 * @param {string} url The url you want to resolve.
 * @returns {FilePath}
 */
export const rbiconsToPath = (url: string): FilePath => {
  const root = getRockshelfModuleRootDir()
  const name = url.slice('rbicons://'.length)
  let filePath = root.gotoFile(`bin/icons/${name}.webp`)
  if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)
  return filePath
}
