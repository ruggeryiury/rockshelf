import { app } from '..'

export const StatusRouter = () => {
  app.route({
    method: ['GET', 'HEAD'],
    url: '/status',
    logLevel: 'warn',
    errorHandler: (_, __, reply) => reply.status(503).send(),
    handler: (_, reply) => reply.send(),
  })
}
