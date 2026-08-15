export const uppercaseFirstLetter = (text: string): string => {
  return `${text.slice(0, 1).toUpperCase()}${text.slice(1)}`
}

/**
 * Removes undeline characters from a string and makes the first character after the underline character uppercased. This is useful to convert Python naming convention to JavaScript one (camel case).
 * @param {string} text The text you want to process.
 * @param {boolean | undefined} uppercaseFirstWord `OPTIONAL` Makes the very first character of the string uppercase as well. Default is `false`.
 * @returns {string}
 */
export const underlineToCamelCase = (text: string, uppercaseFirstWord: boolean = false): string => {
  const splitText = text.split('_').map((t) => uppercaseFirstLetter(t))
  if (!uppercaseFirstWord) splitText[0] = splitText[0].toLowerCase()
  return splitText.join('')
}

/**
 * Displays a formatted string out of milliseconds.
 * - - - -
 * @param {number} ms The milliseconds to be formatted.
 * @returns {string}
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms.toFixed(1)}ms`
  }

  const seconds = ms / 1000

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}m ${remainingSeconds.toFixed(1)}s`
}
