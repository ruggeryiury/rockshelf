import { command, oneOf, option, positional, string } from 'cmd-ts'
import { RB3File } from '../../lib.exports'
import { CLIAPI } from '../api/CLIAPI'
import { type CLIOutputFormats, cliOutputFormats } from '../../init'

export const rb3stat = command({
  name: 'rb3stat',
  description: 'Displays statistics of a Rock Band 3 Song Package file.',
  args: {
    rb3Path: positional({ displayName: 'rb3_path', description: 'The Rock Band 3 Song Package file to be read.', type: string }),
    outputFormat: option({ short: 'o', long: 'output-format', description: 'The output format.', type: oneOf<CLIOutputFormats>(cliOutputFormats), defaultValue: (): CLIOutputFormats => 'json' }),
  },
  async handler({ rb3Path, outputFormat }) {
    CLIAPI.clearLine()
    try {
      const rb3 = new RB3File(rb3Path)

      if (!rb3.path.exists) {
        console.error(`ERROR: Provided Rock Band 3 Song Package file { ${rb3.path.path} } does not exists.`)
        return CLIAPI.exit(1)
      }

      try {
        await rb3.checkFileIntegrity()
      } catch (err) {
        console.error(`ERROR: Provided Rock Band 3 Song Package file { ${rb3.path.path} } is not a valid Rock Band 3 Song Package file.`)
        return CLIAPI.exit(1)
      }

      const stat = await rb3.toJSON()

      const out = CLIAPI.formatOutput(outputFormat, stat)
      console.log(out)
      return CLIAPI.exit()
    } catch (err) {
      if (err instanceof Error) console.error(CLIAPI.style.red(err.message))
      else throw err
      CLIAPI.exit(1)
    }
  },
})
