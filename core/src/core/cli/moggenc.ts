import { command, flag, positional, string } from 'cmd-ts'
import { pathLikeToFilePath, FilePath, Hex } from 'node-lib'
import { temporaryFile } from 'tempy'
import { MOGGFile } from '../../lib/rbtools'
import { PerformanceTimerAPI } from '../api/PerformanceTimerAPI'
import { CommandLineInterfaceAPI } from '../api/CommandLineInterfaceAPI'

export const moggenc = command({
  name: 'moggenc',
  description: 'Encrypts/re-encrypts a MOGG file with 0x0B encryption (works on both Xbox 360 and PS3).',
  args: {
    srcMOGGPath: positional({ displayName: 'src_mogg_path', description: 'The MOGG file to be encrypted/re-encrypted.', type: string }),
    destMOGGPath: positional({ displayName: 'dest_mogg_path', description: 'The destination path of the new, encrypted MOGG file.', type: string }),
    verbose: flag({ long: 'verbose', short: 'v', defaultValue: () => false, description: 'Print additional information during execution.' }),
  },
  async handler({ srcMOGGPath, destMOGGPath, verbose }) {
    const timer = new PerformanceTimerAPI()
    const src = new MOGGFile(srcMOGGPath)
    const dest = pathLikeToFilePath(destMOGGPath)
    let temp: FilePath | undefined
    let encStatus: number

    if (!src.path.exists) {
      console.error(`ERROR: Provided MOGG file { ${src.path.path} } does not exists.`)
      return CommandLineInterfaceAPI.exit(1)
    }

    try {
      encStatus = await src.checkFileIntegrity()
    } catch (err) {
      console.error(`ERROR: Provided MOGG file { ${src.path.path} } is not a valid MOGG file.`)
      return CommandLineInterfaceAPI.exit(1)
    }
    if (verbose) console.log(`${src.path.fullname}\nEncryption Status: ${Hex.toHexString(encStatus).toUpperCase()}\n`)

    if (encStatus === 11) {
      console.error(`ERROR: Provided MOGG file { ${src.path.path} } is already encrypted with 0x0B encryption.`)
      return CommandLineInterfaceAPI.exit(1)
    } else if (encStatus !== 10) {
      temp = pathLikeToFilePath(temporaryFile({ extension: 'mogg' }))
      await src.decrypt(temp)
    }

    if (verbose) console.log(`Encrypting file ${src.path.fullname}...\nOutput: ${dest.path}\n`)
    await src.encrypt(dest)

    if (temp) {
      if (verbose) console.log(`Deleting temporary file ${src.path.fullname}...`)
      await temp.delete()
    }
    console.log(`Operation Completed: ${timer.end()}`)
    return CommandLineInterfaceAPI.exit()
  },
})
