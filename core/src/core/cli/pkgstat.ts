import { command, oneOf, option, positional, string } from 'cmd-ts'
import { CLIAPI } from '../api/CLIAPI'
import { PKGFile } from '../../lib/rbtools'
import { type CLIOutputFormats, cliOutputFormats } from '../../init'

export const pkgstat = command({
  name: 'pkgstat',
  description: 'Displays statistics of a PS3 PKG file.',
  args: {
    pkgPath: positional({ displayName: 'pkg_path', description: 'The PKG file to be read.', type: string }),
    outputFormat: option({ short: 'o', long: 'output-format', description: 'The output format.', type: oneOf<CLIOutputFormats>(cliOutputFormats), defaultValue: (): CLIOutputFormats => 'json' }),
  },
  async handler({ pkgPath, outputFormat }) {
    const pkg = new PKGFile(pkgPath)

    if (!pkg.path.exists) {
      console.error(`ERROR: Provided PKG file { ${pkg.path.path} } does not exists.`)
      return CLIAPI.exit(1)
    }
    try {
      await pkg.checkFileIntegrity()
    } catch (err) {
      console.error(`ERROR: Provided PKG file { ${pkg.path.path} } is not a valid PKG file.`)
      return CLIAPI.exit(1)
    }

    const stat = await pkg.toJSON()

    const out = CLIAPI.formatOutput(outputFormat, stat)
    console.log(out)
    return CLIAPI.exit()
  },
})
