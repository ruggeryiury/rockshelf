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
    .regex(/[A-Z|a-z|0-9]/),
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

    // #region ZodError
    if (error instanceof ZodError) {
      const issue = error.issues[0]
      if (issue.code === 'invalid_type') {
        // Empty body
        if (issue.message === 'Invalid input: expected object, received undefined' && issue.path.length === 0) return response(reply, { code: 'err_user_register_no_body' })
        // No email
        if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'email') return response(reply, { code: 'err_user_register_no_email' })
        // No username
        if (issue.message === 'Invalid input: expected string, received undefined' && issue.path[0] === 'username') return response(reply, { code: 'err_user_register_no_username' })
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

      // Password validation
      if (issue.code === 'invalid_format' && issue.path[0] === 'password') {
        if (issue.pattern === '/[a-z]/') return response(reply, { code: 'err_user_register_password_nolowercase' })
        if (issue.pattern === '/[A-Z]/') return response(reply, { code: 'err_user_register_password_nouppercase' })
        if (issue.pattern === '/[0-9]/') return response(reply, { code: 'err_user_register_password_nonumber' })
        if (issue.pattern === '/[^A-Za-z0-9]/') return response(reply, { code: 'err_user_register_password_nospecialchar' })
      }

      if (issue.code === 'custom') return response(reply, { code: issue.message })
    }

    // #region MongoError

    // Duplicated e-mail
    if (error instanceof MongoError && Number(error.code) === 11000 && 'keyValue' in error && error.keyValue !== null && error.keyValue !== undefined && 'email' in (error.keyValue as Record<string, string>)) {
      const email = (error.keyValue as Record<string, string>).email

      return response(reply, { code: 'err_user_register_duplicated_email', messageValues: { email } })
    }

    // Duplicated username
    if (error instanceof MongoError && Number(error.code) === 11000 && 'keyValue' in error && error.keyValue !== null && error.keyValue !== undefined && 'username' in (error.keyValue as Record<string, string>)) {
      const username = (error.keyValue as Record<string, string>).username

      return response(reply, { code: 'err_user_register_duplicated_username', messageValues: { username } })
    }

    if (ErrorHandlers.generic(error, reply)) return
    if (ErrorHandlers.unknown(error, reply)) return
  } as ServerErrorHandler<UserRegister>,
} as const
