import { command, oneOf, option, positional, string } from 'cmd-ts'
import { STFSFile } from '../../lib/rbtools'
import { CLIAPI } from '../api/CLIAPI'
import { type CLIOutputFormats, cliOutputFormats } from '../../init'

export const stfsstat = command({
  name: 'stfsstat',
  aliases: ['constat'],
  description: 'Displays statistics of a Xbox 360 CON file.',
  args: {
    stfsPath: positional({ displayName: 'stfs_path', description: 'The Xbox 360 CON file to be read.', type: string }),
    outputFormat: option({ short: 'o', long: 'output-format', description: 'The output format.', type: oneOf<CLIOutputFormats>(cliOutputFormats), defaultValue: (): CLIOutputFormats => 'json' }),
  },
  async handler({ stfsPath, outputFormat }) {
    const stfs = new STFSFile(stfsPath)

    if (!stfs.path.exists) {
      console.error(`ERROR: Provided CON file { ${stfs.path.path} } does not exists.`)
      return CLIAPI.exit(1)
    }

    try {
      await stfs.checkFileIntegrity()
    } catch (err) {
      console.error(`ERROR: Provided CON file { ${stfs.path.path} } is not a valid Xbox 360 CON file.`)
      return CLIAPI.exit(1)
    }

    const stat = await stfs.toJSON()

    const out = CLIAPI.formatOutput(outputFormat, stat)
    console.log(out)
    return CLIAPI.exit()
  },
})
