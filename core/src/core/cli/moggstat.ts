import { command, oneOf, option, positional, string } from 'cmd-ts'
import { MOGGFile } from '../../lib/rbtools'
import { CommandLineInterfaceAPI } from '../api/CommandLineInterfaceAPI'
import { type CLIOutputFormats, cliOutputFormats } from '../../data'

export const moggstat = command({
  name: 'moggstat',
  description: 'Displays statistics of a MOGG file.',
  args: {
    moggPath: positional({ displayName: 'mogg_path', description: 'The MOGG file to be read.', type: string }),
    outputFormat: option({ short: 'o', long: 'output-format', description: 'The output format.', type: oneOf<CLIOutputFormats>(cliOutputFormats), defaultValue: (): CLIOutputFormats => 'json' }),
  },
  async handler({ moggPath, outputFormat }) {
    const mogg = new MOGGFile(moggPath)

    if (!mogg.path.exists) {
      console.error(`ERROR: Provided MOGG file { ${mogg.path.path} } does not exists.`)
      return CommandLineInterfaceAPI.exit(1)
    }
    try {
      await mogg.checkFileIntegrity()
    } catch (err) {
      console.error(`ERROR: Provided MOGG file { ${mogg.path.path} } is not a valid MOGG file.`)
      return CommandLineInterfaceAPI.exit(1)
    }

    const stat = await mogg.toJSON()

    const out = CommandLineInterfaceAPI.formatOutput(outputFormat, stat)
    console.log(out)
    return CommandLineInterfaceAPI.exit()
  },
})
