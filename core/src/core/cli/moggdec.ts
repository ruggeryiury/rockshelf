import { command, flag, positional, string } from 'cmd-ts'
import { Hex, pathLikeToFilePath } from 'node-lib'
import { MOGGFile } from '../../lib/rbtools'
import { PerformanceTimerAPI } from '../api/PerformanceTimerAPI'
import { CLIAPI } from '../api/CLIAPI'

export const moggdec = command({
  name: 'moggdec',
  description: 'Decrypts a MOGG file.',
  args: {
    srcMOGGPath: positional({ displayName: 'src_mogg_path', description: 'The MOGG file to be decrypted', type: string }),
    destMOGGPath: positional({ displayName: 'dest_mogg_path', description: 'The destination path of the new, decrypted MOGG file', type: string }),
    verbose: flag({ long: 'verbose', short: 'v', defaultValue: () => false, description: 'Print additional information during execution.' }),
  },
  async handler({ srcMOGGPath, destMOGGPath, verbose }) {
    const timer = new PerformanceTimerAPI()
    const src = new MOGGFile(srcMOGGPath)
    const dest = pathLikeToFilePath(destMOGGPath)
    let encStatus: number

    if (!src.path.exists) {
      console.error(`ERROR: Provided MOGG file { ${src.path.path} } does not exists.`)
      return CLIAPI.exit(1)
    }

    try {
      encStatus = await src.checkFileIntegrity()
    } catch (err) {
      console.error(`ERROR: Provided MOGG file { ${src.path.path} } is not a valid MOGG file.`)
      return CLIAPI.exit(1)
    }

    if (verbose) console.log(`${src.path.fullname}\nEncryption Status: ${Hex.toHexString(encStatus).toUpperCase()}\n`)

    if (encStatus === 10) {
      console.error(`ERROR: Provided MOGG file { ${src.path.path} } is already decrypted.`)
      return CLIAPI.exit(1)
    }
    if (verbose) console.log(`Decrypting file ${src.path.fullname}...\nOutput: ${dest.path}\n`)
    await src.decrypt(dest)

    console.log(`Operation Completed: ${timer.end()}`)
    return CLIAPI.exit()
  },
})
