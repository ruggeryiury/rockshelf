import { useHandler } from '../core.exports'

export const openConsoleWindow = useHandler(async (win) => {
  win.webContents.openDevTools({ mode: 'detach' })
  return new Promise((res) => setTimeout(() => res(null), 10))
})
