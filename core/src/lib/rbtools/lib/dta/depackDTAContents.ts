/**
 * Separates all song entries from a `.dta` file.
 * - - - -
 * @param {string} dtaFileContents The `.dta` file contents.
 * @returns {string[]} An array with each song content separated to be parsed individually.
 */
export const depackDTAContents = (dtaFileContents: string): string[] => {
  const allLines = dtaFileContents
    .split('\n')
    .map((line) => {
      if (line.trim().replace(/\t/g, '').startsWith(';')) {
        if (line.includes(';Song authored by') || line.includes(';Song=') || line.includes(';Language(s)=') || line.includes(';Karaoke=') || line.includes(';Multitrack=') || line.includes(';DIYStems=') || line.includes(';PartialMultitrack=') || line.includes(';UnpitchedVocals=') || line.includes(';Convert=') || line.includes(';2xBass=') || line.includes(';RhythmKeys=') || line.includes(';RhythmBass=') || line.includes(';CATemh=') || line.includes(';ExpertOnly=') || line.includes(';ORIG_ID=')) return line
        return line.replace(/;.*/g, '').trim()
      }
      return line
    })
    .join('\r\n')
  const joinLines = allLines.replaceAll('\r\n', '').trim()
  const removeSpaces = joinLines.replace(/\s+/g, ' ').trim()

  let beingProcessed = false,
    pIndex = 0,
    song = ''

  const returnValue = [] as string[]

  Array.from(removeSpaces).forEach((char) => {
    if (!beingProcessed && char === '(') {
      beingProcessed = true
      song += char
      return
    }

    if (beingProcessed) {
      if (char === '(') {
        pIndex++
        song += char
        return
      } else if (char === ')' && pIndex !== 0) {
        pIndex--
        song += char
        return
      } else if (char === ')' && pIndex === 0) {
        const newSong = song + char
        returnValue.push(newSong)
        song = ''
        beingProcessed = false
        return
      }

      song += char
      return
    }
  })

  return returnValue
}
