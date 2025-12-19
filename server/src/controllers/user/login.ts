import zod, { ZodError, type infer as ZodInfer } from 'zod'
import type { ServerErrorHandler, ServerHandler } from '../../lib.exports'
import { ErrorHandlers, response } from '../../core.exports'
import { User } from '../../models/User'

export const userLoginBodySchema = zod.object({
  email: zod.email(),
  password: zod.string().min(8).max(32),
})

export interface UserLogin {
  body: ZodInfer<typeof userLoginBodySchema>
}

const handler: ServerHandler<UserLogin> = async function (req, reply) {
  const { email, password } = userLoginBodySchema.parse(req.body)
  const user = await User.findByCredentials(email, password)
  const token = await user.generateToken()
  return response(reply, { code: 'suceess_user_login', data: { token } })
}

export const userLoginCtrl = {
  handler,
  errorHandler: function (error, req, reply) {
    if (ErrorHandlers.json(error, req, reply)) return
    if (ErrorHandlers.generic(error, reply)) return
    if (ErrorHandlers.route.userLogin(error, req, reply)) return
    if (ErrorHandlers.unknown(error, reply)) return
  } as ServerErrorHandler<UserLogin>,
} as const
