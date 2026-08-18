import { command, oneOf, option, positional, string } from 'cmd-ts'
import { ImageFile } from '../../lib/rbtools'
import { CLIAPI } from '../api/CLIAPI'
import { cliOutputFormats, type CLIOutputFormats } from '../../init'

export const imgstat = command({
  name: 'imgstat',
  description: 'Displays statistics of an image file.',
  args: {
    imgPath: positional({ displayName: 'img_path', description: 'The image file to be read.', type: string }),
    outputFormat: option({ short: 'o', long: 'output-format', description: 'The output format.', type: oneOf<CLIOutputFormats>(cliOutputFormats), defaultValue: (): CLIOutputFormats => 'json' }),
  },
  async handler({ imgPath, outputFormat }) {
    const img = new ImageFile(imgPath)

    if (!img.path.exists) {
      console.error(`ERROR: Provided image file { ${img.path.path} } does not exists.`)
      return CLIAPI.exit(1)
    }

    const stat = await img.toJSON()

    console.log(CLIAPI.formatOutput(outputFormat, stat))
    return CLIAPI.exit()
  },
})
