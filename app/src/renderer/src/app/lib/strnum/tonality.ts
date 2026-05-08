import { RB3CompatibleDTAFile } from 'rockshelf-core/rbtools/lib'

const major = {
  0: 'C',
  1: 'Db',
  2: 'D',
  3: 'Eb',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'Ab',
  9: 'A',
  10: 'Bb',
  11: 'B',
} as const

const minor = {
  0: 'C',
  1: 'Db',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'Bb',
  11: 'B',
} as const

export const formatSongKeyString = (song: RB3CompatibleDTAFile): string | null => {
  if (!song.song_key && !song.vocal_tonic_note) return null
  const tonic = song.song_key || song.vocal_tonic_note || 0
  const tonality = song.song_tonality || 0
  let value = ''

  value += (tonality === 0 ? major : minor)[tonic]
  if (tonality === 1) value += 'm'

  return value
}
