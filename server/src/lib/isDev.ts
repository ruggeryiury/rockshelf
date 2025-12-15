export type BooleanStringValueTypes = 'true' | 'false' | '1' | '0'

/**
 * Evaluates a string value and converts it into a boolean.
 *
 * The comparison is case-insensitive and ignores leading/trailing whitespace.
 * Only the values `"true"` and `"1"` are considered `true`.
 * Any other value will result in `false`.
 * - - - -
 * @param {string} val The string value to evaluate.
 * @returns {boolean} `true` if the value represents a truthy boolean, otherwise `false`.
 * - - - -
 * @example
 * evalBooleanString('true')  // true
 * evalBooleanString('1')     // true
 * evalBooleanString('TRUE')  // true
 * evalBooleanString('false') // false
 * evalBooleanString('0')     // false
 */
export const evalBooleanString = (val: string): boolean => ['true', '1'].includes(val.trim().toLowerCase())

/**
 * Determines whether the application is running in development mode.
 *
 * This function reads the `DEV` environment variable and evaluates it
 * using {@link evalBooleanString}. If the variable is not defined,
 * the function defaults to `false`.
 *
 * Accepted truthy values for `DEV` are `"true"` and `"1"` (case-insensitive).
 * - - - -
 * @returns {boolean} `true` if `process.env.DEV` represents a truthy value, otherwise `false`.
 * - - - -
 * @example
 * // process.env.DEV = 'true'
 * isDev() // true
 *
 * @example
 * // process.env.DEV = '1'
 * isDev() // true
 *
 * @example
 * // process.env.DEV is undefined
 * isDev() // false
 */
export const isDev = (): boolean => (process.env.DEV ? evalBooleanString(process.env.DEV) : false)
