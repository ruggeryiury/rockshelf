import { BinaryWriter } from 'node-lib'
import { detectDTABufferEncoding } from './dtaEncoding'

/**
 * Separates all song entries from a `.dta` file.
 * - - - -
 * @param {Buffer} dtaFileContents The `.dta` file contents.
 * @returns {string[]} An array with each song content separated to be parsed individually.
 */
export const depackDTAContents = (dtaFileContents: Buffer): string[] => {
  const rawSongs: Buffer[] = []
  const writer = new BinaryWriter()
  let parenthesisIteration = -1
  let isSymbolOrString: false | 'single' | 'double' | 'comment' = false

  for (const byte of dtaFileContents) {
    const char = String.fromCodePoint(byte)
    writer.writeUInt8(byte)

    if (isSymbolOrString === 'single' || isSymbolOrString === 'double' || isSymbolOrString === 'comment') {
      if (isSymbolOrString === 'single' && char === "'") {
        isSymbolOrString = false
        continue
      } else if (isSymbolOrString === 'double' && char === '"') {
        isSymbolOrString = false
        continue
      } else if (isSymbolOrString === 'comment' && byte === 0x0a) {
        isSymbolOrString = false
        continue
      } else continue
    }

    if (char === '"') {
      isSymbolOrString = 'double'
      continue
    } else if (char === "'") {
      isSymbolOrString = 'single'
      continue
    } else if (char === ';') {
      isSymbolOrString = 'comment'
      continue
    }

    if (char === '(' && parenthesisIteration === -1) {
      parenthesisIteration = 0
      continue
    } else if (char === '(' && parenthesisIteration > -1) {
      parenthesisIteration++
      continue
    } else if (char === ')' && parenthesisIteration === 0) {
      rawSongs.push(writer.toBuffer())
      writer.clearContents()
      parenthesisIteration = -1
      continue
    } else if (char === ')' && parenthesisIteration > 0) {
      parenthesisIteration--
      continue
    } else continue
  }

  const allSongs: string[] = []

  for (const songBuffer of rawSongs) {
    const songEnc = detectDTABufferEncoding(songBuffer)
    allSongs.push(songBuffer.toString(songEnc))
  }

  const finalSongs: string[] = []

  for (const song of allSongs) {
    const allLines = song
      .split('\n')
      .map((line) => {
        if (line.trim().replace(/\t/g, '').startsWith(';')) {
          if (line.includes(';Song authored by') || line.includes(';Song=') || line.includes(';Language(s)=') || line.includes(';Karaoke=') || line.includes(';Multitrack=') || line.includes(';DIYStems=') || line.includes(';PartialMultitrack=') || line.includes(';UnpitchedVocals=') || line.includes(';Convert=') || line.includes(';2xBass=') || line.includes(';RhythmKeys=') || line.includes(';RhythmBass=') || line.includes(';CATemh=') || line.includes(';ExpertOnly=') || line.includes(';ORIG_ID=')) return line
          return line.replace(/;.*/g, '').trim()
        }
        return line
      })
      .map((line) => {
        const replacements = {
          '’': "'",
          '‘': "'",
          '“': '"',
          '”': '"',
        } as const

        for (const char of Object.keys(replacements) as (keyof typeof replacements)[]) line = line.replaceAll(char, replacements[char])
        return line
      })
      .join('\r\n')

    const joinLines = allLines.replaceAll('\r\n', '').trim()
    const removeSpaces = joinLines.replace(/\s+/g, ' ').trim()
    finalSongs.push(removeSpaces)
  }

  return finalSongs
}
