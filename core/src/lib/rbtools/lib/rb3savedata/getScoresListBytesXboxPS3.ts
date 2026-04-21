import type { BinaryReader } from 'node-lib'
import { newDTBCrypt } from '../../lib.exports'

export const getScoresListBytesXboxPS3 = async (reader: BinaryReader, blockStart: number): Promise<Buffer[]> => {
  reader.seek(blockStart)
  const encScoresBlock = await reader.read(0x15b33c)
  let decScoresBlock = newDTBCrypt(encScoresBlock)

  const xboxPS3UnknownBytes = Buffer.alloc(0x84)
  decScoresBlock.copy(xboxPS3UnknownBytes, 0, 0x15b2b4, 0x15b2b4 + 0x84)
  decScoresBlock = decScoresBlock.subarray(0x04)

  const scores: Buffer[] = []
  for (let i = 0; i < decScoresBlock.length; i++) {
    const testVal = decScoresBlock.readUInt32LE(i * 0x1da)

    if (testVal === 0 || i === 0xbb8) {
      if (i === 0xbb8) console.warn('RB3SaveData WARN: More than 3000 songs were detected, but only 2999 can be stored. Only returning the first 2999 songs.')
      break
    }
    const score = Buffer.alloc(0x1da)
    decScoresBlock.copy(score, 0, i * 0x1da, i * 0x1da + 0x1da)
    scores.push(score)
  }

  return scores
}
