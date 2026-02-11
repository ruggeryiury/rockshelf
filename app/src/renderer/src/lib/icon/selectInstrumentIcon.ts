import { bandIcon, bassIcon, drumsIcon, guitarIcon, harm3Icon, keysIcon, proBassIcon, proDrumsIcon, proGuitarIcon, proKeysIcon, vocalsIcon } from '@renderer/assets/images'
import type { ScoreDataInstrumentTypes } from 'rbtools'

export const selectInstrumentIcon = (instrument: ScoreDataInstrumentTypes): string => {
  switch (instrument) {
    case 'bass':
      return bassIcon
    case 'drums':
      return drumsIcon
    case 'guitar':
      return guitarIcon
    case 'harmonies':
      return harm3Icon
    case 'keys':
      return keysIcon
    case 'proBass':
      return proBassIcon
    case 'proDrums':
      return proDrumsIcon
    case 'proGuitar':
      return proGuitarIcon
    case 'proKeys':
      return proKeysIcon
    case 'vocals':
      return vocalsIcon
    case 'band':
    default:
      return bandIcon
  }
}
