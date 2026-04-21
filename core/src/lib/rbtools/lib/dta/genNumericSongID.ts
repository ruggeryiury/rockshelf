import { crc32 } from 'crc'

/**
 * Generates a numberic song ID based on any non-numeric string. If the given value is
 * already a number, it will simply return the provided ID.
 *
 * [_See the original C# function on **GitHub Gist**_](https://gist.github.com/InvoxiPlayGames/f0de3ad707b1d42055c53f0fd1428f7f), coded by [Emma (InvoxiPlayGames)](https://gist.github.com/InvoxiPlayGames).
 * - - - -
 * @param {string | number} id Any song ID as `string` or `number`.
 * @returns {number} The generated numeric ID.
 */
export const genNumericSongID = (id: string | number): number => {
  if (typeof id === 'number' || !isNaN(Number(id))) return Number(id)
  let newSongID = crc32(id)
  newSongID %= 9999999
  newSongID += 2130000000
  return newSongID
}
