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
 * This function reads the `NODE_ENV` environment variable and evaluates it. If the variable is not defined, the function defaults to `false`.
 * - - - -
 * @returns {boolean} `true` if `process.env.NODE_ENV` is `"development"`, otherwise `false`.
 */
export const isDev = (): boolean => process.env.NODE_ENV === 'development'
