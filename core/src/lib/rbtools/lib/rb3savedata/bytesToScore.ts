import { MyObject } from 'node-lib'
import type { RB3InstrumentScores, RB3Scores } from '../../core.exports'
import { removeDupeID0x04 } from '../../lib.exports'

export const bytesToScore = (input: Buffer, isWiiScore: boolean): RB3Scores => {
  const score = new MyObject<RB3Scores>()
  score.set('song_id', input.readUInt32LE(0x00))
  if (!isWiiScore) {
    score.set('song_id', input.readUInt32LE(0x04))
    input = removeDupeID0x04(input)
  }
  score.setMany({
    lighterRating: input[0x06],
    playCount: input.readInt32LE(0x0b),
  })

  // Drums
  const drums = new MyObject<RB3InstrumentScores>()
  drums.setMany({
    topScore: input.readInt32LE(0x3f),
    topScoreDifficulty: input[0x43],
    starsEasy: input[0x44],
    percentEasy: input[0x45],
    starsMedium: input[0x4c],
    percentMedium: input[0x4d],
    starsHard: input[0x54],
    percentHard: input[0x55],
    starsExpert: input[0x5c],
    percentExpert: input[0x5d],
  })
  score.set('drums', drums.toJSON())

  // Bass
  const bass = new MyObject<RB3InstrumentScores>()
  bass.setMany({
    topScore: input.readInt32LE(0x64),
    topScoreDifficulty: input[0x68],
    starsEasy: input[0x69],
    percentEasy: input[0x6a],
    starsMedium: input[0x71],
    percentMedium: input[0x72],
    starsHard: input[0x79],
    percentHard: input[0x7a],
    starsExpert: input[0x81],
    percentExpert: input[0x82],
  })
  score.set('bass', bass.toJSON())

  // Guitar
  const guitar = new MyObject<RB3InstrumentScores>()
  guitar.setMany({
    topScore: input.readInt32LE(0x89),
    topScoreDifficulty: input[0x8d],
    starsEasy: input[0x8e],
    percentEasy: input[0x8f],
    starsMedium: input[0x96],
    percentMedium: input[0x97],
    starsHard: input[0x9e],
    percentHard: input[0x9f],
    starsExpert: input[0xa6],
    percentExpert: input[0xa7],
  })
  score.set('guitar', guitar.toJSON())

  // Vocals
  const vocals = new MyObject<RB3InstrumentScores>()
  vocals.setMany({
    topScore: input.readInt32LE(0xae),
    topScoreDifficulty: input[0xb2],
    starsEasy: input[0xb3],
    percentEasy: input[0xb4],
    starsMedium: input[0xbb],
    percentMedium: input[0xbc],
    starsHard: input[0xc3],
    percentHard: input[0xc4],
    starsExpert: input[0xcb],
    percentExpert: input[0xcc],
  })
  score.set('vocals', vocals.toJSON())

  // Harmonies
  const harmonies = new MyObject<RB3InstrumentScores>()
  harmonies.setMany({
    topScore: input.readInt32LE(0xd3),
    topScoreDifficulty: input[0xd7],
    starsEasy: input[0xd8],
    percentEasy: input[0xd9],
    starsMedium: input[0xe0],
    percentMedium: input[0xe1],
    starsHard: input[0xe8],
    percentHard: input[0xe9],
    starsExpert: input[0xf0],
    percentExpert: input[0xf1],
  })
  score.set('harmonies', harmonies.toJSON())

  // Keys
  const keys = new MyObject<RB3InstrumentScores>()
  keys.setMany({
    topScore: input.readInt32LE(0xf8),
    topScoreDifficulty: input[0xfc],
    starsEasy: input[0xfd],
    percentEasy: input[0xfe],
    starsMedium: input[0x105],
    percentMedium: input[0x106],
    starsHard: input[0x10d],
    percentHard: input[0x10e],
    starsExpert: input[0x115],
    percentExpert: input[0x116],
  })
  score.set('keys', keys.toJSON())

  // PRO Drums
  const proDrums = new MyObject<RB3InstrumentScores>()
  proDrums.setMany({
    topScore: input.readInt32LE(0x11d),
    topScoreDifficulty: input[0x121],
    starsEasy: input[0x122],
    percentEasy: input[0x123],
    starsMedium: input[0x12a],
    percentMedium: input[0x12b],
    starsHard: input[0x132],
    percentHard: input[0x133],
    starsExpert: input[0x13a],
    percentExpert: input[0x13b],
  })
  score.set('proDrums', proDrums.toJSON())

  // PRO Guitar
  const proGuitar = new MyObject<RB3InstrumentScores>()
  proGuitar.setMany({
    topScore: input.readInt32LE(0x142),
    topScoreDifficulty: input[0x146],
    starsEasy: input[0x147],
    percentEasy: input[0x148],
    starsMedium: input[0x14f],
    percentMedium: input[0x150],
    starsHard: input[0x157],
    percentHard: input[0x158],
    starsExpert: input[0x15f],
    percentExpert: input[0x160],
  })
  score.set('proGuitar', proGuitar.toJSON())

  // PRO Bass
  const proBass = new MyObject<RB3InstrumentScores>()
  proBass.setMany({
    topScore: input.readInt32LE(0x167),
    topScoreDifficulty: input[0x16b],
    starsEasy: input[0x16c],
    percentEasy: input[0x16d],
    starsMedium: input[0x174],
    percentMedium: input[0x175],
    starsHard: input[0x17c],
    percentHard: input[0x17d],
    starsExpert: input[0x184],
    percentExpert: input[0x185],
  })
  score.set('proBass', proBass.toJSON())

  // PRO Keys
  const proKeys = new MyObject<RB3InstrumentScores>()
  proKeys.setMany({
    topScore: input.readInt32LE(0x18c),
    topScoreDifficulty: input[0x190],
    starsEasy: input[0x191],
    percentEasy: input[0x192],
    starsMedium: input[0x199],
    percentMedium: input[0x19a],
    starsHard: input[0x1a1],
    percentHard: input[0x1a2],
    starsExpert: input[0x1a9],
    percentExpert: input[0x1aa],
  })
  score.set('proKeys', proKeys.toJSON())

  // Band
  const band = new MyObject<RB3InstrumentScores>()
  band.setMany({
    topScore: input.readInt32LE(0x1b1),
    topScoreDifficulty: input[0x1b5],
    starsEasy: input[0x1b6],
    percentEasy: input[0x1b7],
    starsMedium: input[0x1b3],
    percentMedium: input[0x1bf],
    starsHard: input[0x1c6],
    percentHard: input[0x1c7],
    starsExpert: input[0x1ce],
    percentExpert: input[0x1cf],
  })
  score.set('band', band.toJSON())

  return score.toJSON()
}
