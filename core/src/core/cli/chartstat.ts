import { command, oneOf, option, positional, string } from 'cmd-ts'

import { type CLIOutputFormats, cliOutputFormats } from '../../init'
import { EDATFile, ImageFile } from '../../lib/rbtools'
import { CLIAPI } from '../api/CLIAPI'

export const chartstat = command({
	name: 'chartstat',
	description: 'Displays statistics of a song chart file.',
	args: {
		midiPath: positional({ displayName: 'midi_path', description: 'The song chart file to be read. Both MIDI and decrypted EDAT files are accepted.', type: string }),
		outputFormat: option({ short: 'o', long: 'output-format', description: 'The output format.', type: oneOf<CLIOutputFormats>(cliOutputFormats), defaultValue: (): CLIOutputFormats => 'json' }),
	},
	async handler({ midiPath, outputFormat }) {
		const edat = new EDATFile(midiPath)

		if (!edat.path.exists) {
			console.error(`ERROR: Provided song chart file { ${edat.path.path} } does not exists.`)
			return CLIAPI.exit(1)
		}

		const stat = await edat.getChartStat()

		console.log(CLIAPI.formatOutput(outputFormat, stat))
		return CLIAPI.exit()
	},
})
