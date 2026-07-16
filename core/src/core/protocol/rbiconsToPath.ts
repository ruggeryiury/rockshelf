import type { FilePath } from 'node-lib'
import { RockshelfFileSys } from '../../core.exports'

/**
 * Resolves the path from the `rbtools://` protocol.
 * - - - -
 * @param {string} url The url you want to resolve.
 * @returns {FilePath}
 */
export const rbiconsToPath = (url: string): FilePath => {
  const root = RockshelfFileSys.coreModuleRootDir()
  const name = url.slice('rbicons://'.length)
  let filePath = root.gotoFile(`bin/icons/${name}.webp`)
  if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)
  return filePath
}
