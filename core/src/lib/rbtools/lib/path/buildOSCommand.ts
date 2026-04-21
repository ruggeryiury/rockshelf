import { platform } from 'node:os'
import { useDefaultOptions } from 'use-default-options'

export interface OSCommandBuiltOptions {
  /**
   * If `true`, the command will have `wine` appended at the beginning when being executed on Linux-based systems. Default is `true`.
   */
  useWine?: boolean
}

/**
 * Builds a command configured to specific operational systems.
 * - - - -
 * @param {string} command The command you want to process.
 * @param {OSCommandBuiltOptions} [options] An object with properties that modifies the default behavior of the building process.
 * @returns {string}
 */
export const buildOSCommand = (command: string, options?: OSCommandBuiltOptions): string => {
  const { useWine } = useDefaultOptions({ useWine: true }, options)
  let val = ''
  if (platform() === 'linux' && useWine) val += 'WINEDEBUG=-all wine '
  val += command.trim()
  return val
}
