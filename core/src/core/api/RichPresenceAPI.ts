import { Client, type SetActivity } from '@xhayper/discord-rpc'
import { BrowserWindow, ipcMain } from 'electron'
import { pathLikeToDirPath, type DirPath, type FilePath } from 'node-lib'
import type { UserConfigObject } from './UserDataAPI'
import { RockshelfFileSystemAPI } from './RockshelfFileSystemAPI'
import { getBrowserWindowFromEvent, getLocaleStringFromRenderer, sendMessageBox } from '../../core.exports'
import { sleep, underlineToCamelCase } from '../../lib.exports'
import { slashQToQuote } from '../../lib/rbtools/utils.exports'

const handle = ipcMain.handle.bind(ipcMain)

export interface RB3DeluxeRichPresenteObject {
  'Game mode': 'defaults' | 'audition' | 'qp_coop' | 'party_shuffle' | 'tour' | 'trainer' | 'practice' | 'career' | 'autoplay' | 'jukebox' | 'dx_play_a_show'
  'Loaded Song'?: string
  Songname?: string
  Artist?: string
  Year?: string
  Album?: string
  Genre?: string
  Subgenre?: string
  Source?: string
  Author?: string
  Online: string
  SelectedInstruments?: {
    active: boolean
    instrument: string
    difficulty: string
  }[]
  'Screen Category': string
  'Current Screen': string
}

/**
 * A class that controls the Discord's Rich Presence event emitter.
 */
export class RichPresenceAPI {
  static clientID = '1125571051607298190' as const
  static interval = 3000 as const
  static startTimestamp = 0
  static prevActivity: SetActivity = {}
  static instrumentNameMap = {
    GUITAR: 'guitar',
    REAL_GUITAR: 'proGuitar',
    KEYS: 'keys',
    DRUMS: 'drums',
    REAL_KEYS: 'proKeys',
    REAL_BASS: 'proBass',
    BASS: 'bass',
    VOCALS: 'vocals',
  } as const
  static async init() {
    let isStarted = false
    let devhdd0Path: DirPath | undefined
    let rpJSONPath: FilePath | undefined
    let rpJSONData: RB3DeluxeRichPresenteObject | undefined
    let prevHash = ''

    handle('discord.setUserConfig', (_, userCnfg: UserConfigObject): void => {
      devhdd0Path = pathLikeToDirPath(userCnfg.devhdd0Path)
      rpJSONPath = RockshelfFileSystemAPI.dxRichPresenceFile(devhdd0Path)
    })

    handle('discord.start', async (event): Promise<boolean> => {
      try {
        if (!rpc.isConnected) {
          await rpc.login()
        }

        isStarted = true
        return true
      } catch (err) {
        sendMessageBox(getBrowserWindowFromEvent(event), { type: 'error', code: 'initRichPresenceLogin' })
        isStarted = false
        return false
      }
    })

    handle('discord.stop', async (event): Promise<boolean> => {
      if (isStarted) {
        await rpc.destroy()
        isStarted = false
        prevHash = ''
        return true
      } else {
        sendMessageBox(getBrowserWindowFromEvent(event), { type: 'error', code: 'initRichPresenceDestroy' })
        return false
      }
    })

    const rpc = new Client({ clientId: RichPresenceAPI.clientID })

    try {
      await rpc.login()
    } catch (err) {
      // Do nothing
    }

    while (true) {
      if (rpJSONPath && isStarted) {
        if (!rpJSONPath.exists) {
          await sleep(RichPresenceAPI.interval)
          continue
        }
        const jsonDataHash = await rpJSONPath.generateHash('sha1')
        if (jsonDataHash === prevHash) {
          await sleep(RichPresenceAPI.interval)
          continue
        }

        prevHash = jsonDataHash
        const rawJSONData = await rpJSONPath.read('utf-8')
        const processedJSONData = slashQToQuote(rawJSONData.trim().slice(1, -1))
        rpJSONData = JSON.parse(processedJSONData) as RB3DeluxeRichPresenteObject

        const win = BrowserWindow.getAllWindows()[0]
        const gameMode = await getLocaleStringFromRenderer(win, `rpGameMode${underlineToCamelCase(rpJSONData['Game mode'], true)}${rpJSONData.Online === 'true' ? 'Online' : ''}`)
        let details = ''
        let activeInstrumentText = ''
        let smallImageKey = 'default_small_image_name'
        let smallImageText: string | undefined = undefined

        const activeInstrumentsCount = (rpJSONData.SelectedInstruments ?? []).filter((i) => i.active).length

        if (activeInstrumentsCount > 1) {
          const playersCount = await getLocaleStringFromRenderer(win, activeInstrumentsCount === 1 ? 'playerCount' : 'playerCountPlural', { playersCount: activeInstrumentsCount })
          activeInstrumentText = `${playersCount}:`
          smallImageKey = 'band'
          smallImageText = playersCount
        } else if (activeInstrumentsCount === 1) {
          activeInstrumentText = 'Solo:'
          for (const instrument of rpJSONData.SelectedInstruments ?? []) {
            if (instrument.active) {
              const instrumentName = await getLocaleStringFromRenderer(win, RichPresenceAPI.instrumentNameMap[instrument.instrument as keyof typeof RichPresenceAPI.instrumentNameMap])
              const diff = await getLocaleStringFromRenderer(win, `diff${instrument.difficulty}`)
              smallImageKey = instrument.instrument.toLowerCase()
              smallImageText = `${instrumentName}, ${diff}`
            }
          }
        } else {
          activeInstrumentText = ''
          smallImageKey = 'default_small_image_name'
          smallImageText = undefined
        }

        details = `${activeInstrumentText} ${gameMode}`

        const activity: SetActivity = {
          largeImageKey: 'banner',
          largeImageText: 'Rock Band 3 Deluxe',
          details,
          state: rpJSONData['Loaded Song'] || (await getLocaleStringFromRenderer(win, 'rpNoSongLoaded')),
          smallImageKey,
          smallImageText,
          startTimestamp: RichPresenceAPI.startTimestamp,
        }

        const nowTimestamp = Math.floor(Date.now() / 1000)
        if (JSON.stringify(RichPresenceAPI.prevActivity) !== JSON.stringify(activity)) {
          RichPresenceAPI.startTimestamp = nowTimestamp
          activity.startTimestamp = nowTimestamp
        }

        await rpc.user?.setActivity(activity)
        RichPresenceAPI.prevActivity = activity

        await sleep(RichPresenceAPI.interval)
        continue
      }

      await sleep(RichPresenceAPI.interval)
      continue
    }
  }
}
