import { useDefaultOptions } from 'use-default-options'
import type { RB3CompatibleDTAFile } from '../lib.exports'
import { leadingArticleToTrailing, omitLeadingArticle } from '../utils.exports'

export interface StringFormatterOptions {
  /**
   * Removes all characters but characters and numbers. Default is `false`.
   */
  azNumOnly?: boolean
  /**
   * Forces lowercase/uppercase characters. Default is `null`.
   */
  forceCase?: 'lower' | 'upper' | null
  /**
   * Replace non-ASCII characters to ASCII replacements. Default is `false`.
   */
  normalizeNFD?: boolean
  /**
   * Remove all spaces. Default is `false`.
   */
  removeSpaces?: boolean
  /**
   * Removes the leading and trailing white space and line terminator characters from a string. Default is `false`.
   */
  trim?: boolean
}

export type StringFormatterSpecificOptionTypes = 'id' | 'id_with_space'

/**
 * Formats a string with the provided configuration.
 * - - - -
 * @param {RB3CompatibleDTAFile | null} song The song you want to fetch the values flagged on the
 * formatted string as a `DTAFile` object.
 *
 * If the provided argument is `null`, the function will ignore any formatting values
 * that relies on the `DTAFile` object and it will process the string only with the
 * configuration that is placed on the `options` object, acting as a simple string
 * formatter rather than rely on a `DTAFile` object.
 * @param {string} format The formatted string.
 * @param {StringFormatterOptions | StringFormatterSpecificOptionTypes | undefined} options `OPTIONAL` An object with properties that modifies the default behavior of the formatting process.
 * @returns {string} The string with format flags replaced to actual values from the provided `DTAFile` object.
 */
export const formatStringFromDTA = (song: RB3CompatibleDTAFile | null, format: string, options?: StringFormatterOptions | StringFormatterSpecificOptionTypes): string => {
  if (options === 'id')
    options = {
      azNumOnly: true,
      forceCase: 'lower',
      normalizeNFD: true,
      removeSpaces: true,
      trim: true,
    }
  else if (options === 'id_with_space')
    options = {
      azNumOnly: true,
      forceCase: 'lower',
      normalizeNFD: true,
      removeSpaces: false,
      trim: true,
    }

  const { azNumOnly, forceCase, normalizeNFD, removeSpaces, trim } = useDefaultOptions<StringFormatterOptions>(
    {
      azNumOnly: false,
      forceCase: null,
      normalizeNFD: false,
      removeSpaces: false,
      trim: false,
    },
    options
  )

  let newText = format

  if (song) {
    const valuesThatAreUnique = ['name', 'artist', 'album_name']
    const allSongKeys = Object.keys(song) as (keyof typeof song)[]
    for (const songKey of allSongKeys) {
      if (valuesThatAreUnique.includes(songKey)) continue
      if (!song[songKey]) continue
      newText = newText.replace(new RegExp(`{{${songKey}}}`, 'g'), song[songKey] as string)
    }

    for (const uniqueKeys of valuesThatAreUnique) {
      if (!song[uniqueKeys as keyof typeof song]) continue
      newText = newText.replace(new RegExp(`{{${uniqueKeys}}}`, 'g'), song[uniqueKeys as keyof typeof song] as string)
      newText = newText.replace(new RegExp(`{{${uniqueKeys}.emit}}`, 'g'), song[uniqueKeys as keyof typeof song] as string)
      newText = newText.replace(new RegExp(`{{${uniqueKeys}.omit}}`, 'g'), omitLeadingArticle(song[uniqueKeys as keyof typeof song] as string))
      newText = newText.replace(new RegExp(`{{${uniqueKeys}.trailing}}`, 'g'), leadingArticleToTrailing(song[uniqueKeys as keyof typeof song] as string))
    }

    newText = newText.replace(new RegExp(`{{title}}`, 'g'), song.name)
    newText = newText.replace(new RegExp(`{{title.emit}}`, 'g'), song.name)
    newText = newText.replace(new RegExp(`{{title.omit}}`, 'g'), omitLeadingArticle(song.name))
    newText = newText.replace(new RegExp(`{{title.trailing}}`, 'g'), leadingArticleToTrailing(song.name))

    newText = newText.replace(
      new RegExp(`{{idPatch1}}`, 'g'),
      (() => {
        options = {
          azNumOnly: true,
          forceCase: 'lower',
          normalizeNFD: true,
          removeSpaces: true,
          trim: true,
        }
        const is2x = song.doubleKick ?? song.name.includes(' (2x Bass Pedal)')
        const val = song.name.replace(' (2x Bass Pedal)', '')

        if (is2x) return `${val.slice(0, 48)}2x`
        return val.slice(0, 50)
      })()
    )
    newText = newText.replace(
      new RegExp(`{{idPatch2}}`, 'g'),
      (() => {
        const is2x = song.doubleKick ?? song.name.includes(' (2x Bass Pedal)')
        const val = `${Number(song.song_id.toString().slice(1, 5)).toString()}${song.name.replace(' (2x Bass Pedal)', '')}`

        if (is2x) return `${val.slice(0, 48)}2x`
        return val.slice(0, 50)
      })()
    )
  }
  if (normalizeNFD) newText = newText.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (azNumOnly) newText = newText.replace(/[^a-zA-Z0-9]/g, '')
  if (removeSpaces) newText = newText.replace(/ /g, '')
  if (trim) newText = newText.trim()

  switch (forceCase) {
    case 'lower':
      newText = newText.toLowerCase()
      break
    case 'upper':
      newText = newText.toUpperCase()
      break
    default:
      break
  }

  return newText
}
