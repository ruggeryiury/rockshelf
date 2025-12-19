import zod, { ZodError, type infer as ZodInfer } from 'zod'
import { ErrorHandlers, response } from '../../core.exports'
import type { ServerErrorHandler, ServerHandler } from '../../lib.exports'
import { User } from '../../models/User'
import { MongoError } from 'mongodb'

export const userRegisterBodySchema = zod.object({
  email: zod.email(),
  username: zod.string().min(3).max(32),
  password: zod
    .string()
    .min(8)
    .max(32)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
})

export interface UserRegister {
  body: ZodInfer<typeof userRegisterBodySchema>
}

const handler: ServerHandler<UserRegister> = async function (req, reply) {
  const body = userRegisterBodySchema.parse(req.body)
  const user = new User(body)
  await user.checkForCaseInsensitivity()
  await user.save()
  return response(reply, { code: 'success_user_register' })
}

export const userRegisterCtrl = {
  handler,
  errorHandler: function (error, req, reply) {
    if (ErrorHandlers.json(error, req, reply)) return
    if (ErrorHandlers.generic(error, reply)) return
    if (ErrorHandlers.route.userRegister(error, req, reply)) return
    if (ErrorHandlers.unknown(error, reply)) return
  } as ServerErrorHandler<UserRegister>,
} as const
