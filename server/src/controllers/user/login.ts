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

    // #region ZodError
    if (error instanceof ZodError) {
      const issue = error.issues[0]
      if (issue.code === 'invalid_type') {
        // Empty body
        if (issue.message === 'Invalid input: expected object, received undefined' && issue.path.length === 0) return response(reply, { code: 'err_user_register_no_body' })
        // No email
        if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'email') return response(reply, { code: 'err_user_register_no_email' })
        // No password
        if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'password') return response(reply, { code: 'err_user_register_no_password' })
      }
      if (issue.code === 'too_small') {
        // Too small username
        if (issue.path[0] === 'username') return response(reply, { code: 'err_user_register_username_toosmall' })
        // Too small password
        if (issue.path[0] === 'password') return response(reply, { code: 'err_user_register_password_toosmall' })
      }
      if (issue.code === 'too_big') {
        // Too big username
        if (issue.path[0] === 'username') return response(reply, { code: 'err_user_register_username_toobig' })
        // Too big password
        if (issue.path[0] === 'password') return response(reply, { code: 'err_user_register_password_toobig' })
      }

      // Bad e-mail format
      if (issue.code === 'invalid_format' && issue.path[0] === 'email') return response(reply, { code: 'err_user_register_email_invalid' })

      // Any custom
      if (issue.code === 'custom') return response(reply, { code: issue.message })
    }

    if (ErrorHandlers.generic(error, reply)) return
    if (ErrorHandlers.unknown(error, reply)) return
  } as ServerErrorHandler<UserLogin>,
} as const
