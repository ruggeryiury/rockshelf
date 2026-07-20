// Code taken from "truncate-utf8-bytes" package.
// https://www.npmjs.com/package/truncate-utf8-bytes

const isHighSurrogate = (codePoint: number): boolean => {
  return codePoint >= 0xd800 && codePoint <= 0xdbff
}

const isLowSurrogate = (codePoint: number): boolean => {
  return codePoint >= 0xdc00 && codePoint <= 0xdfff
}

const truncate = (text: string, byteLength: number): string => {
  if (typeof text !== 'string') {
    throw new Error('Input must be string')
  }

  const charLength = text.length
  let curByteLength = 0
  let codePoint: number
  let segment: string

  for (let i = 0; i < charLength; i += 1) {
    codePoint = text.charCodeAt(i)
    segment = text[i]

    if (isHighSurrogate(codePoint) && isLowSurrogate(text.charCodeAt(i + 1))) {
      i += 1
      segment += text[i]
    }

    curByteLength += Buffer.from(segment).byteLength

    if (curByteLength === byteLength) {
      return text.slice(0, i + 1)
    } else if (curByteLength > byteLength) {
      return text.slice(0, i - segment.length + 1)
    }
  }

  return text
}

// Code taken from "sanitize-filename" package.
// https://www.npmjs.com/package/sanitize-filename

interface SanitizerOptions {
  replacement?: string
  nameLength?: number
}

const illegalRe = /[\/\?<>\\:\*\|"]/g
const controlRe = /[\x00-\x1f\x80-\x9f]/g
const reservedRe = /^\.+$/
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i

/**
 * Strip trailing spaces and dots, which are not allowed on some Windows file systems. Does not use a regex to avoid a quadratic [ReDoS vulnerability (CWE-1333)](https://cwe.mitre.org/data/definitions/1333.html).
 */
const replaceTrailingDotsAndSpaces = (str: string, replacement: NonNullable<SanitizerOptions['replacement']>): string => {
  let end = str.length
  while (end > 0 && (str[end - 1] === '.' || str[end - 1] === ' ')) end--
  return end < str.length ? str.slice(0, end) + replacement : str
}

const sanitize = (input: string, replacement: NonNullable<SanitizerOptions['replacement']>, nameLength: number = 255): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be string')
  }
  let sanitized = input.replace(illegalRe, replacement).replace(controlRe, replacement).replace(reservedRe, replacement).replace(windowsReservedRe, replacement)
  sanitized = replaceTrailingDotsAndSpaces(sanitized, replacement)
  return truncate(sanitized, nameLength)
}

/**
 * Sanitizes an input to be valid for a file name.
 * - - - -
 * @param {string} input The input string to be sanitized.
 * @param {SanitizerOptions | undefined} [options] `OPTIONAL`
 * @returns {string}
 */
export const sanitizeFilename = (input: string, options?: SanitizerOptions): string => {
  const replacement: NonNullable<SanitizerOptions['replacement']> = options?.replacement || ''
  const output = sanitize(input, replacement, options?.nameLength || 255)
  if (replacement === '') {
    return output
  }
  return sanitize(output, '')
}
