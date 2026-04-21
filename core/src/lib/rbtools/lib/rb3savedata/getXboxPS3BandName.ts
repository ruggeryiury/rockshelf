import type { BinaryReader } from 'node-lib'
import type { RB3SaveDataPlatformTypes } from '../../core.exports'

export const getXboxPS3BandName = async (reader: BinaryReader, platform: RB3SaveDataPlatformTypes): Promise<string> => {
  const startOffset = platform === 'ps3' ? 0x43a7e7 : 0x43a773
  let output = ''
  for (let i = 0; i < 0x2e; i++) {
    const start = startOffset + (i >>> 0)
    reader.seek(start)
    const c = await reader.readASCII(1)
    if (c !== '\u0000') output += c
    else break
  }

  return output
}
