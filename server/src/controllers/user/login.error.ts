import { ZodError } from 'zod'
import type { ServerErrorHandler } from '../../lib.exports'
import { ErrorHandlers, response } from '../../core.exports'
import type { UserLogin } from './login'

export const userLoginErrorHandler: ServerErrorHandler<UserLogin> = (error, req, reply) => {
  if (ErrorHandlers.json(error, req, reply)) return
  if (ErrorHandlers.generic(error, reply)) return

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

  return ErrorHandlers.unknown(error, reply)
}
