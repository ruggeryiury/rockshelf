/**
 * Creates a `Promise` that will be automatically resolved after the specific milliseconds provided on the `ms` parameter.
 * - - - -
 * @param {number} ms The amount of time (in milliseconds) to halt the promise resolving.
 * @returns {Promise<void>}
 */
export const sleep = (ms: number): Promise<void> => new Promise<void>((r) => setTimeout(r, ms))
