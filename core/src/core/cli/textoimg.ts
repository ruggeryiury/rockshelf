import { command, flag, oneOf, option, positional, string } from 'cmd-ts'
import { TextureFile, type ImageFormatTypes } from '../../lib/rbtools'
import { pathLikeToFilePath } from 'node-lib'
import { PerformanceTimerAPI } from '../api/PerformanceTimerAPI'
import { CLIAPI } from '../api/CLIAPI'

const imageFormatTypes = ['bmp', 'jpg', 'png', 'tga', 'webp'] as const

export const textoimg = command({
  name: 'textoimg',
  description: 'Converts a texture file (PNG_XBOX, PNG_PS3, PNG_WII) into an image format.',
  args: {
    srcTexPath: positional({ displayName: 'src_tex_path', description: 'The path to the texture file to be converted.', type: string }),
    destImgPath: positional({ displayName: 'dest_img_path', description: 'The destination path of the new, converted image file.', type: string }),
    format: option({ short: 'f', long: 'format', description: 'The output format of the new image.', type: oneOf<ImageFormatTypes>(imageFormatTypes), defaultValue: (): ImageFormatTypes => 'png' }),
    verbose: flag({ long: 'verbose', short: 'v', defaultValue: undefined, description: 'Print additional information during execution.' }),
  },
  async handler({ srcTexPath, destImgPath, format, verbose }) {
    const timer = new PerformanceTimerAPI()
    const src = new TextureFile(srcTexPath)
    const dest = pathLikeToFilePath(destImgPath)

    if (!src.path.exists) {
      console.error(`ERROR: Provided texture file { ${src.path.path} } does not exists.`)
      return CLIAPI.exit(1)
    }

    try {
      await src.checkFileIntegrity()
    } catch (err) {
      console.error(`ERROR: Provided texture file { ${src.path.path} } is not a valid Texture file.`)
      return CLIAPI.exit(1)
    }
    if (verbose) console.log(`Converting texture file ${src.path.fullname}...\nOutput: ${dest.path}\n`)

    await src.convertToImage(dest, format)
    console.log(`Operation Completed: ${timer.end()}`)
    return CLIAPI.exit()
  },
})
