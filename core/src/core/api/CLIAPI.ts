import type { CLIOutputFormats } from '../../init'
import { imgstat } from '../cli/imgstat'
import { moggdec } from '../cli/moggdec'
import { moggenc } from '../cli/moggenc'
import { moggmaker } from '../cli/moggmaker'
import { moggstat } from '../cli/moggstat'
import { pkgstat } from '../cli/pkgstat'
import { rb3stat } from '../cli/rb3stat'
import { stfsstat } from '../cli/stfsstat'
import { textoimg } from '../cli/textoimg'

import readline from 'node:readline'
import { run, subcommands } from 'cmd-ts'
import { stringify as yamlStringify } from 'yaml'
import chalk from 'chalk'

/**
 * A class that wraps utility functions for the CLI application of Rockshelf.
 */
export class CLIAPI {
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
   * @param {Record<string, any>} data The object you want to serialize.
   * @returns {string}
   */
  static formatOutput(outputFormat: CLIOutputFormats, data: Record<string, any>): string {
    let val: string
    switch (outputFormat) {
      case 'json':
      default:
        val = JSON.stringify(data)
        break
      case 'json-pretty':
        val = JSON.stringify(data, null, 4)
        break
      case 'yaml':
        val = yamlStringify(data)
        break
    }
    return val
  }

  static clearLine(): void {
    readline.clearLine(process.stdout, 0)
    // Move cursor back to the beginning of the line
    readline.cursorTo(process.stdout, 0)
  }

  /**
   * Synchronously terminates the process.
   * - - - -
   * @param {number | string} code The exit code. For string type, only integer strings (e.g.,'1') are allowed.
   * @returns {never}
   */
  static exit(code: number | string = 0): never {
    return process.exit(code)
  }

  static readonly style = {
    italic: (text: string): string => chalk.italic(text),
    red: (text: string): string => chalk.redBright(text),
  }
}
