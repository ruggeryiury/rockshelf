import { pathLikeToDirPath, type DirPathLikeTypes } from 'node-lib'

export interface SongFilesSizeObject {
  moggFilePath: string
  mogg: number
  midiFilePath: string
  midi: number
  artworkFilePath: string
  artwork: number
  miloFilePath: string
  milo: number
  panFilePath: string
  pan: number
  usrFilePath: string
  usr: number
  vnnFilePath: string
  vnn: number
  vocFilePath: string
  voc: number
  xvocabFilePath: string
  xvocab: number
  weightsFilePath: string
  weights: number
  totalSize: number
  totalFiles: number
}

export const calculateSongFilesSizeFromSongname = async (packageDirPath: DirPathLikeTypes, songname: string): Promise<SongFilesSizeObject> => {
  const packagePath = pathLikeToDirPath(packageDirPath)
  const songPath = packagePath.gotoDir(`songs/${songname}`)

  if (!songPath.exists) throw new Error(`No song files found for song with internal name "${songname}" inside the song package "${packagePath.name}".`)

  let totalSize = 0
  let totalFiles = 0

  const moggFilePath = songPath.gotoFile(`${songname}.mogg`)
  let mogg = 0
  if (moggFilePath.exists) {
    totalFiles++
    const moggStat = await moggFilePath.stat()
    mogg = moggStat.size
    totalSize += moggStat.size
  }

  const midiFilePath = songPath.gotoFile(`${songname}.mid.edat`)
  let midi = 0
  if (midiFilePath.exists) {
    totalFiles++
    const midiStat = await midiFilePath.stat()
    midi = midiStat.size
    totalSize += midiStat.size
  }

  const artworkFilePath = songPath.gotoFile(`gen/${songname}_keep.png_ps3`)
  let artwork = 0
  if (artworkFilePath.exists) {
    totalFiles++
    const artworkStat = await artworkFilePath.stat()
    artwork = artworkStat.size
    totalSize += artworkStat.size
  }

  const miloFilePath = songPath.gotoFile(`gen/${songname}.milo_ps3`)
  let milo = 0
  if (miloFilePath.exists) {
    totalFiles++
    const miloStat = await miloFilePath.stat()
    milo = miloStat.size
    totalSize += miloStat.size
  }

  const panFilePath = songPath.gotoFile(`${songname}.pan`)
  let pan = 0
  if (panFilePath.exists) {
    totalFiles++
    const panStat = await panFilePath.stat()
    pan = panStat.size
    totalSize += panStat.size
  }

  const usrFilePath = songPath.gotoFile(`${songname}.usr`)
  let usr = 0
  if (usrFilePath.exists) {
    totalFiles++
    const usrStat = await usrFilePath.stat()
    usr = usrStat.size
    totalSize += usrStat.size
  }

  const vnnFilePath = songPath.gotoFile(`${songname}.vnn`)
  let vnn = 0
  if (vnnFilePath.exists) {
    totalFiles++
    const vnnStat = await vnnFilePath.stat()
    vnn = vnnStat.size
    totalSize += vnnStat.size
  }

  const vocFilePath = songPath.gotoFile(`${songname}.voc`)
  let voc = 0
  if (vocFilePath.exists) {
    totalFiles++
    const vocStat = await vocFilePath.stat()
    voc = vocStat.size
    totalSize += vocStat.size
  }

  const xvocabFilePath = songPath.gotoFile(`${songname}.xvocab`)
  let xvocab = 0
  if (xvocabFilePath.exists) {
    totalFiles++
    const xvocabStat = await xvocabFilePath.stat()
    xvocab = xvocabStat.size
    totalSize += xvocabStat.size
  }

  const weightsFilePath = songPath.gotoFile(`gen/${songname}_weights.bin`)
  let weights = 0
  if (weightsFilePath.exists) {
    totalFiles++
    const weightsStat = await weightsFilePath.stat()
    weights = weightsStat.size
    totalSize += weightsStat.size
  }

  return {
    moggFilePath: moggFilePath.path,
    mogg,
    midiFilePath: midiFilePath.path,
    midi,
    artworkFilePath: artworkFilePath.path,
    artwork,
    miloFilePath: miloFilePath.path,
    milo,
    panFilePath: panFilePath.path,
    pan,
    usrFilePath: usrFilePath.path,
    usr,
    vnnFilePath: vnnFilePath.path,
    vnn,
    vocFilePath: vocFilePath.path,
    voc,
    xvocabFilePath: xvocabFilePath.path,
    xvocab,
    weightsFilePath: weightsFilePath.path,
    weights,
    totalSize,
    totalFiles,
  }
}
