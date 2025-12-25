import zod, { type infer as ZodInfer } from 'zod'
import type { ServerHandler } from '../../lib.exports'
import { response } from '../../core.exports'
import { User } from '../../models/User'
import { userLoginErrorHandler } from './login.error'

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
  errorHandler: userLoginErrorHandler,
} as const
