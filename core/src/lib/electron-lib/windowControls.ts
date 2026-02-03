import { useHandler } from './useHandler'

/**
 * Minimizes the application window.
 */
export const winMinimize = useHandler((win): void => win.minimize())

/**
 * Maximizes the application window.
 * - - - -
 * @returns {boolean} True if the window has been maximized, false if it has been restored.
 */
export const winMaximize = useHandler((win): boolean => {
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
export const winClose = useHandler((win): void => win.close())
