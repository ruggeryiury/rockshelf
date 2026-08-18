import { command, flag, oneOf, option, positional, string } from 'cmd-ts'
import { pathLikeToFilePath } from 'node-lib'
import { DTAParser } from '../../lib/rbtools'
import { CLIAPI } from '../api/CLIAPI'
import { cliOutputFormats, type CLIOutputFormats } from '../../init'
import { PerformanceTimerAPI } from '../api/PerformanceTimerAPI'
import { getCompleteDTAMissingValues } from '../../lib/rbtools/lib.exports'
import chalk from 'chalk'

export const dtaparser = command({
  name: 'dtaparser',
  description: 'Parses a DTA file into a JSON/YAML file.',
  args: {
    dtaFile: positional({ displayName: 'dta_file', description: 'The MOGG file to be decrypted', type: string }),
    outputFormat: option({ short: 'o', long: 'output-format', description: 'The output format.', type: oneOf<CLIOutputFormats>(cliOutputFormats), defaultValue: (): CLIOutputFormats => 'json' }),
    verbose: flag({ long: 'verbose', short: 'v', defaultValue: () => false, description: 'Print additional information during execution.' }),
    applyDXUpdates: flag({ long: 'apply-dx-updates', short: 'u', defaultValue: () => false, description: 'Applies Rock Band 3 Deluxe updates on songs.' }),
  },
  async handler({ dtaFile, outputFormat, verbose, applyDXUpdates }) {
    CLIAPI.clearLine()
    const dta = pathLikeToFilePath(dtaFile)
    const dest = dta.changeFileExt(outputFormat === 'yaml' ? 'yml' : 'json')

    if (!dta.exists) {
      console.error(`Error: DTA file { ${dta.path} } does not exists`)
      return CLIAPI.exit(1)
    }
    const parser = await DTAParser.fromFile(dta)
    const oldUpdates = [...parser.updates]

    for (const upd of oldUpdates) {
      console.log(upd.id, getCompleteDTAMissingValues(upd))
    }
    const allOldSongs = parser.songs.length + parser.updates.length
    const parserStats = parser.stat()
    console.log(chalk.blue('[DTAParser]') + ` :: File ` + chalk.italic(dta.fullname) + ` parsed: ${parserStats.songsCount} song${parserStats.songsCount === 1 ? '' : 's'}, ${parserStats.updatesCount} update${parserStats.updatesCount === 1 ? '' : 's'}`)
    console.log(`Trying to parse ${allOldSongs} song${allOldSongs === 1 ? '' : 's'}...`)
    if (parser.updates.length > 0) {
      const editedSongs = await parser.applyDXUpdatesOnSongs(false)
      parser.updates = parser.updates.slice(0, allOldSongs - editedSongs.length)
      console.log(parser, parser.songs.length === allOldSongs)

      if (parser.songs.length === allOldSongs) {
        parser.updates = []
        parser.sort('ID')
        const content = JSON.stringify(parser.songs)
        await dest.write(content)
        return CLIAPI.exit()
      }

      if (parser.updates.length > 0) {
        if (parser.updates.length > oldUpdates.length) {
          parser.updates = oldUpdates
        }
        if (parser.updates.length > 0) {
          for (const update of parser.updates) {
            if (parser.updates.length > 0) {
              console.log(update.id, getCompleteDTAMissingValues(update))
            }
            return CLIAPI.exit()
          }
        } else {
          // Fix exists on rockshelf.dta
          parser.sort('ID')
          await dest.write(CLIAPI.formatOutput(outputFormat, { ...parser.songs }))
          return CLIAPI.exit()
        }
      } else {
        parser.sort('ID')
        await dest.write(CLIAPI.formatOutput(outputFormat, { ...parser.songs }))
        return CLIAPI.exit()
      }
    } else {
      parser.sort('ID')
      await dest.write(CLIAPI.formatOutput(outputFormat, { ...parser.songs }))
      return CLIAPI.exit()
    }
    // const timer = new PerformanceTimerAPI()
    // const dtaPath = pathLikeToFilePath(dtaFile)
    // const savePath = dtaPath.changeFileExt(outputFormat === 'json' || outputFormat === 'json-pretty' ? 'json' : 'yml')

    // try {
    //   if (!dtaPath.exists) {
    //     console.error(`ERROR: Provided DTA file { ${dtaPath.path} } does not exists.`)
    //     return CLIAPI.exit(1)
    //   }

    //   if (verbose) console.log(`Parsing DTA File... { ${dtaPath.path} }`)
    //   const parser = await DTAParser.fromFile(dtaPath)

    //   parser.sort('ID')

    //   if (applyDXUpdates) {
    //     if (verbose) console.log('Applying Rock Band 3 Deluxe updates on all songs...')
    //     await parser.applyDXUpdatesOnSongs()
    //   }

    //   console.log(parser)

    //   const out = CLIAPI.formatOutput(outputFormat, parser.songs)
    //   if (verbose) console.log(`Writing ${outputFormat === 'json' || outputFormat === 'json-pretty' ? 'JSON' : 'YAML'} file... { ${savePath.path} }`)
    //   await savePath.write(out)
    // } catch (err) {
    //   if (err instanceof Error) console.error(`ERROR: An error occurred while trying to parse a DTA file: ${err.message}.`)
    //   return CLIAPI.exit(1)
    // }

    // console.log(`Operation Completed: ${timer.end()}`)
  },
})
