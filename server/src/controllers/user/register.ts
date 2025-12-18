import zod, { type infer as ZodInfer } from 'zod'
import { ErrorHandlers, serverReply } from '../../core.exports'
import type { ServerErrorHandler, ServerHandler } from '../../lib.exports'

export const userRegisterBodySchema = zod.object({
  email: zod.email(),
  username: zod.string(),
  password: zod.string(),
})

export interface IUserRegister {
  body: ZodInfer<typeof userRegisterBodySchema>
}

const handler: ServerHandler<IUserRegister> = async function (req, reply) {
  const body = userRegisterBodySchema.parse(req.body)
  return serverReply(reply, 'ok')
}

export const userRegisterCtrl = {
  handler,
  errorHandler: function (error, req, reply) {
    ErrorHandlers.json(error, req, reply)
    ErrorHandlers.generic(error, reply)
    ErrorHandlers.unknown(error, reply)
  } as ServerErrorHandler,
} as const
