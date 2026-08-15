import type { BrowserWindow } from 'electron'

export type DialogScreenPromptsTypes = 'corruptedUserConfig' | 'corruptedPackagesCache' | 'parsingErrorsOnPackagesDTA' | 'confirmDeletePackage' | 'corruptedGameInstallation'

/**
 * Sends a message that controls the `DialogScreen` component on the renderer.
 * - - - -
 * @param {BrowserWindow} win The `BrowserWindow` instance of the event emitter.
 * @param {DialogScreenPromptsTypes} code The message code you want to show on the renderer.
 * @returns {true}
 */
export const sendDialog = (win: BrowserWindow, code: DialogScreenPromptsTypes): true => {
  win.webContents.send('sendDialog', code)
  return true
}
