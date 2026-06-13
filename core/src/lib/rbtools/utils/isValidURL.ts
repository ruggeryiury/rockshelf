/**
 * Checks if a string is a valid URL.
 * - - - -
 * @param {string} url The URL you want to evaluate.
 * @returns {boolean} A boolean value that tells if the provided string is a link or not.
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}
