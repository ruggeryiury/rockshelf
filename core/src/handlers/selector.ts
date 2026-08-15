import { dialog } from 'electron'
import { useHandler, sendMessageBox, getLocaleStringFromRenderer } from '../core.exports'
import { getOfficialSongPackageStatsFromHash, isRPCS3Devhdd0PathValid, isRPCS3ExePathValid, sortDTA } from '../lib/rbtools/lib.exports'
import { DirPath, pathLikeToFilePath } from 'node-lib'
import { RB3File, type RB3FileJSONRepresentation } from '../lib.exports'
import { type STFSFileJSONRepresentation, type PKGFileJSONRepresentation, STFSFile, PKGFile } from '../lib/rbtools'

export const selectorDevhdd0 = useHandler(async (win): Promise<string | false> => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectDevhdd0DirCancelledByUser' })
    return false
  }

  try {
    const devhdd0 = isRPCS3Devhdd0PathValid(selection.filePaths[0])
    return devhdd0.path
  } catch (err) {
    sendMessageBox(win, { type: 'error', code: 'selectDevhdd0DirInvalidFolder', messageValues: { path: selection.filePaths[0] } })
    return false
  }
})

export const selectorRPCS3Exe = useHandler(async (win, _): Promise<string | false> => {
  const rpcs3ExeFilterName = await getLocaleStringFromRenderer(win, 'rpcs3Exe')
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: rpcs3ExeFilterName, extensions: ['exe'] }] })
  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectRPCS3ExeCancelledByUser' })
    return false
  }

  try {
    const rpcs3Exe = isRPCS3ExePathValid(selection.filePaths[0])
    return rpcs3Exe.path
  } catch (err) {
    sendMessageBox(win, { type: 'error', code: 'selectRPCS3ExeInvalidExecutable', messageValues: { path: selection.filePaths[0] } })
    return false
  }
})

export const selectorDir = useHandler(async (win): Promise<string | false> => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectDirCancelledByUser' })
    return false
  }

  return DirPath.of(selection.filePaths[0]).path
})

export const selectorRB3File = useHandler(async (win): Promise<false | RB3FileJSONRepresentation> => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: await getLocaleStringFromRenderer(win, 'rb3File'), extensions: ['rb3'] }] })

  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectRB3FileCancelledByUser' })
    return false
  }

  const [rb3File] = selection.filePaths
  const rb3 = new RB3File(rb3File)

  try {
    await rb3.checkFileIntegrity()
  } catch (err) {
    sendMessageBox(win, { type: 'error', code: 'selectRB3FileInvalidFileSignature', messageValues: { path: rb3.path.path } })
    return false
  }

  return await rb3.toJSON()
})

export type SelectPackageFilesStatsTypes = { type: 'stfs'; data: STFSFileJSONRepresentation; selectedSongs: string[] } | { type: 'pkg'; data: PKGFileJSONRepresentation; selectedSongs: string[] } | { type: 'rb3'; data: RB3FileJSONRepresentation; selectedSongs: string[] }

export interface SelectPackageFilesObject {
  selectedFiles: string[]
  ignoredFiles: string[]
  duplicatedFiles: string[]
  addedSongsCount: number
  addedStarsCount: number
  stats: SelectPackageFilesStatsTypes[]
}

export const selectorPackageFiles = useHandler(async (win, _, files: SelectPackageFilesStatsTypes[]): Promise<false | SelectPackageFilesObject> => {
  const selection = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })

  if (selection.canceled) {
    sendMessageBox(win, { type: 'info', code: 'selectPackageFilesCancelledByUser' })
    return false
  }

  sendMessageBox(win, { type: 'loading', code: `selectPackageFilesProcessing${selection.filePaths.length === 1 ? '' : 'Plural'}` })

  const allStats: SelectPackageFilesStatsTypes[] = []

  const selectedFiles = [...selection.filePaths]
  const ignoredFiles: string[] = []
  const duplicatedFiles: string[] = []

  for (const pkgPath of selectedFiles) {
    const stfs = new STFSFile(pkgPath)

    try {
      await stfs.checkFileIntegrity()
      const stat = await stfs.stat()

      if (stat.dta.songs.length === 0 && stat.dta.updates.length > 0) await stat.dta.applyDXUpdatesOnSongs(true)

      const data: STFSFileJSONRepresentation = {
        path: stfs.path.toJSON(),
        ...stat,
        dta: stat.dta.songs,
        upgrades: stat.upgrades?.updates ?? undefined,
      }

      if (data.dta.length === 0) {
        ignoredFiles.push(stfs.path.path)
        continue
      }

      data.dta = sortDTA(data.dta, 'Song Title')

      allStats.push({
        type: 'stfs',
        data,
        selectedSongs: [...data.dta.map((data) => data.songname)],
      })
    } catch (err) {
      const pkg = new PKGFile(pkgPath)

      try {
        await pkg.checkFileIntegrity()
        const data = await pkg.toJSON()
        const official = getOfficialSongPackageStatsFromHash('pkg', data.contentsHash)

        if (data.dta.length === 0 || official) {
          ignoredFiles.push(stfs.path.path)
          continue
        }

        data.dta = sortDTA(data.dta, 'Song Title')

        allStats.push({
          type: 'pkg',
          data,
          selectedSongs: [...data.dta.map((data) => data.songname)],
        })
      } catch (err) {
        const rb3 = new RB3File(pkgPath)

        try {
          await rb3.checkFileIntegrity()
          const data = await rb3.toJSON()

          if (data.dta.length === 0) {
            ignoredFiles.push(rb3.path.path)
            continue
          }

          data.dta = sortDTA(data.dta, 'Song Title')
          data.description = ''
          data.thumbnail = ''

          allStats.push({
            type: 'rb3',
            data,
            selectedSongs: [...data.dta.map((data) => data.songname)],
          })
        } catch (err) {
          const path = pathLikeToFilePath(pkgPath)
          ignoredFiles.push(path.path)
          continue
        }
      }
    }
  }

  for (const file of files) {
    for (const stat of allStats) {
      if (file.data.path.path === stat.data.path.path) {
        duplicatedFiles.push(stat.data.path.path)
        continue
      }
    }
  }
  const filteredStats: SelectPackageFilesStatsTypes[] = [...allStats.filter((stat) => !duplicatedFiles.includes(stat.data.path.path))]

  let addedSongsCount = 0
  let addedStarsCount = 0
  for (const stat of filteredStats) {
    addedSongsCount += stat.data.dta.length
    addedStarsCount += stat.data.dta.length * 5
  }

  return {
    selectedFiles,
    ignoredFiles,
    duplicatedFiles,
    addedSongsCount,
    addedStarsCount,
    stats: [...files, ...filteredStats],
  }
})

export type SelectorPathToRB3FileExportTypes = 'song' | 'package'

export const selectorPathToRB3File = useHandler(async (win, _, exportType: SelectorPathToRB3FileExportTypes = 'package') => {
  const buttonLabel = await getLocaleStringFromRenderer(win, 'save')
  const rb3ExtName = await getLocaleStringFromRenderer(win, 'rb3File')
  const title = await getLocaleStringFromRenderer(win, 'exportPackage')
  const selection = await dialog.showSaveDialog({ buttonLabel, filters: [{ extensions: ['rb3'], name: rb3ExtName }], title, properties: ['showOverwriteConfirmation'] })

  if (selection.canceled) {
    if (exportType === 'package') sendMessageBox(win, { type: 'info', code: 'exportPackagePathSelectCancelledByUser' })
    else sendMessageBox(win, { type: 'info', code: 'exportSongPathSelectCancelledByUser' })
    return false
  }

  return selection.filePath
})
