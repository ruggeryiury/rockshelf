import { useHandler } from './useHandler'

export const winMinimize = useHandler((win): void => win.minimize())
export const winMaximize = useHandler((win): boolean => {
  if (win.isMaximized()) {
    win.restore()
    return false
  }
  win.maximize()
  return true
})
export const winClose = useHandler((win): void => win.close())
