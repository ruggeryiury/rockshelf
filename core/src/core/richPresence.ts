import { Client, type SetActivity } from '@xhayper/discord-rpc'
import { BrowserWindow, ipcMain } from 'electron'
import { getBrowserWindowFromEvent, getDiscordRPJSONFile, getLocaleStringFromRenderer, sendMessageBox, type UserConfigObject } from '../core.exports'
import { DirPath, pathLikeToDirPath, type FilePath } from 'node-lib'
import { sleep, underlineToCamelCase } from '../lib.exports'
import { slashQToQuote } from '../lib/rbtools/utils.exports'

const clientId = '1125571051607298190'
const interval = 3000 // 3 seconds
let startTimestamp = 0
let prevActivity: SetActivity = {}

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

const instrumentNameMap = {
  GUITAR: 'guitar',
  REAL_GUITAR: 'proGuitar',
  KEYS: 'keys',
  DRUMS: 'drums',
  REAL_KEYS: 'proKeys',
  REAL_BASS: 'proBass',
  BASS: 'bass',
  VOCALS: 'vocals',
} as const

export const initRichPresence = async (): Promise<never> => {
  let isStarted = false
  let devhdd0Path: DirPath | undefined
  let rpJSONPath: FilePath | undefined
  let rpJSONData: RB3DeluxeRichPresenteObject | undefined
  let prevHash = ''

  const rpc = new Client({ clientId })
  try {
    await rpc.login()
  } catch (err) {}

  ipcMain.handle('discordRPSetUserConfig', (_, userCnfg: UserConfigObject) => {
    devhdd0Path = pathLikeToDirPath(userCnfg.devhdd0Path)
    rpJSONPath = getDiscordRPJSONFile(devhdd0Path)
    return true
  })

  ipcMain.handle('discordRPStart', async (event) => {
    try {
      if (!rpc.isConnected) {
        await rpc.login()
      }

      isStarted = true
      return true
    } catch (err) {
      const win = getBrowserWindowFromEvent(event)
      sendMessageBox(win, { type: 'error', method: 'initRichPresence', code: 'login' })
      isStarted = false
      return false
    }
  })

  ipcMain.handle('discordRPDestroy', async (event) => {
    if (isStarted) {
      await rpc.destroy()
      isStarted = false
      prevHash = ''
      return true
    } else {
      sendMessageBox(getBrowserWindowFromEvent(event), { type: 'error', method: 'initRichPresence', code: 'destroy' })
      return false
    }
  })

  while (true) {
    if (rpJSONPath && isStarted) {
      if (!rpJSONPath.exists) {
        await sleep(interval)
        continue
      }
      const jsonDataHash = await rpJSONPath.generateHash('sha1')
      if (jsonDataHash === prevHash) {
        await sleep(interval)
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
            const instrumentName = await getLocaleStringFromRenderer(win, instrumentNameMap[instrument.instrument as keyof typeof instrumentNameMap])
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
        startTimestamp,
      }

      const nowTimestamp = Math.floor(Date.now() / 1000)
      if (JSON.stringify(prevActivity) !== JSON.stringify(activity)) {
        startTimestamp = nowTimestamp
        activity.startTimestamp = nowTimestamp
      }

      await rpc.user?.setActivity(activity)
      prevActivity = activity

      await sleep(interval)
      continue
    }

    await sleep(interval)
    continue
  }
}
