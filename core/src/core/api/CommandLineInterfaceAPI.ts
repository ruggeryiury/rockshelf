import type { CLIOutputFormats } from '../../data'
import { dtaparser } from '../cli/dtaparser'
import { imgstat } from '../cli/imgstat'
import { moggdec } from '../cli/moggdec'
import { moggenc } from '../cli/moggenc'
import { moggmaker } from '../cli/moggmaker'
import { moggstat } from '../cli/moggstat'
import { pkgstat } from '../cli/pkgstat'
import { rb3stat } from '../cli/rb3stat'
import { stfsstat } from '../cli/stfsstat'
import { textoimg } from '../cli/textoimg'

import { run, subcommands } from 'cmd-ts'
import { stringify } from 'yaml'

/**
 * A class that wraps utility functions for the CLI application of Rockshelf.
 */
export class CommandLineInterfaceAPI {
  /**
   * Initializes the Rockshelf's CLI applcation.
   * - - - -
   * @param {string[]} argv An array containing the command-line arguments passed when the Node.js process was launched
   * @returns {Promise<void>}
   */
  static async init(argv: string[]): Promise<void> {
    await run(
      subcommands({
        name: 'Rockshelf.exe',
        cmds: {
          dtaparser,
          imgstat,
          moggdec,
          moggenc,
          moggmaker,
          moggstat,
          pkgstat,
          rb3stat,
          stfsstat,
          textoimg,
        },
      }),
      argv.slice(1)
    )
  }

  /**
   * Returns a serialized output from specific user-selected output options.
   * - - - -
   * @param {CLIOutputFormats} outputFormat The output format of the serialized content as string.
   * @param {unknown} data The object you want to serialize.
   * @returns {string}
   */
  static formatOutput(outputFormat: CLIOutputFormats, data: unknown): string {
    let val: string
    switch (outputFormat) {
      case 'json':
        val = JSON.stringify(data)
        break
      case 'json-pretty':
        val = JSON.stringify(data, null, 4)
        break
      case 'yaml':
        val = stringify(data)
        break
    }
    return val
  }

  /**
   * Synchronously terminates the CLI process.
   * - - - -
   * @param {number | string} code The exit code. For string type, only integer strings (e.g.,'1') are allowed.
   * @returns {never}
   */
  static exit(code: number | string = 0): never {
    process.exit(code)
  }
}
