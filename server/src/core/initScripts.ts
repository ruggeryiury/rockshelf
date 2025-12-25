import fastifyPlugin from 'fastify-plugin'
import mongoose from 'mongoose'
import { DirPath, execAsync, FilePath } from 'node-lib'
import { app } from '..'

interface MongoDbConnectPluginOptions {
  /**
   * The MongoDB connection URI.
   */
  mongoDBURI: string
}

export class InitScripts {
  /**
   * Checks the existence of a `public` folder and creates one if it doesn't.
   */
  static async checkPublicFolder(dev: boolean): Promise<void> {
    const publicDir = DirPath.of('public')
    const artworkDir = publicDir.gotoDir('artwork')
    const packagesDir = publicDir.gotoDir('packages')

    if (!publicDir.exists) {
      app.log.info('INIT_SCRIPTS: Public folder not found, creating public folder template...')
      await publicDir.mkDir()
      await artworkDir.mkDir()
      await packagesDir.mkDir()
      return app.log.info(`INIT_SCRIPTS: Public folder created successfully. Path: ${publicDir.path}`)
    }

    if (!artworkDir.exists) await artworkDir.mkDir()
    if (!packagesDir.exists) await packagesDir.mkDir()

    return app.log.info(`INIT_SCRIPTS: Public folder exists, skipping folder template creation.`)
  }

  /**
   * Checks the existence of a `temp` folder (creates one if it doesn't) and cleans the folder.
   */
  static async checkTempFolder(dev: boolean): Promise<void> {
    const tempFolder = DirPath.of('temp')

    if (tempFolder.exists) {
      const allFiles = await tempFolder.readDir(true)

      if (allFiles.length === 0) {
        return app.log.info(`INIT_SCRIPTS: No files on temp folder`)
      }

      for (const file of allFiles) {
        if (file instanceof FilePath) await file.delete()
      }

      return app.log.info(`INIT_SCRIPTS: ${allFiles.length} temporary file${allFiles.length !== 1 ? 's' : ''} deleted`)
    }

    return app.log.info(`INIT_SCRIPTS: Temp folder created successfully. Path: ${tempFolder.path}`)
  }

  static async checkDeps() {
    app.log.info('INIT_SCRIPTS: Checking server dependencies...')
    const node = process.versions.node

    const python = await execAsync('python --version')
    if (python.stderr) {
      console.log('ERROR: No Python v3 installed. Make sure you add python to PATH')
      process.exit(1)
    }

    const pip = await execAsync('pip --version')
    if (pip.stderr) {
      console.log('ERROR: No PIP v3 installed')
      process.exit(1)
    }

    const pipList = await execAsync('pip list')

    return {
      node,
      python: python.stdout.trim().split(' ')[1],
      pip: pip.stdout.trim().split(' ')[1],
      pipList: pipList.stdout,
    }
  }

  // #region Plugins
  static readonly plugins = {
    /**
     * Fastify plugin responsible for establishing and monitoring
     * a MongoDB connection using Mongoose.
     *
     * This plugin:
     * - Attempts to connect to MongoDB on server startup
     * - Logs successful connections
     * - Logs fatal errors when the connection is lost
     *
     * The MongoDB connection URI must be provided via plugin options.
     * - - - -
     * @param {FastifyInstance} instance - The Fastify instance the plugin is registered on.
     * @param options - Plugin options.
     * @param options.mongoDBURI - MongoDB connection string used by Mongoose.
     * @throws {Error} If Mongoose fails to establish a connection.
     */
    mongoDBConnect: fastifyPlugin<MongoDbConnectPluginOptions>(async (app, data) => {
      app.log.info('DB_CONNECT: Trying to connect to MongoDB...')
      mongoose.connection.on('connected', () => app.log.info(`DB_CONNECT: MongoDB database connected successfully`))
      mongoose.connection.on('disconnected', () => app.log.warn(`DB_CONNECT: MongoDB database disconnected`))
      await mongoose.connect(data.mongoDBURI)
    }),
  } as const
}
