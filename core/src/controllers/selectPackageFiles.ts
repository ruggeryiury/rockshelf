import { dialog } from 'electron'
import { sendMessageBox, useHandler } from '../core.exports'
import { pathLikeToFilePath } from 'node-lib'
import { type STFSFileJSONRepresentation, type PKGFileJSONRepresentation, STFSFile, PKGFile } from '../lib/rbtools'
import { getOfficialSongPackageStatsFromHash } from '../lib/rbtools/lib.exports'

export type SelectPackageFilesStatsTypes = { type: 'stfs'; data: STFSFileJSONRepresentation } | { type: 'pkg'; data: PKGFileJSONRepresentation }

export interface SelectPackageFilesObject {
  selectedFiles: string[]
  ignoredFiles: string[]
  duplicatedFiles: string[]
  addedSongsCount: number
  addedStarsCount: number
  stats: SelectPackageFilesStatsTypes[]
}

export const selectPackageFiles = useHandler(async (win, _, files: SelectPackageFilesStatsTypes[]) => {
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
      const data = await stfs.toJSON()

      if (data.dta.length === 0) {
        ignoredFiles.push(stfs.path.path)
        continue
      }

      allStats.push({
        type: 'stfs',
        data,
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

        allStats.push({
          type: 'pkg',
          data,
        })
      } catch (err) {
        const path = pathLikeToFilePath(pkgPath)
        ignoredFiles.push(path.path)
        continue
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
  } as SelectPackageFilesObject
})
