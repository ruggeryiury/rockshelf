import 'dotenv/config'
import fastify from 'fastify'
import { isDev, readEnv } from './lib.exports'
import { loggerConfig } from './config'
import { InitScripts, response } from './core.exports'
import { initRoutes } from './core/initRoutes'
import fastifyCors from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'

// Initialize Fastify app
export const app = fastify({ logger: loggerConfig, disableRequestLogging: true })

app.setNotFoundHandler((req, reply) => response(reply, { code: 'err_notfound', messageValues: { method: req.method.toUpperCase(), url: req.url } }))

const dev = isDev()
console.log(`Rockshelf Server --- v0.0.1\nInitializing server${dev && ' on development mode'}...\n`)

await InitScripts.checkPublicFolder(dev)
await InitScripts.checkTempFolder(dev)
await InitScripts.checkDeps()

const { port, mongoDBURI } = readEnv()

await app.register(InitScripts.plugins.mongoDBConnect, { mongoDBURI })
await app.register(fastifyCors, { origin: '*' })
await app.register(fastifyMultipart)
// await app.register(fastifyWebsocket)

initRoutes(app)

try {
  await app.listen({ port })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
