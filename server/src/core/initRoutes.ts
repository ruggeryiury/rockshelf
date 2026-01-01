import type { FastifyInstance } from 'fastify'
import { customUploadFile } from '../controllers/uploadFile'
import { userLogin } from '../controllers/userLogin'
import { userProfile } from '../controllers/userProfile'
import { userRegister } from '../controllers/userRegister'

/**
 * Initialize all routes from the server.
 */
export const initRoutes = (app: FastifyInstance) => {
  //#region Status
  app.route({
    method: ['GET', 'HEAD'],
    url: '/status',
    logLevel: 'warn',
    errorHandler: (_, __, reply) => reply.status(503).send(),
    handler: (_, reply) => reply.send(),
  })

  // #region User
  app.route(userRegister)
  app.route(userLogin)
  app.route(userProfile)

  // #region Song
  app.route(customUploadFile)
}
