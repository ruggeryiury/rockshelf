import { useDefaultOptions } from 'use-default-options'
import { DTAIO, genTracksCountArray, sortDTA, tabNewLineFormatter, type DTAFileKeys, type DTAFileUpdateObject, type DTAIOFormattingOptions, type FloatValueObject, type RB3CompatibleDTAFile, type SongSortingTypes } from '../../lib.exports'
import { MyObject } from 'node-lib'
import { quoteToSlashQ } from '../../utils.exports'

export interface SongsAndUpdatesObject {
  /**
   * An array with songs with complete information to work properly on Rock Band 3.
   */
  songs: RB3CompatibleDTAFile[]
  /**
   * An array with updates that will be applied to its respective songs, if the song is found on `this.songs`.
   *
   * Updates are only stringified directly when there's no entries on `this.songs`.
   */
  updates: DTAFileUpdateObject[]
}

export interface DTAStringifyOptions {
  /**
   * `SONGS ONLY` If `true`, songs with fake value as `true` won't be renderer. Default is `false`.
   */
  ignoreFakeSongs?: boolean
  /**
   * `SONGS ONLY` Changes the songname path to use on Wii console. Default is `null` (Will use XBox/PS3 default songname path).
   */
  wiiMode?: `SZ${string}E/${number}` | null
  /**
   * `SONGS ONLY` Adds generated MAGMA values that is accepted on Nautillus, MAGMA Rok On Edition, and Onyx. Default is `true`.
   */
  addMAGMAValues?: boolean
  /**
   * Changes the sorting of the songs. This property has no influence if you want to stringify a single song. Default is `null`.
   */
  sortBy?: SongSortingTypes
  /**
   * `SONGS ONLY` Omit values considered to be default. Default is `true`.
   */
  omitUnusedValues?: boolean
  /**
   * An object with properties that modifies the default behavior of the DTA rendering process.
   *
   * RB3 and MAGMA formatting options are available as static property on `DTAIO.formatOptions`. Default is `DTAIO.formatOptions.defaultRB3`.
   */
  formatOptions?: DTAIOFormattingOptions
  /**
   * Add `tracks_count` property on songs. Default is `true`.
   */
  addTracksCount?: boolean
}

/**
 * Stringify songs and updates entries back to DTA format.
 * - - - -
 * @param {SongsAndUpdatesObject} songsAndUpdates
 * @param {DTAStringifyOptions} [options] `OPTIONAL` An object with properties that modifies the default behavior of the stringify process.
 * @returns {string}
 */
export const stringifyDTA = (songsAndUpdates: SongsAndUpdatesObject, options?: DTAStringifyOptions): string => {
  let { songs, updates } = songsAndUpdates
  const { ignoreFakeSongs, wiiMode, addMAGMAValues, sortBy, omitUnusedValues, formatOptions, addTracksCount } = useDefaultOptions(
    {
      ignoreFakeSongs: false,
      wiiMode: null,
      addMAGMAValues: true,
      sortBy: null,
      omitUnusedValues: true,
      formatOptions: DTAIO.formatOptions.defaultRB3,
      addTracksCount: true,
    },
    options
  )
  const io = new DTAIO(formatOptions)

  if (songs.length === 0 && updates.length === 0) throw new Error('No songs or updates to be stringified.')
  if (updates.length > 0) {
    // Song metadata updates
    updates = sortDTA(updates, 'ID')
    io.options = { ...io.options, object: { ...io.options.object, closeParenthesisInline: true } }

    for (const upd of updates) {
      const { album_art, anim_tempo, artist, bank, drum_bank, game_origin, genre, id, master, name, preview, rank_band, rating, song_id, song_length, songname, tracks_count, vocal_gender, vocal_parts, year_released, album_name, album_track_number, alternate_path, author, band_fail_cue, base_points, context, cores, customsource, encoding, extra_authoring, fake, format, guide_pitch_volume, hopo_threshold, keys_author, loading_phrase, mute_volume, mute_volume_vocals, pack_name, pans, rank_bass, rank_drum, rank_guitar, rank_keys, rank_real_bass, rank_real_guitar, rank_real_keys, rank_vocals, real_bass_tuning, real_guitar_tuning, solo, song_key, song_scroll_speed, song_tonality, strings_author, sub_genre, tuning_offset_cents, upgrade_version, version, vocal_tonic_note, vols, year_recorded, newID } = upd
      const map = new MyObject()

      const allValuesKeys = Object.keys(upd) as DTAFileKeys[]
      const tracks = tracks_count ? genTracksCountArray(tracks_count) : undefined
      const customSource = customsource

      let hasSongSpecific = false,
        hasAnyRank = false
      for (const key of allValuesKeys) {
        if (key === 'songname' || key === 'tracks_count' || key === 'pans' || key === 'vols' || key === 'cores' || key === 'vocal_parts' || key === 'mute_volume' || key === 'mute_volume_vocals' || key === 'hopo_threshold') {
          hasSongSpecific = true
        } else if (key === 'rank_drum' || key === 'rank_guitar' || key === 'rank_bass' || key === 'rank_vocals' || key === 'rank_keys' || key === 'rank_real_keys' || key === 'rank_real_guitar' || key === 'rank_real_bass' || key === 'rank_band') {
          hasAnyRank = true
        } else continue
      }

      if (name !== undefined) map.set('name', DTAIO.useString(quoteToSlashQ(name), io.options.string))
      if (artist !== undefined) map.set('artist', DTAIO.useString(quoteToSlashQ(artist), io.options.string))
      if (fake === true) map.set('fake', fake)
      if (master !== undefined) map.set('master', master)
      if (song_id !== undefined) map.set('song_id', song_id)
      if (upgrade_version !== undefined) map.set('upgrade_version', upgrade_version)
      if (context !== undefined) map.set('context', context)

      if (hasSongSpecific) {
        const songMap = new MyObject()
        if (songname !== undefined) {
          if (wiiMode) songMap.set('name', DTAIO.useString(`dlc/${wiiMode}/content/${songname}/${songname}`, io.options.string))
          else songMap.set('name', DTAIO.useString(`songs/${songname}/${songname}`, io.options.string))
        }
        if (tracks_count !== undefined && tracks) {
          if (io.options.array.keyAndValueInline === 'expanded') {
            // MAGMA style
            const tracksArray: object[] = []
            if (tracks.drum) tracksArray.push({ drum: tracks.drum })
            if (tracks.bass) tracksArray.push({ bass: tracks.bass })
            if (tracks.guitar) tracksArray.push({ guitar: tracks.guitar })
            if (tracks.vocals) tracksArray.push({ vocals: tracks.vocals })
            if (tracks.keys) tracksArray.push({ keys: tracks.keys })
            songMap.set('tracks', DTAIO.useArray(tracksArray, io.options))
          } else {
            // RB3 style
            let firstInstrument = true
            let content = '('
            if (tracks.drum) {
              content += `(drum ${tracks.drum.length > 1 ? `(${tracks.drum.join(' ')})` : tracks.drum.join(' ')})`
              firstInstrument = false
            }
            if (tracks.bass) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(bass ${tracks.bass.length > 1 ? `(${tracks.bass.join(' ')})` : tracks.bass.join(' ')})`
              firstInstrument = false
            }
            if (tracks.guitar) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(guitar ${tracks.guitar.length > 1 ? `(${tracks.guitar.join(' ')})` : tracks.guitar.join(' ')})`
              firstInstrument = false
            }
            if (tracks.vocals) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(vocals ${tracks.vocals.length > 1 ? `(${tracks.vocals.join(' ')})` : tracks.vocals.join(' ')})`
              firstInstrument = false
            }
            if (tracks.keys) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(keys ${tracks.keys.length > 1 ? `(${tracks.keys.join(' ')})` : tracks.keys.join(' ')})`
              firstInstrument = false
            }
            content += '){n}{t}{t}'
            songMap.set('tracks', DTAIO.useVariable(tabNewLineFormatter(content), { ...io.options.string, keyAndValueInline: false, apostropheOnVariable: false }))
          }
        }
        if (vocal_parts !== undefined) songMap.set('vocal_parts', vocal_parts)
        if (pans) {
          songMap.set(
            'pans',
            DTAIO.useArray(
              pans.map((val) =>
                DTAIO.useFloat(val, {
                  ...io.options.number,
                  floatMaxDecimals: 1,
                })
              ),
              io.options
            )
          )
        }
        if (vols) {
          songMap.set(
            'vols',
            DTAIO.useArray(
              vols.map((val) =>
                DTAIO.useFloat(val, {
                  ...io.options.number,
                  floatMaxDecimals: 1,
                })
              ),
              io.options
            )
          )
        }
        if (cores) songMap.set('cores', cores)
        if (tracks?.crowd !== undefined) songMap.set('crowd_channels', tracks.crowd)
        if (mute_volume !== undefined) songMap.set('mute_volume', mute_volume)
        if (mute_volume_vocals !== undefined) songMap.set('mute_volume_vocals', mute_volume_vocals)
        if (hopo_threshold !== undefined) songMap.set('hopo_threshold', hopo_threshold)
        map.set('song', songMap.toJSON())
      }

      if (bank) map.set('bank', bank)
      if (drum_bank !== undefined) map.set('drum_bank', drum_bank)
      if (anim_tempo !== undefined) map.set('anim_tempo', anim_tempo)
      if (band_fail_cue !== undefined) map.set('band_fail_cue', band_fail_cue)
      if (song_scroll_speed !== undefined) map.set('song_scroll_speed', song_scroll_speed)
      if (preview !== undefined) map.set('preview', DTAIO.useArray(preview, { ...io.options, array: { ...io.options.array, parenthesisForValues: false } }))
      if (song_length !== undefined) map.set('song_length', song_length)

      if (hasAnyRank) {
        const rankMap = new MyObject()
        if (rank_drum) rankMap.set('drum', rank_drum)
        if (rank_guitar) rankMap.set('guitar', rank_guitar)
        if (rank_bass) rankMap.set('bass', rank_bass)
        if (rank_vocals) rankMap.set('vocals', rank_vocals)
        if (rank_keys) rankMap.set('keys', rank_keys)
        if (rank_real_keys) rankMap.set('real_keys', rank_real_keys)
        if (rank_real_guitar) rankMap.set('real_guitar', rank_real_guitar)
        if (rank_real_bass) rankMap.set('real_bass', rank_real_bass)
        if (rank_band) rankMap.set('band', rank_band)
        map.set('rank', rankMap.toJSON())
      }
      if (solo !== undefined && solo.length > 0) map.set('solo', DTAIO.useArray(solo, io.options))
      if (format !== undefined) map.set('format', format)
      if (version !== undefined) map.set('version', version)
      if (game_origin !== undefined) map.set('game_origin', !customSource?.game_origin ? game_origin : DTAIO.useIfDef('CUSTOMSOURCE', customSource.game_origin, game_origin, io.options))
      if (rating !== undefined) map.set('rating', rating)
      if (genre !== undefined) map.set('genre', !customSource?.genre ? genre : DTAIO.useIfDef('CUSTOMSOURCE', customSource.genre, genre, io.options))
      if (sub_genre !== undefined) map.set('sub_genre', !customSource?.sub_genre ? sub_genre : DTAIO.useIfDef('CUSTOMSOURCE', customSource.sub_genre, sub_genre, io.options))
      if (vocal_gender !== undefined) map.set('vocal_gender', vocal_gender)
      if (year_released !== undefined) map.set('year_released', year_released)
      if (year_recorded !== undefined) map.set('year_recorded', year_recorded)
      if (album_art !== undefined) map.set('album_art', album_art)
      if (album_name !== undefined) map.set('album_name', album_name)
      if (album_track_number !== undefined) map.set('album_track_number', album_track_number)
      if (vocal_tonic_note !== undefined) map.set('vocal_tonic_note', vocal_tonic_note)
      if (song_tonality !== undefined) map.set('song_tonality', song_tonality)
      if (song_key !== undefined) map.set('song_key', song_key)
      if (encoding !== undefined) map.set('encoding', encoding)
      if (tuning_offset_cents !== undefined) map.set('tuning_offset_cents', tuning_offset_cents)
      if (guide_pitch_volume !== undefined) map.set('guide_pitch_volume', DTAIO.useFloat(guide_pitch_volume, { ...io.options.number, floatMaxDecimals: 1 }))
      if (real_guitar_tuning !== undefined) map.set('real_guitar_tuning', real_guitar_tuning)
      if (real_bass_tuning !== undefined) map.set('real_bass_tuning', real_bass_tuning)
      if (alternate_path !== undefined) map.set('alternate_path', alternate_path)
      if (base_points !== undefined) map.set('base_points', base_points)
      if (extra_authoring !== undefined && extra_authoring.length > 0) map.set('extra_authoring', DTAIO.useArray(extra_authoring, { ...io.options, array: { ...io.options.array, parenthesisForValues: false } }))
      if (author !== undefined) map.set('author', DTAIO.useString(quoteToSlashQ(author), io.options.string))
      if (strings_author !== undefined) map.set('strings_author', DTAIO.useString(quoteToSlashQ(strings_author), io.options.string))
      if (keys_author !== undefined) map.set('keys_author', DTAIO.useString(quoteToSlashQ(keys_author), io.options.string))
      if (loading_phrase !== undefined) map.set('loading_phrase', DTAIO.useString(quoteToSlashQ(loading_phrase), io.options.string))
      if (pack_name !== undefined) map.set('pack_name', DTAIO.useString(quoteToSlashQ(pack_name), io.options.string))

      io.addValue(newID ?? id, map.toJSON())
    }
  }
  if (songs.length > 0) {
    // Songs only
    if (sortBy) songs = sortDTA(songs, sortBy)
    for (const song of songs) {
      const { album_art, anim_tempo, artist, bank, drum_bank, game_origin, genre, id, master, name, preview, rank_band, rating, song_id, song_length, songname, tracks_count, vocal_gender, vocal_parts, year_released, album_name, album_track_number, alternate_path, author, band_fail_cue, base_points, context, convert, cores, customsource, doubleKick, emh, encoding, extra_authoring, fake, format, guide_pitch_volume, hopo_threshold, keys_author, languages, loading_phrase, multitrack, mute_volume, mute_volume_vocals, pack_name, pans, rank_bass, rank_drum, rank_guitar, rank_keys, rank_real_bass, rank_real_guitar, rank_real_keys, rank_vocals, real_bass_tuning, real_guitar_tuning, rhythmOn, solo, song_key, song_scroll_speed, song_tonality, strings_author, sub_genre, tuning_offset_cents, unpitchedVocals, upgrade_version, version, vocal_tonic_note, vols, year_recorded, original_id, newID } = song as DTAFileUpdateObject
      const map = new MyObject()

      if (fake && ignoreFakeSongs) continue

      const allValuesKeys = Object.keys(song) as DTAFileKeys[]
      const tracks = tracks_count ? genTracksCountArray(tracks_count) : undefined
      const customSource = customsource

      let hasSongSpecific = false,
        hasAnyRank = false
      for (const key of allValuesKeys) {
        if (key === 'songname' || key === 'tracks_count' || key === 'pans' || key === 'vols' || key === 'cores' || key === 'vocal_parts' || key === 'mute_volume' || key === 'mute_volume_vocals' || key === 'hopo_threshold') {
          hasSongSpecific = true
        } else if (key === 'rank_drum' || key === 'rank_guitar' || key === 'rank_bass' || key === 'rank_vocals' || key === 'rank_keys' || key === 'rank_real_keys' || key === 'rank_real_guitar' || key === 'rank_real_bass' || key === 'rank_band') {
          hasAnyRank = true
        } else continue
      }

      if (name !== undefined) map.set('name', DTAIO.useString(quoteToSlashQ(name), io.options.string))
      if (artist !== undefined) map.set('artist', DTAIO.useString(quoteToSlashQ(artist), io.options.string))
      if (fake === true) map.set('fake', fake)
      if (master !== undefined) map.set('master', master)
      if (song_id !== undefined) map.set('song_id', song_id)
      if (upgrade_version !== undefined) map.set('upgrade_version', upgrade_version)
      if (context !== undefined) map.set('context', context)

      if (hasSongSpecific) {
        const songMap = new Map()
        if (songname !== undefined) {
          if (wiiMode) songMap.set('name', DTAIO.useString(`dlc/${wiiMode}/content/${songname}/${songname}`, io.options.string))
          else songMap.set('name', DTAIO.useString(`songs/${songname}/${songname}`, io.options.string))
        }
        if (tracks_count !== undefined && tracks) {
          if (io.options.array.keyAndValueInline === 'expanded') {
            // MAGMA style
            if (addTracksCount) songMap.set('tracks_count', tracks_count)
            const tracksArray: object[] = []
            if (tracks.drum) tracksArray.push({ drum: tracks.drum })
            if (tracks.bass) tracksArray.push({ bass: tracks.bass })
            if (tracks.guitar) tracksArray.push({ guitar: tracks.guitar })
            if (tracks.vocals) tracksArray.push({ vocals: tracks.vocals })
            if (tracks.keys) tracksArray.push({ keys: tracks.keys })
            songMap.set('tracks', DTAIO.useArray(tracksArray, io.options))
          } else {
            // RB3 style
            if (addTracksCount) songMap.set('tracks_count', tracks_count)
            let firstInstrument = true
            let content = '('
            if (tracks.drum) {
              content += `(drum ${tracks.drum.length > 1 ? `(${tracks.drum.join(' ')})` : tracks.drum.join(' ')})`
              firstInstrument = false
            }
            if (tracks.bass) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(bass ${tracks.bass.length > 1 ? `(${tracks.bass.join(' ')})` : tracks.bass.join(' ')})`
              firstInstrument = false
            }
            if (tracks.guitar) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(guitar ${tracks.guitar.length > 1 ? `(${tracks.guitar.join(' ')})` : tracks.guitar.join(' ')})`
              firstInstrument = false
            }
            if (tracks.vocals) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(vocals ${tracks.vocals.length > 1 ? `(${tracks.vocals.join(' ')})` : tracks.vocals.join(' ')})`
              firstInstrument = false
            }
            if (tracks.keys) {
              if (!firstInstrument) content += '{n}{t}{t}{t} '
              content += `(keys ${tracks.keys.length > 1 ? `(${tracks.keys.join(' ')})` : tracks.keys.join(' ')})`
              firstInstrument = false
            }
            content += '){n}{t}{t}'
            songMap.set('tracks', DTAIO.useVariable(tabNewLineFormatter(content), { ...io.options.string, keyAndValueInline: false, apostropheOnVariable: false }))
          }
        }
        if (vocal_parts !== undefined) songMap.set('vocal_parts', vocal_parts)
        if (pans) {
          songMap.set(
            'pans',
            DTAIO.useArray(
              pans.map((val) =>
                DTAIO.useFloat(val, {
                  ...io.options.number,
                  floatMaxDecimals: 1,
                })
              ),
              io.options
            )
          )
        }
        if (vols) {
          songMap.set(
            'vols',
            DTAIO.useArray(
              vols.map((val) =>
                DTAIO.useFloat(val, {
                  ...io.options.number,
                  floatMaxDecimals: 1,
                })
              ),
              io.options
            )
          )
        }
        if (cores) {
          songMap.set('cores', cores)
        }
        // Songs only
        else {
          const tracks = genTracksCountArray(song.tracks_count)
          const coresArray = Array<number>(tracks.allTracksCount)
            .fill(-1)
            .map((core, coreI) => {
              if (tracks.guitar?.includes(coreI)) return 1
              return -1
            })
          songMap.set('cores', coresArray)
        }
        songMap.set('drum_solo', {
          seqs: ['kick.cue', 'snare.cue', 'tom1.cue', 'tom2.cue', 'crash.cue'],
        })
        songMap.set('drum_freestyle', {
          seqs: ['kick.cue', 'snare.cue', 'hat.cue', 'ride.cue', 'crash.cue'],
        })
        if (tracks?.crowd !== undefined) songMap.set('crowd_channels', tracks.crowd)
        if (mute_volume !== undefined) songMap.set('mute_volume', mute_volume)
        if (mute_volume_vocals !== undefined) songMap.set('mute_volume_vocals', mute_volume_vocals)
        if (hopo_threshold !== undefined) songMap.set('hopo_threshold', hopo_threshold)

        if (omitUnusedValues) {
          if (songMap.get('mute_volume') === -96) songMap.delete('mute_volume')
          if (songMap.get('mute_volume_vocals') === -12) songMap.delete('mute_volume_vocals')
          if (songMap.get('hopo_threshold') === 170) songMap.delete('hopo_threshold')
        }

        map.set('song', Object.fromEntries(songMap.entries()))
      }

      if (bank !== undefined) map.set('bank', bank)
      if (drum_bank !== undefined) map.set('drum_bank', drum_bank)
      if (anim_tempo !== undefined) map.set('anim_tempo', anim_tempo)
      if (band_fail_cue !== undefined) map.set('band_fail_cue', band_fail_cue)
      if (song_scroll_speed !== undefined) map.set('song_scroll_speed', song_scroll_speed)
      if (preview !== undefined) map.set('preview', DTAIO.useArray(preview, { ...io.options, array: { ...io.options.array, parenthesisForValues: false } }))
      if (song_length !== undefined) map.set('song_length', song_length)

      if (hasAnyRank) {
        const rankMap = new MyObject()
        if (rank_drum) rankMap.set('drum', rank_drum)
        if (rank_guitar) rankMap.set('guitar', rank_guitar)
        if (rank_bass) rankMap.set('bass', rank_bass)
        if (rank_vocals) rankMap.set('vocals', rank_vocals)
        if (rank_keys) rankMap.set('keys', rank_keys)
        if (rank_real_keys) rankMap.set('real_keys', rank_real_keys)
        if (rank_real_guitar) rankMap.set('real_guitar', rank_real_guitar)
        if (rank_real_bass) rankMap.set('real_bass', rank_real_bass)
        if (rank_band) rankMap.set('band', rank_band)
        map.set('rank', rankMap.toJSON())
      }
      if (solo !== undefined && solo.length > 0) map.set('solo', DTAIO.useArray(solo, io.options))
      if (format !== undefined) map.set('format', format)
      if (version !== undefined) map.set('version', version)
      if (game_origin !== undefined) map.set('game_origin', !customSource?.game_origin ? game_origin : DTAIO.useIfDef('CUSTOMSOURCE', customSource.game_origin, game_origin, io.options))
      if (rating !== undefined) map.set('rating', rating)
      if (genre !== undefined) map.set('genre', !customSource?.genre ? genre : DTAIO.useIfDef('CUSTOMSOURCE', customSource.genre, genre, io.options))
      if (sub_genre !== undefined) map.set('sub_genre', !customSource?.sub_genre ? sub_genre : DTAIO.useIfDef('CUSTOMSOURCE', customSource.sub_genre, sub_genre, io.options))
      if (vocal_gender !== undefined) map.set('vocal_gender', vocal_gender)
      if (year_released !== undefined) map.set('year_released', year_released)
      if (year_recorded !== undefined) map.set('year_recorded', year_recorded)
      if (album_art !== undefined) map.set('album_art', album_art)
      if (album_name !== undefined) map.set('album_name', album_name)
      if (album_track_number !== undefined) map.set('album_track_number', album_track_number)
      if (vocal_tonic_note !== undefined) map.set('vocal_tonic_note', vocal_tonic_note)
      if (song_tonality !== undefined) map.set('song_tonality', song_tonality)
      if (song_key !== undefined) map.set('song_key', song_key)
      if (encoding !== undefined) map.set('encoding', encoding)
      if (tuning_offset_cents !== undefined) map.set('tuning_offset_cents', tuning_offset_cents)
      if (guide_pitch_volume !== undefined) map.set('guide_pitch_volume', DTAIO.useFloat(guide_pitch_volume, { ...io.options.number, floatMaxDecimals: 1 }))
      if (real_guitar_tuning !== undefined) map.set('real_guitar_tuning', real_guitar_tuning)
      if (real_bass_tuning !== undefined) map.set('real_bass_tuning', real_bass_tuning)
      if (alternate_path !== undefined) map.set('alternate_path', alternate_path)
      if (base_points !== undefined) map.set('base_points', base_points)
      if (extra_authoring !== undefined && extra_authoring.length > 0) map.set('extra_authoring', DTAIO.useArray(extra_authoring, { ...io.options, array: { ...io.options.array, parenthesisForValues: false } }))
      if (author !== undefined) map.set('author', DTAIO.useString(quoteToSlashQ(author), io.options.string))
      if (strings_author !== undefined) map.set('strings_author', DTAIO.useString(quoteToSlashQ(strings_author), io.options.string))
      if (keys_author !== undefined) map.set('keys_author', DTAIO.useString(quoteToSlashQ(keys_author), io.options.string))
      if (loading_phrase !== undefined) map.set('loading_phrase', DTAIO.useString(quoteToSlashQ(loading_phrase), io.options.string))
      if (pack_name !== undefined) map.set('pack_name', DTAIO.useString(quoteToSlashQ(pack_name), io.options.string))

      // Songs only
      if (rank_vocals && rank_vocals > 0 && (rank_vocals === 0 || vocal_parts === undefined)) map.set('vocal_parts', 1)
      else if (rank_vocals && rank_vocals === 0 && vocal_parts === undefined) map.set('vocal_parts', 0)

      if (!rating) map.set('rating', 4)

      if (addMAGMAValues) {
        let content = ''
        content += '{n};DO NOT EDIT THE FOLLOWING LINES MANUALLY{n};Created using Magma: Rok On Edition v4.0.3{n}'
        content += `;Song authored by ${author ?? 'Unknown Charter'}{n}`
        content += `;Song=${name ?? ''}{n}`
        if (!languages || languages.length === 0) content += `;Language(s)=English,{n}`
        else content += `;Language(s)=${languages.join(', ')},{n}`

        const karaoke = multitrack === 'karaoke'
        content += `;Karaoke=${karaoke ? '1' : '0'}{n}`

        const mt = multitrack === 'full'
        content += `;Multitrack=${mt ? '1' : '0'}{n}`

        const diyStems = multitrack === 'diy_stems'
        content += `;DIYStems=${diyStems ? '1' : '0'}{n}`

        const partial = multitrack === 'partial'
        content += `;PartialMultitrack=${partial ? '1' : '0'}{n}`

        content += `;UnpitchedVocals=${unpitchedVocals ? '1' : '0'}{n}`
        content += `;Convert=${convert ? '1' : '0'}{n}`
        content += `;2xBass=${doubleKick ? '1' : '0'}{n}`

        const rhythmKeys = rhythmOn === 'keys'
        content += `;RhythmKeys=${rhythmKeys ? '1' : '0'}{n}`
        const rhythmBass = rhythmOn === 'bass'
        content += `;RhythmBass=${rhythmBass ? '1' : '0'}{n}`

        const CATemh = emh === 'cat'
        content += `;CATemh=${CATemh ? '1' : '0'}{n}`
        const expertOnly = emh === 'expert_only'
        content += `;ExpertOnly=${expertOnly ? '1' : '0'}{n}`

        if (original_id) content += `;ORIG_ID=${original_id}{n}`

        map.set('magma', DTAIO.useComment(tabNewLineFormatter(content)))
      }

      if (omitUnusedValues) {
        if (map.get('guide_pitch_volume') && (map.get('guide_pitch_volume') as FloatValueObject).__value === -3) map.delete('guide_pitch_volume')
      }

      io.addValue(newID ?? id, map.toJSON())
    }
  }

  return io.toString()
}
