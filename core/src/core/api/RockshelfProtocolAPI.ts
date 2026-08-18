import mime from 'mime'
import { isDir, type FilePath } from 'node-lib'
import { RockshelfFileSystemAPI } from './RockshelfFileSystemAPI'
import { net, protocol } from 'electron'
import { pathToFileURL } from 'node:url'
import { userData } from '../../init'

/**
 * A class with static methods that translates URLs from different protocols.
 */
export class RockshelfProtocolAPI {
  /**
   * Resolves the path from the `rbicons://` protocol.
   * - - - -
   * @param {string} url The url you want to resolve.
   * @returns {FilePath}
   */
  static rbiconsToPath(url: string): FilePath {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname === 'songPackage' ? 'custom' : urlObj.hostname
    const root = RockshelfFileSystemAPI.coreModuleRootDir()
    let filePath = root.gotoFile(`bin/icons/${hostname}.webp`)
    if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)
    return filePath
  }

  /**
   * Resolves the path from the `temp://` protocol.
   * - - - -
   * @param {string} url The url you want to resolve.
   * @returns {FilePath}
   */
  static tempProtocolToPath(url: string): FilePath {
    const urlObj = new URL(url)
    const hostname = decodeURIComponent(urlObj.hostname)
    const root = RockshelfFileSystemAPI.tempDir()
    const filePath = root.gotoFile(`${hostname}`)
    return filePath
  }

  static privileges = { standard: false, secure: true, supportFetchAPI: true } as Electron.Privileges

  static initProtocolPrivileges(): void {
    protocol.registerSchemesAsPrivileged([
      // Static image protocols
      {
        scheme: 'rbicons',
        privileges: this.privileges,
      },
      {
        scheme: 'rb1packimg',
        privileges: this.privileges,
      },
      {
        scheme: 'rb3packimg',
        privileges: this.privileges,
      },

      // Artwork protocol for RB1 and RB2 songs
      {
        scheme: 'artworks',
        privileges: this.privileges,
      },
      { scheme: 'temp', privileges: this.privileges },
    ])
  }

  /**
   * Initiates all protocols for image requests for Rockshelf.
   */
  static init(): void {
    protocol.handle('rbicons', async (request) => {
      const url = new URL(request.url)
      const hostname = url.hostname === 'songPackage' ? 'custom' : url.hostname
      const root = RockshelfFileSystemAPI.coreModuleRootDir()
      let filePath = root.gotoFile(`bin/icons/${hostname}.webp`)
      if (!filePath.exists) filePath = root.gotoFile(`bin/icons/custom.webp`)

      if (!filePath.path.startsWith(root.path) || isDir(filePath))
        return new Response('Forbidden', {
          status: 403,
        })

      try {
        const fileBuffer = await filePath.read()
        return new Response(fileBuffer, {
          headers: { 'Content-Type': 'image/jpg', 'Cache-Control': 'no-store' },
          status: 200,
        })
      } catch (err) {
        return new Response('Not Found', {
          status: 404,
        })
      }
    })

    protocol.handle('rb1packimg', async (request) => {
      if (!userData.userConfig) throw new Error('User config data is not loaded.')
      const url = new URL(request.url)
      const hostname = decodeURIComponent(url.hostname)
      const root = RockshelfFileSystemAPI.rb1UsrDir(userData.userConfig.devhdd0Path)
      const filePath = root.gotoFile(`${hostname}/folder.jpg`)

      if (!filePath.path.startsWith(root.path) || isDir(filePath))
        return new Response('Forbidden', {
          status: 403,
        })

      try {
        const fileBuffer = await filePath.read()
        return new Response(fileBuffer, {
          headers: { 'Content-Type': 'image/jpg', 'Cache-Control': 'no-store' },
          status: 200,
        })
      } catch (err) {
        return new Response('Not Found', {
          status: 404,
        })
      }
    })

    protocol.handle('rb3packimg', async (request) => {
      if (!userData.userConfig) throw new Error('User config data is not loaded.')
      const url = new URL(request.url)
      const hostname = decodeURIComponent(url.hostname)
      const root = RockshelfFileSystemAPI.rb3UsrDir(userData.userConfig.devhdd0Path)
      const filePath = root.gotoFile(`${hostname}/folder.jpg`)

      if (!filePath.path.startsWith(root.path) || isDir(filePath))
        return new Response('Forbidden', {
          status: 403,
        })

      try {
        const fileBuffer = await filePath.read()
        return new Response(fileBuffer, {
          headers: { 'Content-Type': 'image/jpg', 'Cache-Control': 'no-store' },
          status: 200,
        })
      } catch (err) {
        return new Response('Not Found', {
          status: 404,
        })
      }
    })

    protocol.handle('artworks', async (request) => {
      const url = new URL(request.url)
      const hostname = decodeURIComponent(url.hostname)
      const root = RockshelfFileSystemAPI.coreModuleRootDir()
      const filePath = root.gotoFile(`bin/artworks/${hostname}_keep.png`)

      if (!filePath.path.startsWith(root.path) || isDir(filePath))
        return new Response('Forbidden', {
          status: 403,
        })

      try {
        return await net.fetch(pathToFileURL(filePath.path).toString(), { headers: { 'Content-Type': 'image/png' } })
      } catch (err) {
        return new Response('Not Found', {
          status: 404,
        })
      }
    })

    protocol.handle('temp', async (request) => {
      const url = new URL(request.url)
      const hostname = decodeURIComponent(url.hostname)
      const root = RockshelfFileSystemAPI.tempDir()
      const filePath = root.gotoFile(`${hostname}`)
      const contentType = mime.getType(hostname) || 'application/octet-stream'

      if (!filePath.path.startsWith(root.path) || isDir(filePath))
        return new Response('Forbidden', {
          status: 403,
        })

      try {
        return await net.fetch(pathToFileURL(filePath.path).toString(), { cache: 'reload', headers: { 'Content-Type': contentType } })
      } catch (err) {
        return new Response('Not Found', {
          status: 404,
        })
      }
    })
  }
}
