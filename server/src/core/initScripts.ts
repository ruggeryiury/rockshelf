import fastifyPlugin from 'fastify-plugin'
import mongoose from 'mongoose'
import { DirPath, execAsync, FilePath } from 'node-lib'

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
    if (publicDir.exists) {
      return console.log('CORE_INIT: Public folder already exists, skipping folder creation')
    }

    await publicDir.mkDir()
    return console.log(`CORE_INIT: Public folder created successfully. Path: ${publicDir.path}`)
  }

  static async checkTempFolder(dev: boolean): Promise<void> {
    const tempFolder = DirPath.of('temp')

    if (tempFolder.exists) {
      const allFiles = await tempFolder.readDir(true)

      if (allFiles.length === 0) {
        return console.log(`CORE_INIT: No files on temp folder`)
      }

      for (const file of allFiles) {
        await FilePath.of(file).delete()
      }

      return console.log(`${allFiles.length} temporary file${allFiles.length !== 1 ? 's' : ''} deleted`)
    }

    return console.log(`Temp folder created successfully. Path: ${tempFolder.path}\n`)
  }

  static async checkDeps() {
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
     *
     * @throws {Error} If Mongoose fails to establish a connection.
     */
    mongoDBConnect: fastifyPlugin<MongoDbConnectPluginOptions>(async (app, data) => {
      app.log.info('Trying to connect to MongoDB...')
      mongoose.connection.on('connected', () => app.log.info(`MongoDB database connected successfully`))
      mongoose.connection.on('disconnected', () => app.log.warn(`MongoDB database disconnected`))
      await mongoose.connect(data.mongoDBURI)
    }),
  } as const
}
