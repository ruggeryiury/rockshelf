import type { BinaryReader } from 'node-lib'

export const getScoresListBytesWii = async (reader: BinaryReader, blockStart: number): Promise<Buffer[]> => {
  const wiiScoreBlockLength = 0x1d6 * 1000
  reader.seek(blockStart)
  const scoresBlock = await reader.read(wiiScoreBlockLength)
  const scores: Buffer[] = []
  for (let i = 0; i < scoresBlock.length; i += 0x1d6) {
    const testVal = scoresBlock.readUInt32LE(i)
    if (testVal === 0) break
    const score = Buffer.alloc(0x1d6)
    scoresBlock.copy(score, 0, i, i + 0x1d6)
    scores.push(score)
  }

  return scores
}

export const removeDupeID0x04 = (input: Buffer): Buffer => {
  // Get the first 4 bytes
  const first = input.subarray(0, 4)

  // Skip the 4 bytes at index 4 and get the rest
  const second = input.subarray(8)

  // Concatenate the two parts into a new Buffer
  const output = Buffer.concat([first, second])

  return output
}
