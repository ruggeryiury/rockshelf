import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import mongoose from 'mongoose'

interface MongoDbConnectPluginOptions {
  /**
   * The MongoDB connection URI.
   */
  mongoDBURI: string
}

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
export const mongoDBConnectPlugin = fastifyPlugin<MongoDbConnectPluginOptions>(async (instance, { mongoDBURI }) => {
  instance.log.info('Trying to connect to MongoDB...')
  mongoose.connection.on('connected', () => instance.log.info(`MongoDB database connected successfully`))
  mongoose.connection.on('disconnected', () => instance.log.warn(`MongoDB database disconnected`))
  await mongoose.connect(mongoDBURI)
})
