import 'dotenv/config'
import fastify from 'fastify'
import { readEnv } from './lib.exports'
import { loggerConfig } from './config'
import { Server } from 'socket.io'
import { mongoDBConnectPlugin } from './core.exports'
import { initRoutes } from './core/initRoutes'

console.log('Rockshelf Server --- v0.0.1\n')

export const app = fastify({ logger: loggerConfig })
const { port, mongoDBURI } = readEnv()

const io = new Server(app.server)
io.on('connection', (socket) => {
  console.log(socket)
})

const main = async () => {
  await app.register(mongoDBConnectPlugin, { mongoDBURI })

  initRoutes()

  try {
    await app.listen({ port })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()
