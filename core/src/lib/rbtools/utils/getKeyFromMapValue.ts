/**
 * Returns the key from a `value` that exists inside on a `map`.
 *
 * Returns `null` if the value does not matches on any key.
 * - - - -
 * @template {Record<string, unknown>} T
 * @param {T} map The object with keys and values.
 * @param {unknown} value A value that exists on provided map.
 * @returns {keyof T | null}
 */
export const getKeyFromMapValue = <T extends Record<string, unknown>>(map: T, value: T[keyof T]): keyof T | null => {
  const keys = Object.keys(map) as (keyof T)[]

  for (const key of keys) {
    if (map[key] === value) return key
  }

  return null
}
