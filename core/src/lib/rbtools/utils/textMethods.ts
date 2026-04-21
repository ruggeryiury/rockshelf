/**
 * Normalizes a string by removing diacritical marks (accents)
 * and converting accented characters to their non-accented equivalents.
 * - - - -
 * @param {string} str The input string to normalize.
 * @returns {string} The normalized string with accents removed.
 */
export const normalizeString = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const articles = [
  // English
  'a',
  'an',
  'the',

  // Spanish
  'lo',
  'la',
  'los',
  'las',
  'el',

  // Portuguese
  'o',
  'os',
  'as',
] as const

/**
 * Removes the leading article from a string, if any.
 * - - - -
 * @param {string} text The text you want to be processed.
 * @returns {string} The text processed.
 */
export const omitLeadingArticle = (text: string): string => {
  const words = text.split(' ')
  const firstWord = words[0]
  const hasLeadingArticle = articles.includes(firstWord.toLowerCase() as (typeof articles)[number])
  if (hasLeadingArticle) {
    return words.slice(1).join(' ')
  }

  return words.join(' ')
}

/**
 * Puts the leading article at the end to the string, separated with a comma, if any.
 * - - - -
 * @param {string} text The text you want to be processed.
 * @returns {string} The text processed.
 */
export const leadingArticleToTrailing = (text: string): string => {
  const words = text.split(' ')
  const firstWord = words[0]
  const hasLeadingArticle = articles.includes(firstWord.toLowerCase() as (typeof articles)[number])
  if (hasLeadingArticle) {
    return `${words.slice(1).join(' ')}, ${firstWord}`
  }

  return words.join(' ')
}

/**
 * Replaces quote character (`"`) to slash Q (`\q`).
 *
 * Slash Q replaces the quote character on a DTA File.
 * - - - -
 * @param {string} text The text you want to be processed.
 * @returns {string} The text processed.
 */
export const quoteToSlashQ = (text: string): string => text.replace(/"/g, '\\q')

/**
 * Replaces slash Q (`\q`) to quote character (`"`).
 *
 * Slash Q replaces the quote character on a DTA File.
 * - - - -
 * @param {string} text The text you want to be processed.
 * @returns {string} The text processed.
 */
export const slashQToQuote = (text: string): string => text.replace(/\\\\/g, '\\').replace(/\\q/g, '"')
