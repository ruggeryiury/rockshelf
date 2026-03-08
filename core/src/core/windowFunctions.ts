import { useHandler } from '../core.exports'

/**
 * Minimizes the application window.
 */
export const windowMinimize = useHandler((win): void => win.minimize())

/**
 * Maximizes the application window.
 * - - - -
 * @returns {boolean} True if the window has been maximized, false if it has been restored.
 */
export const windowMaximize = useHandler((win): boolean => {
  if (win.isMaximized()) {
    win.restore()
    return false
  }
  win.maximize()
  return true
})

/**
 * Closes the application.
 */
export const windowClose = useHandler((win): void => win.close())
