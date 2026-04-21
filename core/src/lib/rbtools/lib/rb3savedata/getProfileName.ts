import type { BinaryReader } from 'node-lib'

export const getProfileName = async (reader: BinaryReader, profileIndex: number): Promise<string> => {
  let output = ''
  for (let i = 0; i < 0x2e; i++) {
    const start = 0x7c + profileIndex * 0x3b + i
    reader.seek(start)
    const c = await reader.readASCII(1)
    if (c !== '\u0000') output += c
    else break
  }
  return output
}
